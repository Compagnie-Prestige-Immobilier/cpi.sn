import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ThemeProvider } from '@/components/theme-provider'
import { CartProvider } from '@/components/cart/cart-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getDirection, localeCodes } from '@/i18n/locales'
import { routing } from '@/i18n/routing'

import '../../globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
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

  return {
    title: {
      default: `${t('fullName')} — ${t('tagline')}`,
      template: `%s — ${t('name')}`,
    },
    description: t('description'),
    metadataBase: process.env.NEXT_PUBLIC_SERVER_URL
      ? new URL(process.env.NEXT_PUBLIC_SERVER_URL)
      : undefined,
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

  const t = await getTranslations({ locale, namespace: 'nav' })

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      // next-themes writes the theme class here before paint.
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body className="min-h-dvh bg-surface text-foreground antialiased">
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
