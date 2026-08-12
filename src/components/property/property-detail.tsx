import Image from 'next/image'
import { getTranslations, getFormatter } from 'next-intl/server'
import { RichText } from '@/components/rich-text'
import { GalleryScroll } from '@/components/ui/gallery-scroll'
import { VideoModal } from '@/components/ui/video-modal'
import type { Property, Media, City, Amenity } from '@/payload-types'

const AVAILABILITY_KEY = {
  disponible: 'available',
  'en-cours': 'ongoing',
  realise: 'completed',
  vendu: 'sold',
  'a-louer': 'forRent',
} as const

const KIND_KEY = {
  terrain: 'terrain',
  villa: 'villa',
  appartement: 'apartment',
  immeuble: 'building',
  bureau: 'office',
  commerce: 'retail',
} as const

export async function PropertyDetail({ property }: { property: Property }) {
  const [t, tCommon, format] = await Promise.all([
    getTranslations('property'),
    getTranslations('common'),
    getFormatter(),
  ])

  const hero = property.featuredImage as Media | null
  const city = property.city as City | null
  const amenities = (property.amenities ?? []).filter(
    (a): a is Amenity => typeof a === 'object',
  )
  const gallery = (property.gallery ?? []).filter(
    (m): m is Media => typeof m === 'object' && Boolean(m?.url),
  )

  /* Only the specs that exist. A grid of "—" placeholders makes sparse source
     data look like missing information rather than an honest listing. */
  const specs = [
    { label: t('specs.city'), value: city?.name },
    { label: t('specs.surface'), value: property.surface ? `${format.number(property.surface)} m²` : null },
    { label: t('specs.bedrooms'), value: property.bedrooms },
    { label: t('specs.bathrooms'), value: property.bathrooms },
    { label: t('specs.year'), value: property.year },
    { label: t('specs.titleDeed'), value: property.titleDeed },
  ].filter((s) => s.value !== null && s.value !== undefined && s.value !== '')

  return (
    <article>
      <div className="relative isolate flex min-h-[55vh] items-end overflow-hidden bg-[var(--burgundy-900)] lg:min-h-[65vh]">
        {hero?.url ? (
          <Image src={hero.url} alt={hero.alt ?? property.title} fill priority sizes="100vw" data-no-dim className="-z-10 object-cover" />
        ) : null}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/15" />

        <div className="container-page pb-12 lg:pb-16">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/15 px-3 py-1 text-[0.6875rem] font-medium tracking-wide text-white uppercase backdrop-blur">
              {t(`kind.${KIND_KEY[property.kind]}`)}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[0.6875rem] font-medium tracking-wide text-[var(--burgundy-800)] uppercase">
              {t(`status.${AVAILABILITY_KEY[property.availability]}`)}
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl font-heading text-4xl leading-[1.08] text-white lg:text-6xl">
            {property.title}
          </h1>
          <p className="mt-4 text-lg font-medium text-white">
            {property.showPrice && property.price
              ? [property.priceNote, format.number(property.price, 'currency')].filter(Boolean).join(' ')
              : tCommon('priceOnRequest')}
          </p>
        </div>
      </div>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div>
          {property.excerpt ? (
            <p className="text-lg text-foreground">{property.excerpt}</p>
          ) : null}
          <RichText data={property.description} className="mt-6" />

          {property.videoUrl ? (
            <div className="mt-10 max-w-2xl">
              <VideoModal url={property.videoUrl} poster={hero?.url ?? undefined} posterAlt={hero?.alt ?? ''} />
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          {specs.length ? (
            <dl className="rounded-lg border border-subtle bg-surface-raised p-6">
              {specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-4 border-b border-subtle py-3 first:pt-0 last:border-0 last:pb-0">
                  <dt className="text-sm text-foreground-muted">{spec.label}</dt>
                  <dd className="text-end text-sm font-medium text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {amenities.length ? (
            <div className="mt-6 rounded-lg border border-subtle bg-surface-raised p-6">
              <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
                {t('amenitiesTitle')}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <li key={amenity.id} className="rounded-full bg-brand-muted px-3 py-1 text-xs text-brand">
                    {amenity.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {gallery.length ? <GalleryScroll title={property.title} images={gallery} /> : null}
    </article>
  )
}
