import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'

/**
 * Placeholder home page — proves the foundation works end to end:
 * locale routing, message catalogs, semantic theme tokens, fonts.
 *
 * The real homepage (hero, 4 métiers, terrains, réalisations, CTA) is phase 5,
 * built on the Ombara skeleton. See plan.md §8.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tNav] = await Promise.all([
    getTranslations('site'),
    getTranslations('nav'),
  ])

  return (
    <div className="container-page py-24 lg:py-32">
      <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
        {t('name')} — Phase 1
      </p>

      <h1 className="mt-6 max-w-4xl font-heading text-5xl leading-[1.05] text-foreground lg:text-7xl">
        {t('fullName')}
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-foreground-muted">{t('tagline')}</p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/terrains"
          className="rounded-full bg-brand-solid px-7 py-3 text-sm font-medium text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover"
        >
          {tNav('land')}
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-brand-border px-7 py-3 text-sm font-medium text-brand transition-colors hover:bg-brand-muted"
        >
          {tNav('contact')}
        </Link>
      </div>

      {/* Token smoke test — every swatch must stay legible in both themes. */}
      <section className="mt-20 border-t border-subtle pt-10">
        <h2 className="font-heading text-2xl text-foreground">Design tokens</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Swatch className="bg-surface-raised text-foreground" label="surface-raised" />
          <Swatch className="bg-surface-sunken text-foreground" label="surface-sunken" />
          <Swatch
            className="bg-brand-solid text-brand-solid-foreground"
            label="brand-solid"
          />
          <Swatch className="bg-brand-muted text-brand" label="brand-muted" />
        </div>
      </section>
    </div>
  )
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div
      className={`rounded-lg border border-subtle p-5 text-sm ${className}`}
    >
      {label}
    </div>
  )
}
