import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Media } from '@/payload-types'
import { PropertyDetail } from '@/components/property/property-detail'
import { getPropertyBySlug } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

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
  }
}

export default async function PropertyPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const property = await getPropertyBySlug(slug, locale as Locale)
  if (!property) notFound()

  return <PropertyDetail property={property} />
}
