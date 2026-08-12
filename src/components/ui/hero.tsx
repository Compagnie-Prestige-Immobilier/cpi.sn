import Image from 'next/image'
import type { ReactNode } from 'react'
import { VideoModal } from './video-modal'

/**
 * Full-bleed hero, from Ombara's `#home` section.
 *
 * Deviations from the template, both deliberate:
 *
 *   - Ombara autoplays a muted background video. CPI's audience is largely on
 *     Senegalese mobile data, where a silent looping video is an expensive
 *     decoration — so the poster image is the background and the video plays
 *     only on request, in a modal (CLAUDE.md → Media).
 *   - The hero's own inline nav is dropped. It duplicated the site header and
 *     gave a second, competing set of links on the most important screen.
 *
 * The overlay is what makes white text legible over arbitrary photography;
 * without it a bright sky drops contrast below AA.
 */
export function Hero({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt,
  videoUrl,
  actions,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  image?: string | null
  imageAlt?: string
  videoUrl?: string | null
  actions?: ReactNode
}) {
  return (
    /* Without an image the ground is deliberately brand burgundy, identical in
       both themes: this is image-replacement, not a themed surface, and
       `bg-surface-inverse` would flip light/dark and read as an accident. */
    <section
      className={`relative isolate flex min-h-[78vh] items-end overflow-hidden lg:min-h-[86vh] ${
        image ? 'bg-stone-950' : 'bg-[var(--burgundy-900)]'
      }`}
    >
      {image ? (
        <Image
          src={image}
          alt={imageAlt ?? ''}
          fill
          priority
          sizes="100vw"
          data-no-dim
          className="-z-10 object-cover"
        />
      ) : null}

      {/* Over a photo: two stops, so the image stays readable up top while the
          text at the bottom keeps its contrast. Over the plain brand ground a
          heavy scrim would just mud the colour, so it is much lighter. */}
      <div
        aria-hidden
        className={
          image
            ? 'absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/45 to-black/20'
            : 'absolute inset-0 -z-10 bg-gradient-to-t from-black/35 to-transparent'
        }
      />

      <div className="container-page pb-16 lg:pb-24">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-medium tracking-[0.24em] text-accent-on-dark uppercase">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="mt-5 font-heading text-4xl leading-[1.05] text-white sm:text-5xl lg:text-7xl">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-5 max-w-xl text-base text-white/80 lg:text-lg">{subtitle}</p>
          ) : null}

          {actions ? <div className="mt-9 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>

      {videoUrl ? (
        <div className="absolute end-6 bottom-16 z-10 hidden w-64 lg:block">
          <VideoModal url={videoUrl} poster={image ?? undefined} posterAlt={imageAlt} />
        </div>
      ) : null}
    </section>
  )
}
