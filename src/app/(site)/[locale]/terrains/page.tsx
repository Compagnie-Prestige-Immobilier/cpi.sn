import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import { PropertyCard } from '@/components/property/property-card'
import { getProperties } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import { localeAlternates } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return { title: t('land'), alternates: localeAlternates(locale as Locale, '/terrains') }
}

export default async function TerrainsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tProperty] = await Promise.all([
    getTranslations('nav'),
    getTranslations('property'),
  ])

  // Land programmes: available stock first, sold-out sites after — they are
  // still worth showing as proof of delivery, just not as inventory.
  const available = await getProperties({
    locale: locale as Locale,
    productLine: 'foncier',
    availability: ['disponible', 'en-cours'],
  })
  const past = await getProperties({
    locale: locale as Locale,
    productLine: 'foncier',
    availability: ['vendu', 'realise'],
    limit: 12,
  })

  return (
    <div className="container-page py-20 lg:py-28">
      <SectionHeader
        eyebrow="Promotion foncière"
        title={t('land')}
        subtitle={tProperty('count', { count: available.length })}
        align="start"
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {available.map((property, i) => (
          <Reveal key={property.id} delay={(i % 3) * 90}>
            <PropertyCard property={property} />
          </Reveal>
        ))}
      </div>

      {past.length ? (
        <section className="mt-24 border-t border-subtle pt-16">
          <SectionHeader
            eyebrow="Références"
            title={tProperty('status.completed')}
            align="start"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((property, i) => (
              <Reveal key={property.id} delay={(i % 3) * 90}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
