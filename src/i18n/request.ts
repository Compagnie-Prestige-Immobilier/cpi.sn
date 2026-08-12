import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'
import { getFallback, defaultLocale, type Locale } from './locales'

/**
 * Loads the message catalog for the active locale.
 *
 * Catalogs are merged over their fallback chain (see CLAUDE.md rule 7), so a
 * locale that is only partially translated still renders — with French, not
 * English, underneath. `npm run check:messages` fails the build when a catalog
 * drifts from fr.json, so this merge is a safety net, never the plan.
 */
async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  const messages = (await import(`../messages/${locale}.json`)).default
  const fallback = getFallback(locale)

  if (!fallback) return messages

  const base = await loadMessages(fallback)
  return deepMerge(base, messages)
}

function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(override)) {
    const existing = out[key]
    out[key] =
      isPlainObject(existing) && isPlainObject(value)
        ? deepMerge(existing, value)
        : value
  }

  return out
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : defaultLocale

  return {
    locale,
    messages: await loadMessages(locale),
    // Senegal is UTC+0 year-round (no DST), matching the WordPress install.
    timeZone: 'Africa/Dakar',
    formats: {
      number: {
        // XOF has no minor unit — never render decimals. See CLAUDE.md rule 8.
        currency: {
          style: 'currency',
          currency: 'XOF',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        },
      },
      dateTime: {
        long: { day: 'numeric', month: 'long', year: 'numeric' },
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
      },
    },
  }
})
