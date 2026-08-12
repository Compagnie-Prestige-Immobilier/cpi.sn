import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'
import { localeCodes, defaultLocale } from './locales'

/**
 * Translated route segments.
 *
 * The key is the internal pathname used in code; the value maps it per locale.
 * French keeps the historical WordPress paths verbatim — this is what makes the
 * 301 map in plan.md §5 work and preserves the existing Google ranking.
 *
 * See CLAUDE.md → Internationalization rules 5 and 6.
 */
export const pathnames = {
  '/': '/',

  '/a-propos': { fr: '/a-propos', en: '/about' },
  '/contact': { fr: '/contact', en: '/contact' },
  '/references': { fr: '/references', en: '/references' },
  '/politique-de-confidentialite': {
    fr: '/politique-de-confidentialite',
    en: '/privacy-policy',
  },

  '/nos-services': { fr: '/nos-services', en: '/services' },
  '/nos-services/[slug]': { fr: '/nos-services/[slug]', en: '/services/[slug]' },

  '/terrains': { fr: '/terrains', en: '/land' },
  '/terrains/[slug]': { fr: '/terrains/[slug]', en: '/land/[slug]' },

  '/programmes': { fr: '/programmes', en: '/developments' },
  '/programmes/en-cours': { fr: '/programmes/en-cours', en: '/developments/ongoing' },
  '/programmes/realises': { fr: '/programmes/realises', en: '/developments/completed' },
  '/programmes/[slug]': { fr: '/programmes/[slug]', en: '/developments/[slug]' },

  '/appartements': { fr: '/appartements', en: '/apartments' },

  '/blog': '/blog',
  '/blog/[slug]': '/blog/[slug]',
  '/blog/categorie/[slug]': { fr: '/blog/categorie/[slug]', en: '/blog/category/[slug]' },

  '/ma-selection': { fr: '/ma-selection', en: '/my-selection' },
  '/devenir-partenaire': { fr: '/devenir-partenaire', en: '/become-a-partner' },
  '/demande/[slug]': { fr: '/demande/[slug]', en: '/request/[slug]' },
} as const

export const routing = defineRouting({
  locales: localeCodes,
  defaultLocale,

  // French is served unprefixed (/a-propos); every other locale is prefixed
  // (/en/about). Changing this invalidates the entire 301 map — see CLAUDE.md.
  localePrefix: 'as-needed',

  /**
   * Deliberately OFF. next-intl otherwise reads Accept-Language and redirects
   * the canonical URL — a visitor (or a crawler) whose browser says `en` would
   * be bounced from `/` to `/en`.
   *
   * That is wrong here for three reasons:
   *   1. SEO — `/` is indexed as French. Redirecting it based on a request
   *      header makes the canonical URL serve inconsistent content.
   *   2. Audience — CPI is Senegalese and francophone. A visitor whose phone
   *      ships with an English UI is still overwhelmingly likely to read French.
   *   3. Performance — auto-detection puts a redirect on the most-hit URL.
   *
   * Visitors switch language explicitly via the LanguageSwitcher, which stores
   * the choice in the NEXT_LOCALE cookie.
   */
  localeDetection: false,

  pathnames,
})

export type AppPathname = keyof typeof pathnames

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
