import type { MetadataRoute } from 'next'

import { payloadClient } from '@/lib/payload'
import { localeAlternates, type SeoHref } from '@/lib/seo'
import { defaultLocale } from '@/i18n/locales'
import { SERVICE_SLUGS, REQUEST_SLUGS } from '@/lib/pages'

/**
 * The sitemap, generated from Payload rather than maintained by hand.
 *
 * Every entry carries the full `alternates.languages` set, which is how the
 * three locales are declared to Google — `localePrefix: 'as-needed'` means the
 * French URL has no prefix, so nothing about `/a-propos` vs `/en/about` is
 * guessable from the URL alone.
 *
 * Only French URLs are listed as `url`; the other locales appear as alternates
 * of the same entry. Listing all three as separate entries would triple the
 * file and tell Google the same thing three times.
 *
 * Deliberately excluded:
 *   - `/accueil-v1`, `/accueil-v2` — archived homepages, `noindex`
 *   - `/ma-selection` — a client-side basket, empty for every crawler
 *   - `/admin`, `/api` — not public pages
 *   - any document with `seo.noIndex` set, which the admin uses to hide drafts
 *
 * `force-dynamic` for the same reason as the site layout: this reads the
 * database, so it must not be frozen into the build.
 */
export const dynamic = 'force-dynamic'

type Entry = MetadataRoute.Sitemap[number]

function entry(href: SeoHref, opts: { lastModified?: string | Date; priority?: number; changeFrequency?: Entry['changeFrequency'] }): Entry {
  const { canonical, languages } = localeAlternates(defaultLocale, href)
  return {
    url: canonical,
    lastModified: opts.lastModified,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: { languages },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await payloadClient()
  const now = new Date()

  // Static routes, highest-value first. Priorities are relative hints only —
  // they order CPI's own pages against each other, nothing more.
  const staticEntries: Entry[] = [
    entry('/', { priority: 1, changeFrequency: 'weekly', lastModified: now }),
    entry('/terrains', { priority: 0.9, changeFrequency: 'daily', lastModified: now }),
    entry('/boutique', { priority: 0.9, changeFrequency: 'weekly', lastModified: now }),
    entry('/programmes', { priority: 0.8, changeFrequency: 'weekly', lastModified: now }),
    entry('/programmes/en-cours', { priority: 0.7, changeFrequency: 'weekly' }),
    entry('/programmes/realises', { priority: 0.6, changeFrequency: 'monthly' }),
    entry('/appartements', { priority: 0.7, changeFrequency: 'weekly' }),
    entry('/nos-services', { priority: 0.8, changeFrequency: 'monthly' }),
    entry('/a-propos', { priority: 0.7, changeFrequency: 'monthly' }),
    entry('/contact', { priority: 0.7, changeFrequency: 'yearly' }),
    entry('/blog', { priority: 0.6, changeFrequency: 'weekly', lastModified: now }),
    entry('/devenir-partenaire', { priority: 0.5, changeFrequency: 'yearly' }),
    entry('/politique-de-confidentialite', { priority: 0.2, changeFrequency: 'yearly' }),
  ]

  const serviceEntries: Entry[] = Object.keys(SERVICE_SLUGS).map((slug) =>
    entry({ pathname: '/nos-services/[slug]', params: { slug } }, {
      priority: 0.6,
      changeFrequency: 'monthly',
    }),
  )

  const requestEntries: Entry[] = Object.keys(REQUEST_SLUGS).map((slug) =>
    entry({ pathname: '/demande/[slug]', params: { slug } }, {
      priority: 0.4,
      changeFrequency: 'yearly',
    }),
  )

  // Content. Read in the default locale: the sitemap's `url` is the French one,
  // and slugs only exist in French today.
  const [properties, posts, categories] = await Promise.all([
    payload.find({
      collection: 'properties',
      locale: defaultLocale,
      limit: 500,
      depth: 0,
      sort: '-updatedAt',
    }),
    payload.find({
      collection: 'posts',
      locale: defaultLocale,
      limit: 500,
      depth: 0,
      sort: '-updatedAt',
    }),
    payload.find({ collection: 'categories', locale: defaultLocale, limit: 100, depth: 0 }),
  ])

  const propertyEntries: Entry[] = properties.docs
    .filter((p) => p.slug && !p.seo?.noIndex)
    .map((p) =>
      entry(
        {
          // Land and developments live on different routes — sending a villa to
          // /terrains would be a 404 in the sitemap, which costs crawl budget
          // and reads as a broken site.
          pathname: p.productLine === 'foncier' ? '/terrains/[slug]' : '/programmes/[slug]',
          params: { slug: p.slug },
        },
        {
          lastModified: p.updatedAt,
          priority: p.availability === 'vendu' ? 0.3 : 0.7,
          changeFrequency: 'weekly',
        },
      ),
    )

  const postEntries: Entry[] = posts.docs
    .filter((p) => p.slug && !p.seo?.noIndex)
    .map((p) =>
      entry({ pathname: '/blog/[slug]', params: { slug: p.slug } }, {
        lastModified: p.updatedAt,
        priority: 0.5,
        changeFrequency: 'monthly',
      }),
    )

  const categoryEntries: Entry[] = categories.docs
    .filter((c) => c.slug)
    .map((c) =>
      entry({ pathname: '/blog/categorie/[slug]', params: { slug: c.slug as string } }, {
        priority: 0.3,
        changeFrequency: 'monthly',
      }),
    )

  return [
    ...staticEntries,
    ...serviceEntries,
    ...propertyEntries,
    ...postEntries,
    ...categoryEntries,
    ...requestEntries,
  ]
}
