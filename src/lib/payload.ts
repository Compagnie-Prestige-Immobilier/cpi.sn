import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import type { Locale } from '@/i18n/locales'
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

export async function getPropertyBySlug(slug: string, locale: Locale) {
  const payload = await payloadClient()
  const res = await payload.find({
    collection: 'properties',
    locale,
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return res.docs[0] ?? null
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
