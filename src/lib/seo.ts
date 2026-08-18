import { getPathname } from '@/i18n/routing'
import { localeCodes, defaultLocale, type Locale } from '@/i18n/locales'

/**
 * Absolute URLs and hreflang, in one place.
 *
 * The origin is never written here. `npm run check:legacy` fails the build on
 * the production hostname appearing in application source, because for the
 * whole of this rebuild such a string meant "still pointing at the old
 * WordPress install". After cutover that host *is* this app, but the guard
 * cannot tell the two apart — and the value belongs in the environment for a
 * self-hosted deploy regardless. It is documented in `.env.example` and
 * `DEPLOY.md`.
 *
 * **`SITE_URL` first, `NEXT_PUBLIC_SERVER_URL` only as a fallback**, and the
 * distinction is not cosmetic. Anything named `NEXT_PUBLIC_*` is substituted
 * into the code as a string literal *at build time* — that is what the prefix
 * means. `docker build` here runs with no such variable (the Dockerfile passes
 * only placeholder secrets and never reaches the database), so the public name
 * would freeze at the localhost fallback and no value Dokploy sets at runtime
 * could ever override it. Every consumer of this module is server-side, so a
 * plain server variable is read fresh when the container starts.
 *
 * Get it wrong and every canonical, hreflang, OG image and sitemap entry points
 * at localhost — silently, because nothing in the app breaks.
 */
const FALLBACK_ORIGIN = 'http://localhost:3000'

/** Origin with no trailing slash. */
export const SITE_ORIGIN = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  FALLBACK_ORIGIN
).replace(/\/+$/, '')

/** True when the origin is still the dev fallback — used to keep staging out of the index. */
export const IS_PLACEHOLDER_ORIGIN = SITE_ORIGIN === FALLBACK_ORIGIN

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

/** The `href` shape `getPathname` accepts — a routing key, or one plus params. */
export type SeoHref = Parameters<typeof getPathname>[0]['href']

/**
 * `canonical` + the full `hreflang` set for one route.
 *
 * Every locale is listed on every page, plus `x-default` pointing at French —
 * Google requires the set to be complete and self-referential, so a page that
 * only names its own language is worse than no annotation at all.
 *
 * For dynamic routes the caller passes one slug, which is then used for all
 * locales. That is correct while CMS content is French-only: `slug` is a
 * localized field, but `findBySlugWithFallback` resolves a French slug in any
 * locale. Once CPI translates slugs, this needs the per-locale slug passed in
 * instead — see `alternatesForSlugs` below.
 */
export function localeAlternates(locale: Locale, href: SeoHref) {
  const languages: Record<string, string> = {}
  for (const code of localeCodes) {
    languages[code] = absoluteUrl(getPathname({ locale: code, href }))
  }
  languages['x-default'] = languages[defaultLocale]

  return { canonical: absoluteUrl(getPathname({ locale, href })), languages }
}

/**
 * As above, but for a document whose slug genuinely differs per locale.
 * `slugs` is keyed by locale code; a locale with no entry falls back to the
 * default locale's slug rather than being dropped from the set.
 */
export function alternatesForSlugs(
  locale: Locale,
  pathname: string,
  slugs: Partial<Record<Locale, string>>,
) {
  const slugFor = (code: Locale) => slugs[code] ?? slugs[defaultLocale] ?? ''
  const build = (code: Locale) =>
    absoluteUrl(
      getPathname({
        locale: code,
        // The pathname is a routing key with a [slug] segment; the cast is
        // needed because that key is only known at the call site.
        href: { pathname, params: { slug: slugFor(code) } } as SeoHref,
      }),
    )

  const languages: Record<string, string> = {}
  for (const code of localeCodes) languages[code] = build(code)
  languages['x-default'] = languages[defaultLocale]

  return { canonical: build(locale), languages }
}

/** Absolute URL for a Payload upload, which stores relative paths by design. */
export function mediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  return url.startsWith('http') ? url : absoluteUrl(url)
}
