import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CmsPage } from '@/components/cms-page'
import { getPage, pageMetadata, SERVICE_SLUGS } from '@/lib/pages'
import type { Locale } from '@/i18n/locales'
import { localeCodes } from '@/i18n/locales'
import { alternatesForSlugs } from '@/lib/seo'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return localeCodes.flatMap((locale) =>
    Object.keys(SERVICE_SLUGS).map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const pageSlug = SERVICE_SLUGS[slug]
  return pageSlug
    ? {
        ...pageMetadata(await getPage(pageSlug, locale as Locale)),
        alternates: alternatesForSlugs(locale as Locale, '/nos-services/[slug]', { [locale as Locale]: slug }),
      }
    : {}
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const pageSlug = SERVICE_SLUGS[slug]
  if (!pageSlug) notFound()

  const page = await getPage(pageSlug, locale as Locale)
  if (!page) notFound()

  return <CmsPage page={page} locale={locale as Locale} eyebrow="Nos services" />
}
