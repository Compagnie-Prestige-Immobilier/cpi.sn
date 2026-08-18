import { setRequestLocale, getTranslations } from 'next-intl/server'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import { PropertyCard } from '@/components/property/property-card'
import { getProperties } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import { localeAlternates } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return { title: t('apartments'), alternates: localeAlternates(locale as Locale, '/appartements') }
}

export default async function ApartmentsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [tNav, tProperty] = await Promise.all([
    getTranslations('nav'),
    getTranslations('property'),
  ])

  const properties = await getProperties({ locale: locale as Locale, kind: 'appartement', limit: 48 })

  return (
    <div className="container-page py-20 lg:py-28">
      <SectionHeader
        eyebrow="Promotion immobilière"
        title={tNav('apartments')}
        subtitle={tProperty('count', { count: properties.length })}
        align="start"
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property, i) => (
          <Reveal key={property.id} delay={(i % 3) * 90}>
            <PropertyCard property={property} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
