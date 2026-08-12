import { setRequestLocale } from 'next-intl/server'
import { CmsPage } from '@/components/cms-page'
import { getPage, getPageOr404, pageMetadata, PAGE_SLUGS } from '@/lib/pages'
import type { Locale } from '@/i18n/locales'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMetadata(await getPage(PAGE_SLUGS.contact, locale as Locale))
}

export default async function CmsRoute({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const page = await getPageOr404(PAGE_SLUGS.contact, locale as Locale)
  return <CmsPage page={page} locale={locale as Locale} />
}
