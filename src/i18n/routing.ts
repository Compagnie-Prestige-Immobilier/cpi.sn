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

  // Superseded homepages, kept reachable so the designer can ask for an earlier
  // direction back. Deliberately absent from the navigation, and noindex.
  //   v1 — the first CPI homepage
  //   v2 — the Ombara `index.html` port
  '/accueil-v1': { fr: '/accueil-v1', en: '/home-v1', es: '/inicio-v1' },
  '/accueil-v2': { fr: '/accueil-v2', en: '/home-v2', es: '/inicio-v2' },

  '/a-propos': { fr: '/a-propos', en: '/about', es: '/quienes-somos' },
  '/contact': { fr: '/contact', en: '/contact', es: '/contacto' },
  '/references': { fr: '/references', en: '/references', es: '/referencias' },
  '/politique-de-confidentialite': {
    fr: '/politique-de-confidentialite',
    en: '/privacy-policy',
    es: '/politica-de-privacidad',
  },

  '/nos-services': { fr: '/nos-services', en: '/services', es: '/servicios' },
  '/nos-services/[slug]': { fr: '/nos-services/[slug]', en: '/services/[slug]', es: '/servicios/[slug]' },

  '/terrains': { fr: '/terrains', en: '/land', es: '/terrenos' },
  '/terrains/[slug]': { fr: '/terrains/[slug]', en: '/land/[slug]', es: '/terrenos/[slug]' },

  '/programmes': { fr: '/programmes', en: '/developments', es: '/programas' },
  '/programmes/en-cours': { fr: '/programmes/en-cours', en: '/developments/ongoing', es: '/programas/en-curso' },
  '/programmes/realises': { fr: '/programmes/realises', en: '/developments/completed', es: '/programas/entregados' },
  '/programmes/[slug]': { fr: '/programmes/[slug]', en: '/developments/[slug]', es: '/programas/[slug]' },

  '/appartements': { fr: '/appartements', en: '/apartments', es: '/apartamentos' },

  '/blog': '/blog',
  '/blog/[slug]': '/blog/[slug]',
  '/blog/categorie/[slug]': { fr: '/blog/categorie/[slug]', en: '/blog/category/[slug]', es: '/blog/categoria/[slug]' },

  '/boutique': { fr: '/boutique', en: '/shop', es: '/tienda' },
  '/ma-selection': { fr: '/ma-selection', en: '/my-selection', es: '/mi-seleccion' },
  '/devenir-partenaire': { fr: '/devenir-partenaire', en: '/become-a-partner', es: '/hazte-socio' },
  '/demande/[slug]': { fr: '/demande/[slug]', en: '/request/[slug]', es: '/solicitud/[slug]' },
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
