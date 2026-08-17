'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export type HeroShot = { src: string; alt: string }

const INTERVAL_MS = 5000

/**
 * Hero background carousel.
 *
 * A crossfade between the slides every five seconds — no slider library for
 * what is two opacity transitions, which keeps ~40 KB off a page whose audience
 * is largely on mobile data.
 *
 * The first slide is `priority` and the rest are lazy: eager-loading five
 * full-bleed photographs would compete with the headline for bandwidth and push
 * out the largest contentful paint, which is exactly the hero itself.
 *
 * `prefers-reduced-motion` pins it to the first image. A slideshow that changes
 * under you is precisely the kind of unrequested movement that setting exists to
 * stop, and the hero still reads perfectly as a still.
 */
export function HeroCarousel({ shots }: { shots: HeroShot[] }) {
  const t = useTranslations('home.hero')
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (shots.length < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => setIndex((i) => (i + 1) % shots.length), INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [shots.length, paused])

  if (!shots.length) return null

  return (
    <>
      <div aria-hidden className="absolute inset-0 -z-20">
        {shots.map((shot, i) => (
          <Image
            key={shot.src}
            src={shot.src}
            alt=""
            fill
            priority={i === 0}
            loading={i === 0 ? undefined : 'lazy'}
            sizes="100vw"
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {shots.length > 1 ? (
        /* Deliberately at the foot of the hero, clear of the headline. Buttons
           rather than dots-as-divs: changing the backdrop is a real control, so
           it needs a label and keyboard focus. Hovering or focusing pauses the
           rotation so a visitor reading the caption is not interrupted. */
        <div
          className="absolute inset-x-0 bottom-6 z-10 mx-auto flex max-w-[1400px] items-center gap-2 px-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {shots.map((shot, i) => (
            <button
              key={shot.src}
              type="button"
              aria-label={t('slide', { n: i + 1 })}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-[3px] w-9 transition-colors ${
                i === index ? 'bg-[var(--accent-on-dark)]' : 'bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}
