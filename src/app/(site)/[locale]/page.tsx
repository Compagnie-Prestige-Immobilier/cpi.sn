import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ButtonLink } from '@/components/ui/button-link'
import { Hero } from '@/components/ui/hero'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import { GalleryScroll } from '@/components/ui/gallery-scroll'
import { PropertyCard } from '@/components/property/property-card'
import { StatsBand } from '@/components/home/stats-band'
import { Founder } from '@/components/home/founder'
import { ValueProps } from '@/components/home/value-props'
import { getProperties, getHomePage } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import type { Media, Property } from '@/payload-types'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tNav, tCommon] = await Promise.all([
    getTranslations('site'),
    getTranslations('nav'),
    getTranslations('common'),
  ])

  const home = await getHomePage(locale as Locale)

  // Editorially chosen when set, otherwise the newest available land. Never a
  // silent fallback to whatever happens to be first in the collection.
  const picked = (home.featuredProperties ?? []).filter(
    (p): p is Property => typeof p === 'object',
  )
  const terrains = picked.length
    ? picked
    : await getProperties({
        locale: locale as Locale,
        productLine: 'foncier',
        availability: ['disponible', 'en-cours'],
        limit: 6,
      })

  // Realised work as the gallery — a developer leads with proof delivered,
  // where the hotel template led with atmosphere.
  const realised = await getProperties({
    locale: locale as Locale,
    productLine: 'immobilier',
    availability: ['realise', 'vendu'],
    limit: 10,
  })

  const heroImage = (home.heroImage as Media | null) ?? null
  const galleryImages = realised
    .map((p) => p.featuredImage as Media | null)
    .filter((m): m is Media => Boolean(m?.url))

  return (
    <>
      <Hero
        eyebrow={home.heroEyebrow ?? t('name')}
        title={home.heroTitle ?? t('fullName')}
        subtitle={home.heroSubtitle ?? t('tagline')}
        image={heroImage?.url ?? null}
        imageAlt={heroImage?.alt ?? ''}
        videoUrl={home.heroVideoUrl}
        actions={
          <>
            {/* tone="onDark": the hero ground is dark in every state. */}
            <ButtonLink href="/terrains" tone="onDark">
              {tNav('land')}
            </ButtonLink>
            <ButtonLink href="/contact" tone="onDark" variant="outline">
              {tNav('contact')}
            </ButtonLink>
          </>
        }
      />

      <StatsBand stats={home.stats} />

      <section className="container-page py-20 lg:py-24">
        <SectionHeader
          eyebrow="Promotion foncière"
          title={tNav('land')}
          subtitle={t('description')}
          align="start"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {terrains.map((property, i) => (
            <Reveal key={property.id} delay={(i % 3) * 90}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </div>
        {/* A CTA reading "6 biens" is a count, not an invitation. */}
        <ButtonLink href="/terrains" variant="outline" className="mt-10">
          {tCommon('seeAll')}
        </ButtonLink>
      </section>

      <Founder founder={home.founder} />

      <ValueProps
        items={home.valueProps}
        eyebrow="Pourquoi CPI"
        title="Nos engagements"
      />

      {galleryImages.length ? (
        <GalleryScroll
          eyebrow="Réalisations"
          title={tNav('developmentsCompleted')}
          images={galleryImages}
        />
      ) : null}
    </>
  )
}
