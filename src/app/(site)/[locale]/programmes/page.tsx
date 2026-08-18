import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ProgrammesList } from '@/components/property/programmes-list'
import type { Locale } from '@/i18n/locales'
import { localeAlternates } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return { title: t('developments'), alternates: localeAlternates(locale as Locale, '/programmes') }
}

export default async function ProgrammesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ProgrammesList locale={locale as Locale} filter="all" />
}
