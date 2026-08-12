import Image from 'next/image'
import { getTranslations, getFormatter } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import type { Property, Media, City } from '@/payload-types'

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

/** Sold stock stays visible as proof of delivery, but must not look for sale. */
const isInactive = (a: Property['availability']) => a === 'vendu' || a === 'realise'

export async function PropertyCard({ property }: { property: Property }) {
  const [t, tCommon, format] = await Promise.all([
    getTranslations('property'),
    getTranslations('common'),
    getFormatter(),
  ])

  const image = property.featuredImage as Media | null
  const city = property.city as City | null
  const href =
    property.productLine === 'foncier'
      ? ({ pathname: '/terrains/[slug]', params: { slug: property.slug } } as const)
      : ({ pathname: '/programmes/[slug]', params: { slug: property.slug } } as const)

  const specs = [
    city?.name,
    property.surface ? `${format.number(property.surface)} m²` : null,
    property.titleDeed,
  ].filter(Boolean)

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg border border-subtle bg-surface-raised transition-colors hover:border-brand-border"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken">
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.alt ?? property.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
              isInactive(property.availability) ? 'saturate-[0.65]' : ''
            }`}
          />
        ) : null}

        <span
          className={`absolute start-4 top-4 rounded-full px-3 py-1 text-[0.6875rem] font-medium tracking-wide uppercase ${
            isInactive(property.availability)
              ? 'bg-surface/90 text-foreground-muted'
              : 'bg-brand-solid text-brand-solid-foreground'
          }`}
        >
          {t(`status.${AVAILABILITY_KEY[property.availability]}`)}
        </span>
      </div>

      <div className="p-5">
        <p className="text-[0.6875rem] tracking-[0.16em] text-accent uppercase">
          {t(`kind.${KIND_KEY[property.kind]}`)}
        </p>

        <h3 className="mt-2 font-heading text-xl leading-snug text-foreground group-hover:text-brand">
          {property.title}
        </h3>

        {specs.length ? (
          <p className="mt-2 text-sm text-foreground-muted">{specs.join(' · ')}</p>
        ) : null}

        <p className="mt-4 text-sm font-medium text-brand">
          {/*
            Only 22 of 61 listings ever had a price, and most real ones did not —
            "Prix sur demande" is the normal case here, not a fallback.
            XOF has no minor unit, so the formatter renders no decimals.
          */}
          {property.showPrice && property.price
            ? [property.priceNote, format.number(property.price, 'currency')]
                .filter(Boolean)
                .join(' ')
            : tCommon('priceOnRequest')}
        </p>
      </div>
    </Link>
  )
}
