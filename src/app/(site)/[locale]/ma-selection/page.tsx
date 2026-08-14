import { setRequestLocale, getTranslations } from 'next-intl/server'
import { SectionHeader } from '@/components/ui/section-header'
import { SelectionForm } from '@/components/cart/selection-form'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cart' })
  // A personal, transient page — no value in search results.
  return { title: t('title'), robots: { index: false, follow: true } }
}

export default async function SelectionPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('cart')

  return (
    <div className="container-page py-20 lg:py-28">
      <SectionHeader eyebrow="CPI" title={t('title')} align="start" />
      <div className="mt-12">
        <SelectionForm />
      </div>
    </div>
  )
}
