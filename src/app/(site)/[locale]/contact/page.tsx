import { setRequestLocale, getTranslations } from 'next-intl/server'

import { RenderBlocks } from '@/blocks/render'
import { SectionHeader } from '@/components/ui/section-header'
import { ContactDetails } from '@/components/contact/contact-details'
import { ContactChannels } from '@/components/contact/contact-channels'
import { getPage, getPageOr404, pageMetadata, PAGE_SLUGS } from '@/lib/pages'
import type { Locale } from '@/i18n/locales'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMetadata(await getPage(PAGE_SLUGS.contact, locale as Locale))
}

/**
 * Contact — composed like /a-propos rather than rendered from the CMS body.
 *
 * It used to be a bare `CmsPage`, which meant it was whatever the WordPress
 * import left behind: the title twice, the address three times, a stock photo,
 * and two mail addresses CPI has retired. The details a visitor actually needs
 * are already structured in `site-settings`, so they are read from there and
 * laid out, exactly as the founder block reads `home-page`.
 *
 * `RenderBlocks` stays at the end so the page is still extensible from the
 * admin — CPI can add an FAQ or a CTA below without touching this file.
 */
export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [page, t] = await Promise.all([
    getPageOr404(PAGE_SLUGS.contact, locale as Locale),
    getTranslations('contact'),
  ])

  return (
    <>
      <div className="border-b border-subtle bg-surface-sunken">
        <div className="container-page py-16 lg:py-20">
          <SectionHeader
            eyebrow={t('eyebrow')}
            title={page.title}
            subtitle={t('lead')}
            align="start"
          />
        </div>
      </div>

      <ContactDetails />
      <ContactChannels />

      <RenderBlocks blocks={page.blocks} locale={locale as Locale} />
    </>
  )
}
