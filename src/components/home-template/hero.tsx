'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

export type HeroSlide = {
  src: string
  alt: string
  title: string
}

const AUTOPLAY_MS = 5000
/** The template's Swiper runs `speed: 3000` with a crossfade. */
const TITLE_SWAP_MS = 240

/**
 * Hero slider — the template's Swiper, rebuilt.
 *
 * Swiper is used for exactly one effect here (`effect: 'fade'`, crossFade,
 * autoplay, prev/next), which is a two-line CSS opacity transition. Pulling in
 * the library for it would ship ~40 KB to every visitor on a site whose
 * audience is largely on mobile data — so the behaviour is reproduced instead
 * of the dependency.
 *
 * The slide title's exit/enter wipe is the template's `updateHeroMeta`
 * choreography, timings included.
 */
export function TemplateHero({
  slides,
  children,
}: {
  slides: HeroSlide[]
  children?: React.ReactNode
}) {
  const [index, setIndex] = useState(0)
  const [title, setTitle] = useState(slides[0]?.title ?? '')
  const [titleState, setTitleState] = useState<'visible' | 'exiting' | 'entering'>('visible')
  const progressRef = useRef<HTMLDivElement>(null)
  const swapTimer = useRef<number | undefined>(undefined)
  const total = slides.length

  const go = useCallback(
    (next: number) => {
      if (total === 0) return
      setIndex(((next % total) + total) % total)
    },
    [total],
  )

  // Autoplay. Restarts whenever the index changes, so a manual prev/next
  // resets the dwell time rather than cutting the new slide short.
  useEffect(() => {
    if (total <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setTimeout(() => go(index + 1), AUTOPLAY_MS)
    return () => window.clearTimeout(id)
  }, [index, total, go])

  // Progress bar: reset to zero without a transition, then fill across the
  // dwell. Mirrors Swiper's `autoplayTimeLeft` callback.
  useEffect(() => {
    const el = progressRef.current
    if (!el) return

    el.style.transition = 'none'
    el.style.width = '0%'

    const raf = requestAnimationFrame(() => {
      el.style.transition = `width ${AUTOPLAY_MS}ms linear`
      el.style.width = '100%'
    })
    return () => cancelAnimationFrame(raf)
  }, [index])

  // Title wipe-out, swap, wipe-in.
  useEffect(() => {
    const next = slides[index]?.title ?? ''
    if (next === title) return

    setTitleState('exiting')
    window.clearTimeout(swapTimer.current)
    swapTimer.current = window.setTimeout(() => {
      setTitle(next)
      setTitleState('entering')
      requestAnimationFrame(() => requestAnimationFrame(() => setTitleState('visible')))
    }, TITLE_SWAP_MS)

    return () => window.clearTimeout(swapTimer.current)
    // `title` is intentionally excluded: it is the value being written here,
    // and including it would re-run the effect on its own update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slides])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="tpl-hero-wrapper">
      <section id="s1" className="tpl-hero">
        <div className="tpl-hero-mask">
          <div className="tpl-hero-media-wrapper">
            {slides.map((slide, i) => (
              <div
                key={slide.src + i}
                className={`tpl-hero-slide${i === index ? ' is-active' : ''}`}
                aria-hidden={i !== index}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="tpl-hero-img"
                />
              </div>
            ))}
            <div className="tpl-hero-overlay" />
          </div>

          {children}

          {total > 1 ? (
            <div className="tpl-hero-bottom-controls">
              <div className="tpl-hero-slider-nav">
                <div
                  className={`tpl-hero-slide-title is-${titleState}`}
                  aria-live="polite"
                >
                  <span className="tpl-hero-slide-title-text">{title}</span>
                </div>
                <div className="tpl-hero-nav-controls">
                  <button
                    type="button"
                    className="tpl-hero-nav-btn"
                    onClick={() => go(index - 1)}
                  >
                    PREV
                  </button>
                  <div className="tpl-hero-nav-indicator">
                    <span>{pad(index + 1)}</span> / <span>{pad(total)}</span>
                    <div className="tpl-hero-nav-line">
                      <div ref={progressRef} className="tpl-hero-nav-progress" />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="tpl-hero-nav-btn"
                    onClick={() => go(index + 1)}
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
