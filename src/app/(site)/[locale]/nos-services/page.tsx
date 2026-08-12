import { setRequestLocale, getTranslations } from 'next-intl/server'
import { CmsPage } from '@/components/cms-page'
import { Reveal } from '@/components/ui/reveal'
import { Link } from '@/i18n/routing'
import { getPage, getPageOr404, pageMetadata, PAGE_SLUGS, SERVICE_SLUGS } from '@/lib/pages'
import type { Locale } from '@/i18n/locales'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMetadata(await getPage(PAGE_SLUGS.services, locale as Locale))
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('common')
  const page = await getPageOr404(PAGE_SLUGS.services, locale as Locale)

  // Resolve each service page for its real title, rather than hardcoding labels
  // that would drift from what editors change in the CMS.
  const services = (
    await Promise.all(
      Object.entries(SERVICE_SLUGS).map(async ([route, slug]) => {
        const child = await getPage(slug, locale as Locale)
        return child ? { route, title: child.title } : null
      }),
    )
  ).filter((s): s is { route: string; title: string } => Boolean(s))

  return (
    <>
      <CmsPage page={page} locale={locale as Locale} eyebrow="CPI" />

      <section className="container-page pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.route} delay={(i % 3) * 90}>
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
    </>
  )
}
