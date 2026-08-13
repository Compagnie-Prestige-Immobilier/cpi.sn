import { setRequestLocale } from 'next-intl/server'
import { RenderBlocks } from '@/blocks/render'
import { SectionHeader } from '@/components/ui/section-header'
import { ServicesGrid } from '@/components/about/services-grid'
import { TeamGrid } from '@/components/about/team-grid'
import { getPage, getPageOr404, pageMetadata, PAGE_SLUGS } from '@/lib/pages'
import { getTeam } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMetadata(await getPage(PAGE_SLUGS.about, locale as Locale))
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const page = await getPageOr404(PAGE_SLUGS.about, locale as Locale)
  const team = await getTeam(locale as Locale)

  return (
    <>
      <div className="border-b border-subtle bg-surface-sunken">
        <div className="container-page py-16 lg:py-20">
          <SectionHeader eyebrow="CPI" title={page.title} align="start" />
        </div>
      </div>

      {/* Blocks carry the narrative: intro, chiffres, parcours, valeurs,
          expertise, CTA. Services and team are collections, so they are
          composed here rather than duplicated into the page content. */}
      <RenderBlocks blocks={page.blocks} locale={locale as Locale} />

      <ServicesGrid locale={locale as Locale} />
      <TeamGrid members={team} />
    </>
  )
}
