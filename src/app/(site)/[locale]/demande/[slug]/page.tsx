import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { RenderBlocks } from '@/blocks/render'
import { SectionHeader } from '@/components/ui/section-header'
import { ContactForm } from '@/components/forms/contact-form'
import { getPage, pageMetadata, REQUEST_SLUGS } from '@/lib/pages'
import { localeCodes, type Locale } from '@/i18n/locales'

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return localeCodes.flatMap((locale) =>
    Object.keys(REQUEST_SLUGS).map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const pageSlug = REQUEST_SLUGS[slug]
  return pageSlug ? pageMetadata(await getPage(pageSlug, locale as Locale)) : {}
}

export default async function RequestPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const pageSlug = REQUEST_SLUGS[slug]
  if (!pageSlug) notFound()

  const page = await getPage(pageSlug, locale as Locale)
  if (!page) notFound()

  return (
    <>
      <div className="border-b border-subtle bg-surface-sunken">
        <div className="container-page py-16 lg:py-20">
          <SectionHeader eyebrow="CPI" title={page.title} align="start" />
        </div>
      </div>

      <RenderBlocks blocks={page.blocks} locale={locale as Locale} />

      <section className="container-page pb-24">
        <div className="mx-auto max-w-2xl">
          {/* `subject` is the page slug, so the admin inbox shows which of the
              seven request types an enquiry came from. */}
          <ContactForm subject={pageSlug} />
        </div>
      </section>
    </>
  )
}
