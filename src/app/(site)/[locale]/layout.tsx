import type { Metadata } from 'next'
import { Big_Shoulders, Manrope } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ThemeProvider } from '@/components/theme-provider'
import { CartProvider } from '@/components/cart/cart-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import { JsonLd } from '@/components/seo/json-ld'
import { getSiteSettings } from '@/lib/payload'
import { graph, organizationJsonLd, websiteJsonLd } from '@/lib/json-ld'
import { absoluteUrl, IS_PLACEHOLDER_ORIGIN, localeAlternates, SITE_ORIGIN } from '@/lib/seo'
import { getDirection, localeCodes, type Locale } from '@/i18n/locales'
import { getPathname, routing } from '@/i18n/routing'

import '../../globals.css'

/**
 * The redesign's typography: a condensed display face for headings, Manrope for
 * everything else. Replaces Cormorant Garamond + Inter site-wide — the header
 * changes on every page, so leaving the rest on the old pairing would read as a
 * half-finished migration.
 */
// Google consolidated "Big Shoulders Display" into the `Big_Shoulders` family;
// the export the designer's CSS names no longer exists in next/font.
const display = Big_Shoulders({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const body = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body-sans',
  display: 'swap',
})

/**
 * The public site renders per request, not at build time.
 *
 * Two reasons, and the first is the important one:
 *
 *  1. It's a CMS. Every page reads Payload — this layout alone loads the
 *     `navigation` and `site-settings` globals. Prerendered, an edit CPI makes
 *     in the admin would not appear until someone rebuilt and redeployed the
 *     app. That is not a trade-off worth making on a site whose whole point is
 *     that the client can maintain it.
 *
 *  2. It decouples the build from the database. `next build` would otherwise
 *     need a reachable Postgres to prerender 54 pages, which fails in CI and in
 *     `docker build`, where no database exists.
 *
 * SSR is cheap here: Payload's Local API runs in the same process, so there is
 * no HTTP round trip. If traffic ever justifies it, the route to take is
 * on-demand revalidation from Payload hooks — not a return to build-time
 * prerendering.
 */
export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return localeCodes.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'site' })
  const title = `${t('fullName')} — ${t('tagline')}`

  return {
    title: { default: title, template: `%s — ${t('name')}` },
    description: t('description'),
    // Always defined, so every relative OG image and canonical resolves. The
    // origin comes from SITE_URL at runtime — see src/lib/seo.ts.
    metadataBase: new URL(SITE_ORIGIN),
    applicationName: t('fullName'),
    // Individual routes override this with their own canonical + hreflang; the
    // layout only supplies a sane default for anything that does not.
    alternates: localeAlternates(locale as Locale, '/'),
    openGraph: {
      type: 'website',
      siteName: t('fullName'),
      title,
      description: t('description'),
      url: absoluteUrl(getPathname({ locale: locale as Locale, href: '/' })),
      locale,
      alternateLocale: localeCodes.filter((c) => c !== locale),
    },
    twitter: { card: 'summary_large_image', title, description: t('description') },
    // Search Console ownership: the token from the "HTML tag" method. Omitted
    // entirely until set, and read at runtime — a NEXT_PUBLIC_ name would be
    // frozen at build time, when this image has no such variable.
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
    // Staging and any deploy that forgot SITE_URL stay out of the
    // index entirely — a second indexed copy of cpi.sn is the one SEO mistake
    // this rebuild cannot afford.
    robots: IS_PLACEHOLDER_ORIGIN
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  }
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Required for static rendering of this locale's routes.
  setRequestLocale(locale)

  const [t, tSite, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'site' }),
    getSiteSettings(locale as Locale),
  ])

  /**
   * One organisation + website graph, emitted on every page from the layout.
   *
   * It lives here rather than on the homepage alone so that a visitor landing
   * on a single land listing from search still gets CPI's identity, address and
   * phone number in the markup — which is what a knowledge panel and local
   * results are built from. Per-page nodes reference this one by `@id` instead
   * of repeating it.
   */
  const siteGraph = graph(
    organizationJsonLd(settings, tSite('description')),
    websiteJsonLd(tSite('fullName'), locale as Locale),
  )

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      // next-themes writes the theme class here before paint.
      suppressHydrationWarning
      className={`${display.variable} ${body.variable}`}
    >
      <body className="min-h-dvh bg-surface text-foreground antialiased">
        <JsonLd data={siteGraph} />
        <GoogleAnalytics />
        <NextIntlClientProvider>
          <ThemeProvider>
            <CartProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-solid focus:px-4 focus:py-2 focus:text-brand-solid-foreground"
              >
                {t('skipToContent')}
              </a>
              <SiteHeader />
              <main id="main">{children}</main>
              <SiteFooter />
            </CartProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
