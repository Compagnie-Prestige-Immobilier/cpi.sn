import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { findBySlugWithFallback } from './payload'
import { lexicalToText } from './json-ld'
import type { Locale } from '@/i18n/locales'
import type { Page, Media } from '@/payload-types'

/**
 * New route → imported page slug.
 *
 * The Payload slugs are the WordPress ones (that is what the import preserved,
 * and what the 301 map in plan.md §5 redirects *from*). The new URLs are
 * cleaner, so the two are mapped explicitly here rather than renaming content
 * and breaking the traceability back to the old site.
 */
export const PAGE_SLUGS = {
  about: 'a-propos',
  services: 'nos-services',
  contact: 'contactez-nous',
  privacy: 'privacy',
  partner: 'devenir-partenaire-cpi',
  apartments: 'appartements-disponible',
  programmes: 'nos-programmes',
} as const

/** `/nos-services/[slug]` → imported page slug. */
export const SERVICE_SLUGS: Record<string, string> = {
  'promotion-fonciere': 'promotion-fonciere',
  'promotion-immobiliere': 'promotion-immobiliere-2',
  intermediation: 'intermediation',
  construction: 'construction',
  'conseil-juridique': 'cabinet-conseil-juridique',
}

/**
 * `/demande/[slug]` → imported page slug.
 *
 * The old site had seven separate lead-capture pages, each with its own
 * hand-built WordPress form. Here they are one route: the page supplies the
 * copy, and a single form posts to /api/leads with `source` set to the page —
 * so CPI can still tell a "projet clés en main" enquiry from a "gros œuvre" one
 * without seven form definitions to maintain.
 */
export const REQUEST_SLUGS: Record<string, string> = {
  'projet-cles-en-main': 'formulaire-projet-cles-en-main',
  'gros-oeuvre': 'formulaire-gros-oeuvre',
  'projet-sur-mesure': 'formulaire-projet-sur-mesure',
  'devenir-proprietaire': 'devenez-proprietaire-dun-terrain',
  'achat-vente-location': 'achat-vente-ou-location-votre-projet',
  'programme-foncier-ngolfagny': 'demande-dinscription-au-programme-foncier-ngolfagny',
  'programme-immobilier-ngolfagny': 'inscription-au-programme-immobilier-ngolfagny',
}

export async function getPage(slug: string, locale: Locale): Promise<Page | null> {
  return (await findBySlugWithFallback('pages', slug, locale)) as Page | null
}

export async function getPageOr404(slug: string, locale: Locale): Promise<Page> {
  const page = await getPage(slug, locale)
  if (!page) notFound()
  return page
}

/**
 * First readable sentence(s) of a page, for use as a meta description.
 *
 * Most migrated pages have no SEO override — Yoast was left blank on the old
 * site — which left them with no `<meta name="description">` at all. Google
 * then writes its own snippet from whatever is on screen, which on these pages
 * is often a heading or a nav label. Deriving from the page's own first
 * paragraph is both truthful and better than that.
 *
 * Deliberately not falling back to the site-wide description: the same sentence
 * on forty pages tells a search engine they are interchangeable.
 */
function describeFromBlocks(page: Page): string | undefined {
  for (const block of page.blocks ?? []) {
    if (block.blockType !== 'richText') continue
    const text = lexicalToText(block.content)
    if (text.length < 40) continue
    // 155 chars is where Google truncates; cut on a word boundary.
    if (text.length <= 155) return text
    const cut = text.slice(0, 155)
    return `${cut.slice(0, cut.lastIndexOf(' ')).trimEnd()}…`
  }
  return undefined
}

/**
 * Metadata from a page's SEO group, falling back to its title.
 *
 * Most of the migrated pages have no SEO override — Yoast was left blank on the
 * old site — so the fallback path is the common case, not the exception.
 */
export function pageMetadata(page: Page | null, fallbackTitle?: string): Metadata {
  if (!page) return { title: fallbackTitle }

  const ogImage = page.seo?.ogImage as Media | null

  return {
    title: page.seo?.title || page.title || fallbackTitle,
    description: page.seo?.description || describeFromBlocks(page) || undefined,
    robots: page.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: ogImage?.url
      ? { images: [{ url: ogImage.url, alt: ogImage.alt ?? '' }] }
      : undefined,
  }
}
