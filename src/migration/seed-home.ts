/**
 * Populates the `home-page` global from the legacy homepage.
 *
 *   npm run seed:home
 *
 * Separate from the main import because this content is editorial, not a
 * mechanical field-for-field migration: the old homepage's copy is reorganised
 * here rather than transcribed. Re-runnable.
 */
import path from 'node:path'
import { existsSync } from 'node:fs'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { importImage, importLocalFile } from './media'
import { htmlToLexical } from './lexical'

const ARCHIVE = path.resolve(process.cwd(), 'legacy-archive/uploads')

/**
 * Aerial view of a CPI development — coastline, laterite roads, houses under
 * construction. Chosen because it is real work of CPI's, landscape, and carries
 * no text: the promotional banners used as property "featured images" all have
 * the site name burned into the artwork and collide with the hero headline.
 */
const HERO = '2025/11/Capture-decran-2025-11-05-a-13.46.29.png'

/**
 * Founder biography, condensed from the legacy homepage. Every claim is from
 * CPI's own copy — the Cour suprême case, the 1983 promotion, Trade Point
 * Sénégal and Gaindé 2000, the 2003 founding. Nothing is embellished.
 */
const FOUNDER_BIO_HTML = `
<p>Dès sa carrière universitaire, en 1979, <strong>Aminata Sall</strong>, exclue de l'UCAD, fait
preuve d'un engagement exceptionnel face à l'injustice. Elle engage un <strong>Recours pour Excès de
Pouvoir</strong> contre le Président de la République et obtient gain de cause devant la
<strong>Cour suprême</strong>, à travers l'arrêt historique connu sous le nom d'<em>Arrêt Aminata
Sall et Consorts</em>.</p>
<p>Issue de la promotion 1983, elle est nommée <strong>Commissaire principale aux enquêtes
économiques</strong> et sert au sein de l'administration sénégalaise, au Contrôle économique puis au
Commerce extérieur. Elle poursuit cet engagement à <strong>Trade Point Sénégal</strong>, structure
fondatrice de <strong>Gaindé 2000</strong>.</p>
<p>En 2003, elle crée la <strong>Compagnie Prestige Immobilier (CPI)</strong>, avec pour mission de
rendre la propriété foncière accessible aux familles sénégalaises tout en garantissant une sécurité
juridique absolue à chaque étape.</p>
`

const HIGHLIGHTS = [
  { year: '1979', text: 'Arrêt Aminata Sall et Consorts — gain de cause devant la Cour suprême' },
  { year: '1983', text: 'Commissaire principale aux enquêtes économiques' },
  { year: '1990s', text: 'Trade Point Sénégal, structure fondatrice de Gaindé 2000' },
  { year: '2003', text: 'Création de la Compagnie Prestige Immobilier' },
]

const STATS = [
  { value: '+20', label: "Années d'expérience" },
  { value: '+10 000', label: 'Familles propriétaires' },
  { value: '+15', label: 'Sites stratégiques' },
  { value: '98 %', label: 'Satisfaction clients' },
]

const VALUE_PROPS = [
  {
    title: 'Expérience éprouvée',
    body: "Plus de vingt ans de promotion foncière et immobilière au Sénégal, et plus de 10 000 familles devenues propriétaires.",
  },
  {
    title: 'Sécurité juridique',
    body: "Un cabinet de conseil juridique intégré : titres fonciers, baux et délibérations vérifiés avant toute commercialisation.",
  },
  {
    title: 'Solutions personnalisées',
    body: "Achat de terrain, construction clés en main, extension ou rénovation — chaque projet est accompagné de bout en bout.",
  },
  {
    title: 'Intégrité et transparence',
    body: "Nature du titre, superficie, viabilisation et position : les informations déterminantes sont annoncées avant l'achat.",
  },
  {
    title: 'Large gamme de services',
    body: "Promotion foncière, promotion immobilière, intermédiation et construction, sous une même direction.",
  },
  {
    title: 'Service client',
    body: "Une équipe commerciale joignable, et un suivi qui ne s'arrête pas à la signature.",
  },
]

/**
 * Video testimonials from the legacy homepage. Real, named people — the
 * `houzez_testimonials` post type CPI never filled in was a red herring.
 * Video → person mapping read from document order in the source HTML.
 */
const TESTIMONIALS = [
  {
    author: 'Mr Abib Sy',
    // Source HTML reads "minitre"; corrected here.
    role: "Ancien ministre d'État et dernier directeur de campagne du président Abdoulaye Wade",
    video: 'https://youtu.be/bMtZktxvxyk',
  },
  {
    author: 'Mme Aminata Niane',
    role: 'Ingénieur Agronome',
    video: 'https://youtu.be/Ozj8AvwAC04',
  },
  {
    author: 'Mr George Dacosta',
    role: 'Cadre de Banque',
    video: 'https://youtu.be/qBHtPJ8AEPk',
  },
]

/** YouTube poster, imported locally so nothing is requested from Google on load. */
async function importPoster(payload: Parameters<typeof importImage>[0], video: string, alt: string) {
  const id = video.match(/[\w-]{11}$/)?.[0]
  if (!id) return null
  for (const quality of ['maxresdefault', 'hqdefault']) {
    const media = await importImage(payload, `https://i.ytimg.com/vi/${id}/${quality}.jpg`, alt)
    if (media) return media
  }
  return null
}

async function main() {
  const payload = await getPayload({ config })

  let heroId: number | null = null
  const heroPath = path.join(ARCHIVE, HERO)

  if (existsSync(heroPath)) {
    // Reuse the media importer so this image is deduped by sourceUrl like the
    // rest, rather than creating a second copy on every run.
    heroId = await importImage(
      payload,
      `https://cpi.sn/wp-content/uploads/${HERO}`,
      "Vue aérienne d'un lotissement CPI au Sénégal",
    )
  } else {
    console.warn(`  ⚠ hero image not found at ${heroPath} — leaving it unset`)
  }

  // Founder portrait, supplied by CPI. Imported from the repo root rather than
  // the legacy archive: `legacy-archive/…/founder.jpg` is Houzez stock showing
  // a different person entirely. `AG.png` superseded the earlier `founder.png`,
  // which was a still pulled from the video.
  const portraitPath = path.resolve(process.cwd(), 'AG.png')
  const portraitId = existsSync(portraitPath)
    ? await importLocalFile(payload, portraitPath, 'Aminata Sall SY, fondatrice de CPI')
    : null
  if (!portraitId) console.warn('  ⚠ AG.png not found — portrait left unset')

  const gaindePosterId = await importPoster(
    payload,
    'https://youtu.be/0PwlHrRO8tc',
    'Projet Gaindé 2000 — ORBUS',
  )

  await payload.updateGlobal({
    slug: 'home-page',
    locale: 'fr',
    overrideAccess: true,
    data: {
      heroEyebrow: 'Compagnie Prestige Immobilier',
      heroTitle: "Champion de l'immobilier au Sénégal",
      heroSubtitle:
        "Depuis 2003, CPI rend la propriété foncière accessible aux familles sénégalaises — avec une sécurité juridique vérifiée à chaque étape.",
      heroImage: heroId,
      heroVideoUrl: 'https://youtu.be/zaN5H9ZZ0MI',
      stats: STATS,
      valueProps: VALUE_PROPS,
      founder: {
        name: 'Aminata Sall SY',
        role: 'Fondatrice & Administratrice Générale',
        bio: await htmlToLexical(payload, FOUNDER_BIO_HTML),
        highlights: HIGHLIGHTS,
        portrait: portraitId,
        // Her own project, not a client testimonial — so it belongs here rather
        // than in the testimonials row. Its own poster, not her portrait: the
        // film is about ORBUS, and reusing her face would misdescribe it.
        videoUrl: 'https://youtu.be/0PwlHrRO8tc',
        videoLabel: "Projet Gaindé 2000 — ORBUS, itinéraire d'une fierté nationale",
        videoPoster: gaindePosterId,
      },
    },
  })

  // ── Testimonials ──────────────────────────────────────────────────────────
  for (const item of TESTIMONIALS) {
    const poster = await importPoster(payload, item.video, `${item.author} — témoignage CPI`)

    const existing = await payload.find({
      collection: 'testimonials',
      where: { author: { equals: item.author } },
      limit: 1,
      overrideAccess: true,
    })

    const data = {
      author: item.author,
      role: item.role,
      videoUrl: item.video,
      photo: poster,
      featured: true,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'testimonials',
        id: existing.docs[0].id,
        data,
        locale: 'fr',
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'testimonials',
        data,
        locale: 'fr',
        overrideAccess: true,
      })
    }
  }
  console.log(`✓ ${TESTIMONIALS.length} video testimonials seeded`)

  console.log(`✓ home-page seeded${heroId ? ` (hero media #${heroId})` : ' (no hero image)'}`)
  process.exit(0)
}

main().catch((error) => {
  console.error('✗ seed:home failed:', error)
  process.exit(1)
})
