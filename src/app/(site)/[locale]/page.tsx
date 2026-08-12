import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ButtonLink } from '@/components/ui/button-link'
import { Hero } from '@/components/ui/hero'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import { GalleryScroll } from '@/components/ui/gallery-scroll'
import { PropertyCard } from '@/components/property/property-card'
import { getProperties, getHomePage } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import type { Media } from '@/payload-types'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tNav] = await Promise.all([getTranslations('site'), getTranslations('nav')])

  const terrains = await getProperties({
    locale: locale as Locale,
    productLine: 'foncier',
    availability: ['disponible', 'en-cours'],
    limit: 6,
  })

  // Realised work, used as the gallery — a developer leads with proof, where a
  // hotel would lead with atmosphere. See CLAUDE.md → template usage.
  const realised = await getProperties({
    locale: locale as Locale,
    productLine: 'immobilier',
    availability: ['realise', 'vendu'],
    limit: 10,
  })

  /**
   * Hero art comes from the home-page global, never from a listing. CPI's
   * featured images are promotional banners with text baked in, so using one
   * full-bleed collides with the headline. No image → solid brand ground.
   */
  const home = await getHomePage(locale as Locale)
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
            {/* tone="onDark": the hero ground is always dark. */}
            <ButtonLink href="/terrains" tone="onDark">
              {tNav('land')}
            </ButtonLink>
            <ButtonLink href="/contact" tone="onDark" variant="outline">
              {tNav('contact')}
            </ButtonLink>
          </>
        }
      />

      <section className="container-page py-20 lg:py-28">
        <SectionHeader
          eyebrow="Promotion foncière"
          title={tNav('land')}
          subtitle={t('description')}
          align="start"
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {terrains.map((property, i) => (
            <Reveal key={property.id} delay={(i % 3) * 90}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </div>
      </section>

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
