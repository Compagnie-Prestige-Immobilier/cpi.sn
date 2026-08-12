import Image from 'next/image'
import { RichText } from '@/components/rich-text'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import { GalleryScroll } from '@/components/ui/gallery-scroll'
import { ButtonLink } from '@/components/ui/button-link'
import { CmsLink } from '@/components/ui/cms-link'
import { PropertyCard } from '@/components/property/property-card'
import { getProperties } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import type { Page, Media, Property } from '@/payload-types'

type Block = NonNullable<Page['blocks']>[number]

/**
 * Renders the page-builder blocks.
 *
 * Unknown block types are skipped silently rather than throwing: a page saved
 * with a block we later remove should lose that section, not 500 the whole
 * route for every visitor.
 */
export async function RenderBlocks({
  blocks,
  locale,
}: {
  blocks?: Page['blocks'] | null
  locale: Locale
}) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block, i) => (
        <BlockSwitch key={block.id ?? i} block={block} locale={locale} />
      ))}
    </>
  )
}

async function BlockSwitch({ block, locale }: { block: Block; locale: Locale }) {
  switch (block.blockType) {
    case 'richText':
      return (
        <section className="container-page py-12">
          <div className={block.width === 'full' ? '' : 'max-w-3xl'}>
            <RichText data={block.content} />
          </div>
        </section>
      )

    case 'gallery': {
      const images = (block.images ?? []).filter(
        (m): m is Media => typeof m === 'object' && Boolean(m?.url),
      )
      return <GalleryScroll title={block.heading ?? ''} images={images} />
    }

    case 'stats':
      return (
        <section className="container-page py-16">
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {(block.items ?? []).map((item, i) => (
              <Reveal key={item.id ?? i} delay={i * 90}>
                <dt className="font-heading text-5xl text-brand">{item.value}</dt>
                <dd className="mt-2 text-sm text-foreground-muted">{item.label}</dd>
              </Reveal>
            ))}
          </dl>
        </section>
      )

    case 'timeline':
      return (
        <section className="container-page py-16">
          {block.heading ? <SectionHeader title={block.heading} align="start" /> : null}
          <ol className="mt-12 border-s border-subtle">
            {(block.entries ?? []).map((entry, i) => (
              <Reveal key={entry.id ?? i} delay={(i % 4) * 70}>
                <li className="relative ps-8 pb-10 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute start-0 top-2 size-2.5 -translate-x-1/2 rounded-full bg-brand rtl:translate-x-1/2"
                  />
                  <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
                    {entry.year}
                  </p>
                  <h3 className="mt-2 font-heading text-xl text-foreground">{entry.title}</h3>
                  {entry.body ? (
                    <p className="mt-2 max-w-2xl text-foreground-muted">{entry.body}</p>
                  ) : null}
                </li>
              </Reveal>
            ))}
          </ol>
        </section>
      )

    case 'valueGrid':
      return (
        <section className="container-page py-16">
          {block.heading ? <SectionHeader title={block.heading} align="start" /> : null}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(block.items ?? []).map((item, i) => (
              <Reveal key={item.id ?? i} delay={(i % 3) * 90}>
                <div className="h-full rounded-lg border border-subtle bg-surface-raised p-6">
                  <h3 className="font-heading text-xl text-foreground">{item.title}</h3>
                  {item.body ? (
                    <p className="mt-3 text-sm text-foreground-muted">{item.body}</p>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )

    case 'serviceSplit': {
      const image = block.image as Media | null
      const imageFirst = block.imagePosition !== 'end'
      return (
        <section className="container-page py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {image?.url ? (
              <Reveal
                direction={imageFirst ? 'right' : 'left'}
                className={imageFirst ? '' : 'lg:order-2'}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={image.url}
                    alt={image.alt ?? ''}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ) : null}
            <Reveal className={imageFirst ? '' : 'lg:order-1'}>
              <h2 className="font-heading text-3xl text-foreground lg:text-4xl">{block.heading}</h2>
              <RichText data={block.body} className="mt-5" />
              {block.cta?.label ? (
                <CmsLink
                  href={block.cta.href}
                  className="mt-7 inline-flex rounded-full bg-brand-solid px-7 py-3 text-sm font-medium text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover"
                >
                  {block.cta.label}
                </CmsLink>
              ) : null}
            </Reveal>
          </div>
        </section>
      )
    }

    case 'propertyList': {
      const properties: Property[] =
        block.mode === 'manual'
          ? ((block.properties ?? []).filter(
              (p): p is Property => typeof p === 'object',
            ) as Property[])
          : await getProperties({
              locale,
              productLine: block.productLine ?? undefined,
              availability: block.availability ?? undefined,
              limit: block.limit ?? 6,
            })

      if (!properties.length) return null

      return (
        <section className="container-page py-16">
          {block.heading ? <SectionHeader title={block.heading} align="start" /> : null}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property, i) => (
              <Reveal key={property.id} delay={(i % 3) * 90}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        </section>
      )
    }

    case 'faq':
      return (
        <section className="container-page py-16">
          {block.heading ? <SectionHeader title={block.heading} align="start" /> : null}
          <div className="mt-10 max-w-3xl">
            {(block.items ?? []).map((item, i) => (
              /* <details> rather than a JS accordion: keyboard- and
                 screen-reader-accessible for free, and findable by in-page
                 search in browsers that expand hidden content. */
              <details
                key={item.id ?? i}
                className="group border-b border-subtle py-5 last:border-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg text-foreground marker:content-none">
                  {item.question}
                  <span
                    aria-hidden
                    className="text-brand transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <RichText data={item.answer} className="mt-4" />
              </details>
            ))}
          </div>
        </section>
      )

    case 'cta': {
      const image = block.backgroundImage as Media | null
      return (
        <section className="relative isolate overflow-hidden py-24">
          {image?.url ? (
            <Image src={image.url} alt="" fill sizes="100vw" className="-z-10 object-cover" />
          ) : null}
          <div
            aria-hidden
            className={`absolute inset-0 -z-10 ${image?.url ? 'bg-black/65' : 'bg-[var(--burgundy-900)]'}`}
          />
          <div className="container-page text-center">
            <h2 className="mx-auto max-w-2xl font-heading text-3xl text-white lg:text-4xl">
              {block.heading}
            </h2>
            {block.body ? (
              <p className="mx-auto mt-4 max-w-xl text-white/75">{block.body}</p>
            ) : null}
            {block.cta?.label ? (
              <CmsLink
                href={block.cta.href}
                className="mt-8 inline-flex rounded-full bg-white px-7 py-3 text-sm font-medium text-[var(--burgundy-800)] transition-colors hover:bg-white/90"
              >
                {block.cta.label}
              </CmsLink>
            ) : null}
          </div>
        </section>
      )
    }

    // `testimonialsBlock` and `contactForm` land in phase 6 alongside the lead
    // pipeline — rendering an inert form now would invite real enquiries into a
    // dead end.
    default:
      return null
  }
}
