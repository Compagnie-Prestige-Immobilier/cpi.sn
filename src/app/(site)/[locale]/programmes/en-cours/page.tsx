import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ProgrammesList } from '@/components/property/programmes-list'
import type { Locale } from '@/i18n/locales'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return { title: t('developmentsOngoing') }
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ProgrammesList locale={locale as Locale} filter="ongoing" />
}
