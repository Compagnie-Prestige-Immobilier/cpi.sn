import { getTranslations } from 'next-intl/server'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import { Link } from '@/i18n/routing'
import { getPage, SERVICE_SLUGS } from '@/lib/pages'
import type { Locale } from '@/i18n/locales'

/**
 * The four business lines plus the legal practice, as real cards.
 *
 * On the old site these were Elementor cards that the import flattened into one
 * run-on line — "Services Promotion Foncière Plus de détails Services
 * Intermédiation Plus de détails …". Titles are read from the service pages
 * themselves so they never drift from what editors change in the CMS.
 */
export async function ServicesGrid({ locale }: { locale: Locale }) {
  const t = await getTranslations('common')
  const tNav = await getTranslations('nav')

  const services = (
    await Promise.all(
      Object.entries(SERVICE_SLUGS).map(async ([route, slug]) => {
        const page = await getPage(slug, locale)
        return page ? { route, title: page.title } : null
      }),
    )
  ).filter((s): s is { route: string; title: string } => Boolean(s))

  if (!services.length) return null

  return (
    <section className="container-page py-20 lg:py-24">
      <SectionHeader eyebrow="Nos métiers" title={tNav('services')} align="start" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <Reveal key={service.route} delay={(i % 3) * 80}>
            <Link
              href={{ pathname: '/nos-services/[slug]', params: { slug: service.route } }}
              className="group flex h-full flex-col justify-between rounded-lg border border-subtle bg-surface-raised p-6 transition-colors hover:border-brand-border"
            >
              <h3 className="font-heading text-xl text-foreground group-hover:text-brand">
                {service.title}
              </h3>
              <span className="mt-6 text-sm font-medium text-brand">{t('readMore')} →</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
