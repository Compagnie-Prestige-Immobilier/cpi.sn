/**
 * THE locale registry — single source of truth.
 *
 * This file drives:
 *   - next-intl routing (src/i18n/routing.ts)
 *   - the <html lang> and dir attributes
 *   - the language switcher
 *   - sitemap hreflang tags
 *   - Payload's localization.locales (payload.config.ts)
 *
 * Adding a language = add one entry here + one file in src/messages/.
 * Nothing else should ever need to change. If it does, the abstraction has
 * leaked — fix the abstraction rather than patching call sites.
 *
 * See CLAUDE.md → Internationalization.
 */

export interface LocaleDefinition {
  /** BCP-47 code. Also the message-catalog filename and the URL prefix. */
  code: string
  /** Native name, shown in the language switcher. Never translated. */
  label: string
  /** Writing direction. All current locales are LTR; the field exists so an
   *  RTL locale can be added without reworking layout. */
  dir: 'ltr' | 'rtl'
  /** ISO 3166 region whose flag represents this locale in the switcher.
   *  Optional: a locale without one falls back to a lettered badge, so adding a
   *  language never blocks on artwork. A language is not a country — this is a
   *  presentational shorthand the designer asked for, nothing more. */
  flag?: string
  /** Exactly one locale must be the default. It is served without a URL prefix. */
  default?: boolean
  /** Locale to fall back to for missing content. Deliberately NOT English for
   *  regional languages — Senegalese users read French as their second language. */
  fallback?: string
}

export const locales = [
  { code: 'fr', label: 'Français', dir: 'ltr', flag: 'FR', default: true },
  { code: 'en', label: 'English', dir: 'ltr', flag: 'GB', fallback: 'fr' },

  // Planned. Uncomment + add src/messages/<code>.json to enable.
  // { code: 'wo', label: 'Wolof', dir: 'ltr', flag: 'SN', fallback: 'fr' },
  // { code: 'ha', label: 'Hausa', dir: 'ltr', fallback: 'fr' },
] as const satisfies readonly LocaleDefinition[]

export type Locale = (typeof locales)[number]['code']

/** All locale codes, in registry order. */
export const localeCodes = locales.map((l) => l.code) as Locale[]

const fallbackDefault = locales.find((l) => 'default' in l && l.default)
if (!fallbackDefault) {
  throw new Error('[i18n] No default locale defined in the registry.')
}

/** The unprefixed locale. French — see CLAUDE.md for why this must not change. */
export const defaultLocale: Locale = fallbackDefault.code

export function getLocale(code: string): LocaleDefinition | undefined {
  return locales.find((l) => l.code === code)
}

export function isLocale(code: string): code is Locale {
  return localeCodes.includes(code as Locale)
}

export function getDirection(code: string): 'ltr' | 'rtl' {
  return getLocale(code)?.dir ?? 'ltr'
}

export function getFallback(code: string): Locale | undefined {
  const fallback = getLocale(code)?.fallback
  return fallback && isLocale(fallback) ? fallback : undefined
}

/**
 * The registry in Payload's `localization.locales` shape.
 *
 * Lives here rather than in payload.config.ts so the registry stays the only
 * place a locale is ever declared — see the file header.
 */
export const payloadLocales = locales.map(({ code, label }) => {
  const fallbackLocale = getFallback(code)
  return {
    code,
    label,
    ...(fallbackLocale ? { fallbackLocale } : {}),
  }
})
