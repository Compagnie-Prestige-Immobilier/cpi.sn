/**
 * WordPress → Payload content migration.
 *
 * Reads the audit in content-audit/ (extracted from the live REST API) and
 * writes it into Payload via the Local API.
 *
 *   npm run import          import everything, skipping what already exists
 *   npm run import -- --fresh   wipe imported collections first
 *   npm run import -- --no-media   skip image downloads (fast schema check)
 *
 * Idempotent: re-running matches on slug and updates rather than duplicating,
 * so the taxonomy mapping can be corrected and replayed cheaply.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload, type Payload } from 'payload'
import config from '../../payload.config'
import { slugify } from '../fields/slug'
import { mapProperty } from './taxonomy-map'
import { htmlToLexical, htmlToText, emptyLexical, extractImages, lexicalText } from './lexical'
import { importImage, mediaStats, primeMediaCache, normalizeUrl } from './media'
import { rawHtml } from './raw-html'
import { existsSync } from 'node:fs'

/** attachment id → source URL, resolved from the legacy media endpoint. */
const galleryUrls: Record<string, string> = existsSync('.migration-cache/gallery-urls.json')
  ? JSON.parse(await readFile('.migration-cache/gallery-urls.json', 'utf8'))
  : {}

const AUDIT = path.resolve(process.cwd(), 'content-audit')
const args = process.argv.slice(2)
const FRESH = args.includes('--fresh')
const NO_MEDIA = args.includes('--no-media')

const readJson = async <T>(file: string): Promise<T> =>
  JSON.parse(await readFile(path.join(AUDIT, '_data', file), 'utf8'))

const readMd = async (file: string): Promise<string> =>
  readFile(path.join(AUDIT, file), 'utf8').catch(() => '')

/**
 * Body HTML for a document.
 *
 * NOT read from content-audit/*.md — those are turndown markdown, and feeding
 * markdown to an HTML converter leaves literal `**asterisks**` in the output.
 * The original HTML comes from the WordPress REST API, cached on disk.
 */
const sourceHtml = rawHtml

const isDemo = (p: { address?: string }) =>
  /,\s*USA$/i.test(p.address ?? '') || /\b(IL|NY|FL|CA)\s+\d{5}/.test(p.address ?? '')

type AuditProperty = {
  id: number; title: string; slug: string; url: string; file: string
  type: string[]; status: string[]; city: string[]; area: string[]; features: string[]
  price: string; size: string; sizeUnit: string; bedrooms: string; bathrooms: string
  year: string; address: string; location: string; featuredImage: string
  video: string; modified: string; seoTitle?: string; seoDesc?: string
}

type AuditPost = {
  id: number; title: string; slug: string; url: string; file: string
  chars: number; images: number; modified: string; seoTitle: string; seoDesc: string
}

async function findBySlug(payload: Payload, collection: string, slug: string) {
  const res = await payload.find({
    collection: collection as 'properties',
    // Look up by the SAME normalisation the slug hook applies on write —
    // otherwise a percent-encoded source slug never matches what was stored and
    // the re-run tries to create a duplicate.
    where: { slug: { equals: slugify(slug) } },
    limit: 1,
    locale: 'fr',
    overrideAccess: true,
    draft: true,
  })
  return res.docs[0] ?? null
}

/** Create, or update in place when the slug already exists. */
async function upsert(
  payload: Payload,
  collection: string,
  slug: string,
  data: Record<string, unknown>,
) {
  const existing = await findBySlug(payload, collection, slug)
  if (existing) {
    return payload.update({
      collection: collection as 'properties',
      id: existing.id,
      data: data as never,
      locale: 'fr',
      overrideAccess: true,
    })
  }
  return payload.create({
    collection: collection as 'properties',
    data: { ...data, slug: slugify(slug) } as never,
    locale: 'fr',
    overrideAccess: true,
  })
}

async function main() {
  const payload = await getPayload({ config })
  const t0 = Date.now()

  if (FRESH) {
    console.log('\n▸ Wiping imported collections…')
    for (const c of ['properties', 'posts', 'pages', 'cities', 'amenities', 'categories', 'media']) {
      await payload.delete({
        collection: c as 'properties',
        where: { id: { greater_than: 0 } },
        overrideAccess: true,
      })
    }
  }

  await primeMediaCache(payload)

  // ── Taxonomies ────────────────────────────────────────────────────────────
  console.log('\n▸ Taxonomies')
  const tax = await readJson<Record<string, Record<string, { name: string; slug: string; count: number }>>>(
    'taxonomies.json',
  )

  const cityIds = new Map<string, number>()
  for (const term of Object.values(tax.property_city ?? {})) {
    if (!term.count) continue
    const doc = await upsert(payload, 'cities', term.slug, { name: term.name })
    cityIds.set(term.name.toLowerCase(), doc.id as number)
  }
  console.log(`  cities      ${cityIds.size}`)

  const amenityIds = new Map<string, number>()
  for (const term of Object.values(tax.property_feature ?? {})) {
    if (!term.count) continue
    const doc = await upsert(payload, 'amenities', term.slug, { name: term.name })
    amenityIds.set(term.name.toLowerCase(), doc.id as number)
  }
  console.log(`  amenities   ${amenityIds.size}`)

  const categoryIds = new Map<string, number>()
  for (const term of Object.values(tax.categories ?? {})) {
    if (!term.count) continue
    const doc = await upsert(payload, 'categories', term.slug, { name: term.name })
    categoryIds.set(term.name.toLowerCase(), doc.id as number)
  }
  console.log(`  categories  ${categoryIds.size}`)

  // ── Properties ────────────────────────────────────────────────────────────
  console.log('\n▸ Properties')
  const allProps = await readJson<AuditProperty[]>('properties.json')
  const real = allProps.filter((p) => !isDemo(p))
  console.log(`  ${real.length} real of ${allProps.length} (${allProps.length - real.length} Houzez demo listings excluded)`)

  let done = 0
  for (const p of real) {
    const mapped = mapProperty({ title: p.title, types: p.type, status: p.status })
    const html = await sourceHtml('property', p.id)

    const featured = NO_MEDIA ? null : await importImage(payload, p.featuredImage, p.title)

    // Gallery: attachment IDs live in the audit markdown; URLs were resolved
    // from the legacy media endpoint into .migration-cache/gallery-urls.json.
    const md = await readMd(p.file)
    const galleryIds = (md.match(/\| Gallery image IDs \| (.+?) \|/)?.[1] ?? '')
      .split(/[,\s]+/)
      .filter(Boolean)
    const gallery: number[] = []
    if (!NO_MEDIA) {
      for (const gid of galleryIds) {
        const url = galleryUrls[gid]
        if (!url) continue
        const id = await importImage(payload, url, p.title)
        if (id) gallery.push(id)
      }
    }

    const [lat, lng] = (p.location || '').split(',').map((n) => Number.parseFloat(n))
    const surface = Number.parseInt((p.sizeUnit || p.size || '').replace(/[^\d]/g, ''), 10)
    const price = Number.parseInt((p.price || '').replace(/[^\d]/g, ''), 10)

    await upsert(payload, 'properties', p.slug, {
      title: p.title,
      ...mapped,
      excerpt: htmlToText(html, 280),
      description: html ? await htmlToLexical(payload, html) : emptyLexical(),
      city: cityIds.get((p.city[0] ?? '').toLowerCase()) ?? null,
      address: p.address || undefined,
      latitude: Number.isFinite(lat) ? lat : undefined,
      longitude: Number.isFinite(lng) ? lng : undefined,
      surface: Number.isFinite(surface) && surface > 0 ? surface : undefined,
      bedrooms: Number.parseInt(p.bedrooms, 10) || undefined,
      bathrooms: Number.parseInt(p.bathrooms, 10) || undefined,
      year: Number.parseInt(p.year, 10) || undefined,
      titleDeed: (p.title.match(/TF\s*[\d\s/]+R?/i) ?? [])[0]?.trim(),
      amenities: p.features.map((f) => amenityIds.get(f.toLowerCase())).filter(Boolean),
      featuredImage: featured,
      gallery,
      videoUrl: p.video || undefined,
      // Only 22 of 61 listings had a price, and most real ones did not.
      showPrice: Number.isFinite(price) && price > 0,
      price: Number.isFinite(price) && price > 0 ? price : undefined,
      seo: { title: p.seoTitle || undefined, description: p.seoDesc?.slice(0, 200) || undefined },
      publishedAt: p.modified,
      _status: 'published',
    })

    if (++done % 10 === 0) console.log(`  … ${done}/${real.length}`)
  }
  console.log(`  imported    ${done}`)

  // ── Blog posts ────────────────────────────────────────────────────────────
  console.log('\n▸ Blog posts')
  const posts = (await readJson<AuditPost[]>('posts.json')).filter((p) => p.slug !== 'blog')

  let postCount = 0
  for (const p of posts) {
    const md = await readMd(p.file)
    const html = await sourceHtml('post', p.id)
    const categoryName = (md.match(/\| Categories \| (.+?) \|/) ?? [])[1]?.split(',')[0]?.trim()
    const coverUrl = (md.match(/\| Featured image \| (\S+) \|/) ?? [])[1]
    const dateStr = (md.match(/\| Date \| (\S+?)T/) ?? [])[1]

    const cover = NO_MEDIA || !coverUrl ? null : await importImage(payload, coverUrl, p.title)

    await upsert(payload, 'posts', p.slug, {
      title: p.title,
      excerpt: htmlToText(html, 280),
      content: html ? await htmlToLexical(payload, html) : emptyLexical(),
      coverImage: cover,
      category: categoryName ? (categoryIds.get(categoryName.toLowerCase()) ?? null) : null,
      seo: { title: p.seoTitle || undefined, description: p.seoDesc?.slice(0, 200) || undefined },
      publishedAt: dateStr || p.modified,
      _status: 'published',
    })
    postCount++
  }
  console.log(`  imported    ${postCount}`)

  // ── Marketing pages ───────────────────────────────────────────────────────
  console.log('\n▸ Marketing pages')

  /**
   * Pages worth keeping. Everything else on the old site is either a Houzez
   * system page (dashboard, favourites, cart), a `-copy` duplicate, or a
   * shortcode-only listing page whose content was always empty — those become
   * real routes over the properties collection instead. See plan.md §5.
   */
  const KEEP_PAGES = [
    'a-propos', 'nos-services', 'promotion-fonciere', 'promotion-immobiliere-2',
    'intermediation', 'construction', 'cabinet-conseil-juridique',
    'besoin-dun-conseil-juridique', 'cabinet-client', 'contactez-nous',
    'devenir-partenaire-cpi', 'privacy', 'nos-programmes',
    'appartements-disponible', 'programmes-immobiliers-en-cours-1',
    'devenez-proprietaire-dun-terrain', 'achat-vente-ou-location-votre-projet',
    'formulaire-projet-cles-en-main', 'formulaire-gros-oeuvre',
    'formulaire-projet-sur-mesure', 'demande-dinscription-au-programme-foncier-ngolfagny',
    'inscription-au-programme-immobilier-ngolfagny', 'clients',
  ]

  const auditPages = await readJson<Array<{ id: number; title: string; slug: string; file: string; chars: number; seoTitle?: string; seoDesc?: string }>>('pages.json')
  let pageCount = 0
  let pageSkipped = 0

  for (const pg of auditPages) {
    if (!KEEP_PAGES.includes(pg.slug)) continue

    const html = await sourceHtml('page', pg.id)
    if (!html.trim()) {
      // Shortcode-driven page: nothing to preserve.
      pageSkipped++
      continue
    }

    // Inline images are stripped before conversion (Lexical cannot hold a
    // remote WordPress URL, and after cutover it would be a dead image), so
    // import them into Payload and keep them on the page as a gallery.
    const pageImages: number[] = []
    if (!NO_MEDIA) {
      for (const url of extractImages(html)) {
        const id = await importImage(payload, url, pg.title)
        if (id) pageImages.push(id)
      }
    }

    // A page can be image-only (its text was all Elementor chrome). Emitting an
    // empty richText block would fail validation, so only include blocks that
    // actually carry something.
    const lexical = await htmlToLexical(payload, html)
    const hasText = lexicalText(lexical).length > 0

    if (!hasText && !pageImages.length) {
      pageSkipped++
      continue
    }

    await upsert(payload, 'pages', pg.slug, {
      title: pg.title,
      // Imported as one rich-text block: the copy is what matters and must not
      // be lost. Phase 5 restructures these into proper blocks (hero, stats,
      // timeline…) — the text is already safe in the CMS by then.
      blocks: [
        ...(hasText
          ? [{ blockType: 'richText', content: lexical, width: 'narrow' }]
          : []),
        ...(pageImages.length
          ? [{ blockType: 'gallery', heading: undefined, images: pageImages }]
          : []),
      ],
      seo: {
        title: pg.seoTitle || undefined,
        // The field caps at 200; Yoast on the old site did not.
        description: pg.seoDesc ? pg.seoDesc.slice(0, 200) : undefined,
      },
      _status: 'published',
    })
    pageCount++
  }
  console.log(`  imported    ${pageCount} (${pageSkipped} shortcode-only, no content to keep)`)

  // ── Globals ───────────────────────────────────────────────────────────────
  console.log('\n▸ Globals')
  const nav = await readJson<{ socials: string[]; mails: string[] }>('navigation.json')

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Compagnie Prestige Immobilier',
      tagline: "Champion de l'immobilier au Sénégal",
      email: nav.mails?.[0] ?? 'contact@cpi.sn',
      whatsappNumber: '221764508374',
      phones: [
        { label: 'Commercial', number: '77 664 94 00' },
        { label: 'Commercial', number: '76 620 06 24' },
      ],
      socials: (nav.socials ?? [])
        .filter((u) => !/sharer|intent|api\.whatsapp|youtube\.com\/watch|wa\.me/.test(u))
        .map((url) => ({
          platform: (url.match(/facebook|instagram|linkedin|tiktok|youtube/i)?.[0].toLowerCase() ??
            'facebook') as 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube',
          url,
        })),
    },
    locale: 'fr',
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      header: [
        { label: 'À propos', href: '/a-propos' },
        {
          label: 'Projets',
          href: '/programmes',
          children: [
            { label: 'Projets en cours', href: '/programmes/en-cours' },
            { label: 'Projets réalisés', href: '/programmes/realises' },
          ],
        },
        { label: 'Terrains disponibles', href: '/terrains' },
        {
          label: 'Nos services',
          href: '/nos-services',
          children: [
            { label: 'Promotion foncière', href: '/nos-services/promotion-fonciere' },
            { label: 'Promotion immobilière', href: '/nos-services/promotion-immobiliere' },
            { label: 'Intermédiation', href: '/nos-services/intermediation' },
            { label: 'Construction', href: '/nos-services/construction' },
            { label: 'Cabinet conseil juridique', href: '/nos-services/conseil-juridique' },
          ],
        },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' },
      ],
      legal: [{ label: 'Politique de confidentialité', href: '/politique-de-confidentialite' }],
    },
    locale: 'fr',
    overrideAccess: true,
  })
  console.log('  site-settings, navigation')

  const m = mediaStats()
  console.log(
    `\n▸ Media: ${m.unique} unique · ${m.downloaded} downloaded · ${m.cacheHits} from cache · ${m.failures} failed`,
  )
  console.log(`\n✓ Done in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`)
  process.exit(0)
}

main().catch((error: unknown) => {
  const e = error as { message?: string; data?: { errors?: Array<{ path?: string; message?: string }> } }
  console.error('\n✗ Import failed:', e.message)
  for (const detail of e.data?.errors ?? []) {
    console.error(`    ${detail.path}: ${detail.message}`)
  }
  process.exit(1)
})

export { normalizeUrl }
