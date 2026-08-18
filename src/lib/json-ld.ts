import { absoluteUrl, mediaUrl } from './seo'
import type { Locale } from '@/i18n/locales'
import type { Config, Media, Post, Property, SiteSetting } from '@/payload-types'

/**
 * schema.org graph builders.
 *
 * Rules this file holds itself to, because structured data is the one place
 * where a plausible-looking invention is served directly to Google as a factual
 * claim about a real company:
 *
 *   1. **Nothing is fabricated.** Every value traces to `site-settings` or to a
 *      Payload document. Fields CPI has not filled in are omitted, never
 *      guessed — no invented coordinates, no assumed price, no made-up rating.
 *      An `aggregateRating` with no reviews behind it is exactly the kind of
 *      thing that earns a manual action.
 *   2. **Prices are only emitted when `showPrice` is set.** Most listings are
 *      deliberately "Prix sur demande"; publishing a hidden number in the
 *      markup would contradict the page and leak commercial information.
 *   3. **`@id` is stable and absolute**, so the organisation node can be
 *      referenced from every other node rather than duplicated per page.
 *
 * CPI is typed as `RealEstateAgent` — a LocalBusiness subtype, which is what
 * lets the address, phone and opening hours carry weight in local results.
 * `Organization` alone would drop all of that.
 */

const ORG_ID = () => `${absoluteUrl('/')}#organization`
const SITE_ID = () => `${absoluteUrl('/')}#website`

type Json = Record<string, unknown>

/** Drops null/undefined/empty entries so no key is emitted with a blank value. */
function compact(obj: Json): Json {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => {
      if (v == null) return false
      if (typeof v === 'string') return v.trim() !== ''
      if (Array.isArray(v)) return v.length > 0
      return true
    }),
  )
}

/**
 * "9h–18h · 7j/7" → schema.org opening hours.
 *
 * Deliberately narrow: it only fires when the free-text field states both a
 * range *and* seven-day opening. Anything else returns undefined rather than a
 * half-parsed guess — the field is a text box CPI can type anything into, and a
 * wrong opening time sends someone to a closed office.
 */
export function parseOpeningHours(text?: string | null): Json | undefined {
  if (!text) return undefined
  const range = text.match(/(\d{1,2})\s*h\s*(\d{2})?\s*[–—-]\s*(\d{1,2})\s*h\s*(\d{2})?/)
  // "7j/7", "7 j / 7", "7/7" — the forms CPI actually types.
  const everyDay = /7\s*(j\s*)?\/\s*7/i.test(text)
  if (!range || !everyDay) return undefined

  const pad = (h: string, m?: string) => `${h.padStart(2, '0')}:${(m ?? '00').padStart(2, '0')}`
  return {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    opens: pad(range[1], range[2]),
    closes: pad(range[3], range[4]),
  }
}

export function organizationJsonLd(settings: SiteSetting, description: string): Json {
  const phones = (settings.phones ?? []).map((p) => p.number).filter(Boolean) as string[]
  const socials = (settings.socials ?? []).map((s) => s.url).filter(Boolean) as string[]
  const logo = absoluteUrl('/brand/logo-dark.png')
  const hours = parseOpeningHours(settings.openingHours)

  return compact({
    '@type': ['RealEstateAgent', 'Organization'],
    '@id': ORG_ID(),
    name: settings.siteName || 'Compagnie Prestige Immobilier',
    alternateName: 'CPI',
    url: absoluteUrl('/'),
    logo: { '@type': 'ImageObject', url: logo },
    image: logo,
    description,
    // CPI was founded in 2003 — stated throughout its own site and in the
    // founder's biography, not inferred.
    foundingDate: '2003',
    email: settings.email || undefined,
    telephone: phones[0],
    address: settings.address
      ? compact({
          '@type': 'PostalAddress',
          streetAddress: settings.address.replace(/\s*\n\s*/g, ', '),
          addressLocality: 'Dakar',
          addressCountry: 'SN',
        })
      : undefined,
    areaServed: { '@type': 'Country', name: 'Sénégal' },
    sameAs: socials,
    openingHoursSpecification: hours ? [hours] : undefined,
    // No `geo`: CPI has supplied no verified coordinates, and a guessed pin on
    // a map is worse than none.
  })
}

export function websiteJsonLd(name: string, locale: Locale): Json {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID(),
    url: absoluteUrl('/'),
    name,
    inLanguage: locale,
    publisher: { '@id': ORG_ID() },
    // No `potentialAction`/SearchAction: the site has no search route, and
    // claiming one Google cannot exercise is a defect, not an optimisation.
  }
}

export function breadcrumbJsonLd(trail: { name: string; url: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

/**
 * A land plot or a development.
 *
 * Typed as `Product` with an `Offer`, which is what Google actually parses for
 * real-estate listings — `Residence`/`Accommodation` carry no rich result. The
 * offer's availability mirrors the `availability` field so a sold plot is not
 * advertised as buyable.
 */
export function propertyJsonLd(property: Property, url: string, locale: Locale): Json {
  const image = mediaUrl((property.featuredImage as Media | null)?.url)
  const gallery = (property.gallery ?? [])
    .map((m) => mediaUrl((m as Media)?.url))
    .filter(Boolean) as string[]

  const AVAILABILITY: Record<Property['availability'], string> = {
    disponible: 'https://schema.org/InStock',
    'en-cours': 'https://schema.org/PreOrder',
    realise: 'https://schema.org/InStock',
    vendu: 'https://schema.org/SoldOut',
    'a-louer': 'https://schema.org/InStock',
  }

  // Only a price CPI has chosen to show. Everything else is "Prix sur demande",
  // and publishing the hidden figure in the markup would contradict the page.
  const offer = compact({
    '@type': 'Offer',
    url,
    availability: AVAILABILITY[property.availability],
    seller: { '@id': ORG_ID() },
    ...(property.showPrice && property.price
      ? { price: String(property.price), priceCurrency: 'XOF' }
      : {}),
  })

  return compact({
    '@type': 'Product',
    '@id': `${url}#product`,
    name: property.title,
    url,
    description: property.seo?.description || property.excerpt || undefined,
    image: image ? [image, ...gallery].slice(0, 6) : gallery.slice(0, 6),
    sku: property.slug,
    category: property.productLine === 'foncier' ? 'Terrain' : 'Immobilier',
    inLanguage: locale,
    brand: { '@id': ORG_ID() },
    offers: offer,
    additionalProperty: [
      property.surface && {
        '@type': 'PropertyValue',
        name: 'Superficie',
        value: property.surface,
        unitCode: 'MTK',
      },
      property.titleDeed && {
        '@type': 'PropertyValue',
        name: 'Titre foncier',
        value: property.titleDeed,
      },
      property.bedrooms && {
        '@type': 'PropertyValue',
        name: 'Chambres',
        value: property.bedrooms,
      },
    ].filter(Boolean),
  })
}

export function articleJsonLd(post: Post, url: string, locale: Locale): Json {
  const cover = mediaUrl((post.coverImage as Media | null)?.url)

  return compact({
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    url,
    mainEntityOfPage: url,
    description: post.seo?.description || post.excerpt || undefined,
    image: cover,
    inLanguage: locale,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    // The author is CPI itself: posts are imported from the company blog and
    // the `author` relation points at a Payload admin user, whose name is staff
    // data rather than a published byline.
    author: { '@id': ORG_ID() },
    publisher: { '@id': ORG_ID() },
  })
}

/**
 * Lexical rich text → plain text.
 *
 * schema.org wants the answer as a string, and the CMS stores a node tree.
 * Walks it collecting `text` nodes and joins block-level nodes with a space, so
 * a two-paragraph answer does not run its last and first words together.
 */
export function lexicalToText(data: unknown): string {
  const out: string[] = []
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    const n = node as { text?: unknown; children?: unknown[]; root?: unknown; type?: string }
    if (n.root) return walk(n.root)
    if (typeof n.text === 'string') out.push(n.text)
    if (Array.isArray(n.children)) {
      n.children.forEach(walk)
      // Block-level nodes end a run of inline text.
      if (n.type && n.type !== 'text') out.push(' ')
    }
  }
  walk(data)
  return out.join('').replace(/\s+/g, ' ').trim()
}

export function faqJsonLd(items: { question: string; answer: string }[]): Json | undefined {
  const usable = items.filter((i) => i.question?.trim() && i.answer?.trim())
  if (!usable.length) return undefined

  return {
    '@type': 'FAQPage',
    mainEntity: usable.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  }
}

/** Wraps nodes into a single `@graph`, which is how they cross-reference by `@id`. */
export function graph(...nodes: (Json | undefined)[]): Json {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) as Json[] }
}

export type { Config }
