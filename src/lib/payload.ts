import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import { defaultLocale, type Locale } from '@/i18n/locales'
import type { Property } from '@/payload-types'

/**
 * Server-side data access.
 *
 * Uses Payload's Local API rather than fetching our own REST endpoint: same
 * process, no HTTP round trip, no serialization, and access control is applied
 * from the same config. Never import this into a client component.
 */
export async function payloadClient() {
  return getPayload({ config })
}

type PropertyQuery = {
  locale: Locale
  productLine?: Property['productLine']
  availability?: Property['availability'] | Property['availability'][]
  kind?: Property['kind']
  limit?: number
  featured?: boolean
}

export async function getProperties({
  locale,
  productLine,
  availability,
  kind,
  limit = 24,
  featured,
}: PropertyQuery) {
  const payload = await payloadClient()

  const where: Where[] = []
  if (productLine) where.push({ productLine: { equals: productLine } })
  if (kind) where.push({ kind: { equals: kind } })
  if (featured) where.push({ featured: { equals: true } })
  if (availability) {
    where.push(
      Array.isArray(availability)
        ? { availability: { in: availability } }
        : { availability: { equals: availability } },
    )
  }

  const res = await payload.find({
    collection: 'properties',
    locale,
    limit,
    depth: 1,
    where: where.length ? { and: where } : undefined,
    // Available stock first, then most recent — a sold listing should never
    // outrank something a visitor can actually buy.
    sort: ['-featured', '-publishedAt'],
  })

  return res.docs
}

/**
 * Look up a document by slug, falling back to the default locale.
 *
 * Slugs are localized, but content currently exists only in French. Payload
 * falls back when *reading* a field, not when *querying* one — a
 * `where: { slug: { equals: … } }` in `en` matches the English column, which is
 * empty, so every English route 404s.
 *
 * So: match the slug in the requested locale; on a miss, match it in the
 * default locale and re-read that document in the requested locale, so any
 * translated fields that do exist still win.
 */
async function findBySlugWithFallback<T extends 'properties' | 'posts' | 'pages'>(
  collection: T,
  slug: string,
  locale: Locale,
  depth = 2,
) {
  const payload = await payloadClient()

  const query = (l: Locale) =>
    payload.find({ collection, locale: l, depth, limit: 1, where: { slug: { equals: slug } } })

  const direct = await query(locale)
  if (direct.docs.length) return direct.docs[0]

  if (locale === defaultLocale) return null

  const fallback = await query(defaultLocale)
  if (!fallback.docs.length) return null

  return payload.findByID({ collection, id: fallback.docs[0].id, locale, depth })
}

export async function getPropertyBySlug(slug: string, locale: Locale) {
  return findBySlugWithFallback('properties', slug, locale)
}

export { findBySlugWithFallback }

export async function getPosts({
  locale,
  limit = 24,
  categorySlug,
}: {
  locale: Locale
  limit?: number
  categorySlug?: string
}) {
  const payload = await payloadClient()

  let categoryId: number | undefined
  if (categorySlug) {
    const cats = await payload.find({
      collection: 'categories',
      locale,
      limit: 1,
      where: { slug: { equals: categorySlug } },
    })
    // An unknown category must yield nothing, not silently list every post.
    if (!cats.docs.length) return { docs: [], category: null }
    categoryId = cats.docs[0].id as number
  }

  const res = await payload.find({
    collection: 'posts',
    locale,
    limit,
    depth: 1,
    where: categoryId ? { category: { equals: categoryId } } : undefined,
    sort: '-publishedAt',
  })
  return { docs: res.docs, category: null }
}

export async function getPostBySlug(slug: string, locale: Locale) {
  return findBySlugWithFallback('posts', slug, locale)
}

export async function getCategories(locale: Locale) {
  const payload = await payloadClient()
  const res = await payload.find({ collection: 'categories', locale, limit: 50 })
  return res.docs
}

export async function getTestimonials(locale: Locale) {
  const payload = await payloadClient()
  const res = await payload.find({
    collection: 'testimonials',
    locale,
    depth: 1,
    limit: 6,
    sort: '-featured',
  })
  return res.docs
}

export async function getTeam(locale: Locale) {
  const payload = await payloadClient()
  const res = await payload.find({ collection: 'team', locale, depth: 1, limit: 50, sort: 'order' })
  return res.docs
}

export async function getSiteSettings(locale: Locale) {
  const payload = await payloadClient()
  return payload.findGlobal({ slug: 'site-settings', locale, depth: 1 })
}

export async function getHomePage(locale: Locale) {
  const payload = await payloadClient()
  return payload.findGlobal({ slug: 'home-page', locale, depth: 1 })
}

export async function getNavigation(locale: Locale) {
  const payload = await payloadClient()
  return payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
}

/** Boutique catalogue — land and services, in editor-defined order. */
export async function getShopItems(locale: Locale) {
  const payload = await payloadClient()
  const res = await payload.find({
    collection: 'shop-items',
    locale,
    depth: 1,
    limit: 100,
    sort: 'order',
  })
  return res.docs
}
