import { getTranslations } from 'next-intl/server'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import { PropertyCard } from '@/components/property/property-card'
import { Link } from '@/i18n/routing'
import { getProperties } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import type { Property } from '@/payload-types'

type Filter = 'all' | 'ongoing' | 'completed'

const AVAILABILITY: Record<Filter, Property['availability'][]> = {
  all: ['disponible', 'en-cours', 'realise', 'vendu', 'a-louer'],
  ongoing: ['en-cours', 'disponible'],
  completed: ['realise', 'vendu'],
}

/**
 * The three views the old site built as separate hand-maintained WordPress
 * pages ("Projets en cours", "Projets déjà réalisés", "Nos programmes") are one
 * component over one collection, differing only by filter. That collapse is the
 * point of the taxonomy rework — see content-audit/MAPPING.md.
 */
export async function ProgrammesList({
  locale,
  filter,
}: {
  locale: Locale
  filter: Filter
}) {
  const [tNav, tProperty] = await Promise.all([
    getTranslations('nav'),
    getTranslations('property'),
  ])

  const properties = await getProperties({
    locale,
    productLine: 'immobilier',
    availability: AVAILABILITY[filter],
    limit: 48,
  })

  const title =
    filter === 'ongoing'
      ? tNav('developmentsOngoing')
      : filter === 'completed'
        ? tNav('developmentsCompleted')
        : tNav('developments')

  const tabs = [
    { key: 'all' as const, href: '/programmes' as const, label: tNav('developments') },
    { key: 'ongoing' as const, href: '/programmes/en-cours' as const, label: tNav('developmentsOngoing') },
    { key: 'completed' as const, href: '/programmes/realises' as const, label: tNav('developmentsCompleted') },
  ]

  return (
    <div className="container-page py-20 lg:py-28">
      <SectionHeader
        eyebrow="Promotion immobilière"
        title={title}
        subtitle={tProperty('count', { count: properties.length })}
        align="start"
      />

      {/* Filters live here rather than in the menu — the old nav nested four
          levels deep to express exactly these three states. */}
      <nav className="mt-10 flex flex-wrap gap-2" aria-label={title}>
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={tab.key === filter ? 'page' : undefined}
            className={
              tab.key === filter
                ? 'rounded-full bg-brand-solid px-5 py-2 text-sm font-medium text-brand-solid-foreground'
                : 'rounded-full border border-subtle px-5 py-2 text-sm text-foreground-muted transition-colors hover:border-brand-border hover:text-brand'
            }
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {properties.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, i) => (
            <Reveal key={property.id} delay={(i % 3) * 90}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-foreground-muted">{tProperty('count', { count: 0 })}</p>
      )}
    </div>
  )
}
