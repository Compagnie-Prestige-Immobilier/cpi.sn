import { RenderBlocks } from '@/blocks/render'
import { SectionHeader } from '@/components/ui/section-header'
import type { Locale } from '@/i18n/locales'
import type { Page } from '@/payload-types'

/**
 * Standard shell for a CMS-driven page: a title band, then its blocks.
 *
 * The imported pages are currently a single rich-text block each — the copy was
 * the thing that had to survive the migration. Restructuring them into hero /
 * stats / timeline blocks is editorial work CPI can now do in the admin without
 * a deploy.
 */
export function CmsPage({
  page,
  locale,
  eyebrow,
}: {
  page: Page
  locale: Locale
  eyebrow?: string
}) {
  return (
    <>
      <div className="border-b border-subtle bg-surface-sunken">
        <div className="container-page py-16 lg:py-20">
          <SectionHeader eyebrow={eyebrow} title={page.title} align="start" />
        </div>
      </div>
      <RenderBlocks blocks={page.blocks} locale={locale} />
    </>
  )
}
