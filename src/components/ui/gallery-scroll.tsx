import Image from 'next/image'
import { Reveal } from './reveal'
import type { Media } from '@/payload-types'

/**
 * Ombara's `gallery-scroll`: a sticky intro column beside a horizontally
 * scrolling track of images.
 *
 * The template drove the track with jQuery and a fixed pixel width. Here it is
 * native scroll with snap points — no JS, works with a trackpad, a touch drag
 * and keyboard arrows alike, and degrades to a plain scroller if snap is
 * unsupported. `scrollbar-width: none` hides the bar without removing the
 * ability to scroll.
 */
export function GalleryScroll({
  eyebrow,
  title,
  body,
  images,
}: {
  eyebrow?: string
  title: string
  body?: string
  images: Media[]
}) {
  if (!images.length) return null

  return (
    <section className="overflow-hidden py-20 lg:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
        <Reveal direction="right" className="lg:sticky lg:top-32 lg:self-start">
          {eyebrow ? (
            <span className="text-xs font-medium tracking-[0.22em] text-accent uppercase">
              {eyebrow}
            </span>
          ) : null}
          <h2 className="mt-4 font-heading text-4xl leading-[1.1] text-foreground">{title}</h2>
          {body ? <p className="mt-5 text-foreground-muted">{body}</p> : null}
        </Reveal>

        <div
          className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
          // A horizontal scroller is a focusable region for keyboard users.
          tabIndex={0}
          role="region"
          aria-label={title}
        >
          {images.map((image, i) => (
            <Reveal
              key={image.id}
              delay={(i % 3) * 90}
              className="w-[78vw] shrink-0 snap-start sm:w-[22rem]"
            >
              <figure className="overflow-hidden rounded-lg border border-subtle bg-surface-raised">
                <div className="relative aspect-[3/4] overflow-hidden">
                  {image.url ? (
                    <Image
                      src={image.url}
                      alt={image.alt ?? ''}
                      fill
                      sizes="(min-width: 640px) 22rem, 78vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : null}
                </div>
                {image.caption ? (
                  <figcaption className="px-5 py-4 text-sm text-foreground-muted">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
