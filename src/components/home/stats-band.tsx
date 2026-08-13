import { Reveal } from '@/components/ui/reveal'
import type { HomePage } from '@/payload-types'

/**
 * Key figures.
 *
 * Static values from the CMS, not animated counters. Elementor's counters on
 * the old site rendered as literal "0" for anyone without JS — a page claiming
 * "0 Années d'expérience" for a twenty-year-old company.
 */
export function StatsBand({ stats }: { stats: HomePage['stats'] }) {
  if (!stats?.length) return null

  return (
    <section className="border-y border-subtle bg-surface-sunken">
      <dl className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.id ?? i} delay={i * 80}>
            <dt className="font-heading text-4xl text-brand lg:text-5xl">{stat.value}</dt>
            <dd className="mt-2 text-sm text-foreground-muted">{stat.label}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}
