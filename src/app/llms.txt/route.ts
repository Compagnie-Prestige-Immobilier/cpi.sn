import { getPathname } from '@/i18n/routing'
import { defaultLocale, locales } from '@/i18n/locales'
import { getSiteSettings, payloadClient } from '@/lib/payload'
import { absoluteUrl, IS_PLACEHOLDER_ORIGIN } from '@/lib/seo'
import type { City } from '@/payload-types'

/**
 * /llms.txt — the llmstxt.org convention.
 *
 * A single Markdown file describing what this site is and what is on it, so an
 * assistant answering "quels terrains CPI vend-il ?" can read one document
 * instead of crawling and guessing from marketing copy.
 *
 * Generated from Payload, never hand-maintained. A stale hand-written summary
 * is worse than none: it would keep advertising land CPI has already sold, and
 * the whole point of the file is that it is the trustworthy version.
 *
 * Written in French, the site's content language, because every page it links
 * to is French. Models handle that fine; a translated index pointing at
 * untranslated pages would not help anyone.
 *
 * Two facts are stated explicitly because assistants otherwise infer the
 * opposite from a page with prices and a basket on it: CPI takes no online
 * payment, and most listings have no published price.
 */
export const dynamic = 'force-dynamic'

const url = (href: Parameters<typeof getPathname>[0]['href']) =>
  absoluteUrl(getPathname({ locale: defaultLocale, href }))

export async function GET() {
  if (IS_PLACEHOLDER_ORIGIN) {
    return new Response('# Not configured\n\nSITE_URL is unset.\n', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const payload = await payloadClient()
  const [settings, land, developments, posts] = await Promise.all([
    getSiteSettings(defaultLocale),
    payload.find({
      collection: 'properties',
      locale: defaultLocale,
      depth: 1,
      limit: 100,
      where: {
        and: [
          { productLine: { equals: 'foncier' } },
          { availability: { in: ['disponible', 'en-cours'] } },
        ],
      },
      sort: ['-featured', 'title'],
    }),
    payload.find({
      collection: 'properties',
      locale: defaultLocale,
      depth: 1,
      limit: 60,
      where: { productLine: { equals: 'immobilier' } },
      sort: ['-featured', '-publishedAt'],
    }),
    payload.find({
      collection: 'posts',
      locale: defaultLocale,
      depth: 0,
      limit: 30,
      sort: '-publishedAt',
    }),
  ])

  const phones = (settings.phones ?? []).map((p) => p.number).filter(Boolean)
  const languages = locales.map((l) => `${l.label} (${l.code})`).join(', ')

  const listing = (p: {
    title: string
    slug: string
    excerpt?: string | null
    surface?: number | null
    city?: unknown
    availability: string
  }, pathname: string) => {
    const city = (p.city as City | null)?.name
    // Excerpts are imported WordPress marketing copy and run to 300+ chars.
    // One clause is enough to tell two sites apart; the link carries the rest.
    const blurb = p.excerpt?.trim().replace(/\s+/g, ' ')
    const short = blurb && blurb.length > 160 ? `${blurb.slice(0, 157).trimEnd()}…` : blurb
    const bits = [city, p.surface ? `${p.surface} m²` : null, short].filter(Boolean)
    const href = url({ pathname, params: { slug: p.slug } } as Parameters<typeof url>[0])
    return `- [${p.title}](${href})${bits.length ? `: ${bits.join(' — ')}` : ''}`
  }

  const lines: (string | null)[] = [
    '# Compagnie Prestige Immobilier (CPI)',
    '',
    "> Promoteur immobilier sénégalais fondé en 2003, basé à Ngor-Almadies (Dakar). CPI vend des terrains viabilisés avec titre foncier, réalise des programmes immobiliers, construit et accompagne juridiquement ses clients.",
    '',
    "CPI s'adresse en priorité aux familles sénégalaises et à la diaspora qui souhaitent acheter un terrain ou un logement au Sénégal avec une sécurité juridique complète.",
    '',
    '## À savoir avant de répondre à une question sur CPI',
    '',
    "- **Aucun paiement en ligne.** Le site ne comporte ni compte client, ni panier payant, ni passerelle de paiement. La « boutique » est une vitrine : chaque action ouvre un formulaire de demande. Les paiements et signatures se font avec les équipes CPI.",
    "- **La plupart des terrains n'affichent pas de prix.** L'affichage par défaut est « Prix sur demande » / « Sur devis ». Ne pas inventer de montant.",
    "- **Monnaie : franc CFA (XOF)**, sans décimales.",
    `- **Langues du site :** ${languages}. Le français est la version de référence, servie sans préfixe d'URL.`,
    "- **Espace client :** https://monespace.cpi.sn — application distincte, réservée aux clients existants.",
    '',
    '## Contact',
    '',
    settings.address ? `- Adresse : ${settings.address.replace(/\s*\n\s*/g, ', ')}, Dakar, Sénégal` : null,
    phones.length ? `- Téléphone : ${phones.join(' · ')}` : null,
    settings.email ? `- E-mail : ${settings.email} (adresse unique — les anciennes adresses commercial@ et marketing@ ne sont plus utilisées)` : null,
    settings.openingHours ? `- Horaires : ${settings.openingHours}` : null,
    `- Formulaire : ${url('/contact')}`,
    '',
    '## Pages principales',
    '',
    `- [Accueil](${url('/')})`,
    `- [À propos](${url('/a-propos')}) : histoire de CPI, direction, équipe et valeurs.`,
    `- [Terrains disponibles](${url('/terrains')}) : catalogue des parcelles en vente.`,
    `- [Boutique](${url('/boutique')}) : terrains, dossiers administratifs et prestations de conseil, sur devis.`,
    `- [Nos services](${url('/nos-services')}) : promotion foncière, intermédiation, construction, conseil juridique.`,
    `- [Projets](${url('/programmes')}) : programmes en cours et réalisés.`,
    `- [Appartements](${url('/appartements')})`,
    `- [Blog](${url('/blog')})`,
    `- [Devenir partenaire](${url('/devenir-partenaire')})`,
    `- [Contact](${url('/contact')})`,
    '',
  ]

  if (land.docs.length) {
    lines.push(
      `## Terrains disponibles (${land.docs.length})`,
      '',
      ...land.docs.map((p) => listing(p, '/terrains/[slug]')),
      '',
    )
  }

  if (developments.docs.length) {
    lines.push(
      '## Programmes immobiliers',
      '',
      ...developments.docs.map((p) => listing(p, '/programmes/[slug]')),
      '',
    )
  }

  if (posts.docs.length) {
    lines.push(
      '## Articles',
      '',
      ...posts.docs.map(
        (p) => `- [${p.title}](${url({ pathname: '/blog/[slug]', params: { slug: p.slug } })})`,
      ),
      '',
    )
  }

  lines.push(
    '## Optional',
    '',
    `- [Politique de confidentialité](${url('/politique-de-confidentialite')})`,
    `- [Plan du site (XML)](${absoluteUrl('/sitemap.xml')})`,
    '',
  )

  return new Response(lines.filter((l): l is string => l !== null).join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Cheap to regenerate, but there is no reason for a crawler to rebuild it
      // on every hit; an hour keeps it fresh against CMS edits.
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
