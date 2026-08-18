import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Media } from '@/payload-types'
import { PropertyDetail } from '@/components/property/property-detail'
import { getPropertyBySlug } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import { alternatesForSlugs, absoluteUrl } from '@/lib/seo'
import { JsonLd } from '@/components/seo/json-ld'
import { breadcrumbJsonLd, graph, propertyJsonLd } from '@/lib/json-ld'
import { getPathname } from '@/i18n/routing'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const property = await getPropertyBySlug(slug, locale as Locale)
  if (!property) return {}

  const og = (property.seo?.ogImage ?? property.featuredImage) as Media | null
  return {
    title: property.seo?.title || property.title,
    description: property.seo?.description || property.excerpt || undefined,
    openGraph: og?.url ? { images: [{ url: og.url, alt: og.alt ?? '' }] } : undefined,
    alternates: alternatesForSlugs(locale as Locale, '/programmes/[slug]', { [locale as Locale]: slug }),
    robots: property.seo?.noIndex ? { index: false, follow: false } : undefined,
  }
}

export default async function PropertyPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const property = await getPropertyBySlug(slug, locale as Locale)
  if (!property) notFound()

  const tNav = await getTranslations({ locale, namespace: 'nav' })
  const url = absoluteUrl(
    getPathname({ locale: locale as Locale, href: { pathname: '/programmes/[slug]', params: { slug } } }),
  )

  /* Product + Offer rather than a Residence type: it is what Google actually
     parses for listings, and the offer's availability keeps a sold plot from
     being advertised as buyable. The price is emitted only when CPI has chosen
     to show it — see src/lib/json-ld.ts. */
  const data = graph(
    propertyJsonLd(property, url, locale as Locale),
    breadcrumbJsonLd([
      { name: 'CPI', url: absoluteUrl(getPathname({ locale: locale as Locale, href: '/' })) },
      {
        name: tNav('developments'),
        url: absoluteUrl(getPathname({ locale: locale as Locale, href: '/programmes' })),
      },
      { name: property.title, url },
    ]),
  )

  return (
    <>
      <JsonLd data={data} />
      <PropertyDetail property={property} />
    </>
  )
}
