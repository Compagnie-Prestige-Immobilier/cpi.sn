'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export type FeatureSlide = {
  src: string
  alt: string
  eyebrow: string
  title: string
  text: string
}

/**
 * Scroll-driven sticky gallery (template §5 / §13).
 *
 * The section is 500vh tall with a 100svh sticky child; how far the visitor has
 * scrolled through that height picks the active slide. Reproduced from
 * `updateFeatureGalleryScrollState`, including the rounding — slides change at
 * the midpoint between steps, not at the boundary.
 */
export function FeatureGallery({
  slides,
  labels,
  children,
  cardMarker,
}: {
  slides: FeatureSlide[]
  labels: { prev: string; next: string; skip: string }
  children?: React.ReactNode
  /** Rendered inside the card, which owns id `s7-a`. */
  cardMarker?: React.ReactNode
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const [index, setIndex] = useState(0)
  const [revealing, setRevealing] = useState(false)
  const total = slides.length

  useEffect(() => {
    const section = sectionRef.current
    if (!section || total === 0) return

    const update = () => {
      const rect = section.getBoundingClientRect()
      const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1)
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollDistance)
      const progress = scrolled / scrollDistance
      const maxIndex = Math.max(total - 1, 1)

      setIndex(Math.min(total - 1, Math.round(progress * maxIndex)))
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${progress})`
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [total])

  // Re-run the card's staggered content animation on every slide change.
  useEffect(() => {
    setRevealing(true)
    const id = window.setTimeout(() => setRevealing(false), 950)
    return () => window.clearTimeout(id)
  }, [index])

  const scrollToIndex = (target: number) => {
    const section = sectionRef.current
    if (!section) return
    const maxIndex = Math.max(total - 1, 1)
    const safe = Math.max(0, Math.min(target, maxIndex))
    const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1)
    const absoluteTop = window.scrollY + section.getBoundingClientRect().top
    window.scrollTo({ top: absoluteTop + (safe / maxIndex) * scrollDistance, behavior: 'smooth' })
  }

  const skip = () => {
    const section = sectionRef.current
    if (!section) return
    window.scrollTo({
      top: window.scrollY + section.getBoundingClientRect().bottom,
      behavior: 'smooth',
    })
  }

  if (!total) return null

  const active = slides[index]
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <section id="s7" ref={sectionRef} className="tpl-feature-gallery">
      {children}
      <div className="tpl-fg-sticky">
        <div className="tpl-fg-slides">
          {slides.map((slide, i) => (
            <figure
              key={slide.src + i}
              className={`tpl-fg-slide${i === index ? ' is-active' : ''}`}
              aria-hidden={i !== index}
            >
              <Image src={slide.src} alt={slide.alt} fill sizes="100vw" />
            </figure>
          ))}
        </div>

        <div className="tpl-fg-overlay">
          <div className="tpl-fg-meta">
            <p className="tpl-fg-count">
              <span>{pad(index + 1)}</span> <span aria-hidden>—</span> <span>{pad(total)}</span>
            </p>
          </div>

          <div
            id="s7-a"
            className={`tpl-fg-card tpl-reveal${revealing ? ' is-content-revealing' : ''}`}
            data-reveal="fade-up"
          >
            {cardMarker}
            <span className="tpl-fg-card-kicker">{active.eyebrow}</span>
            <h2 className="tpl-fg-title">{active.title}</h2>
            <div className="tpl-fg-card-media">
              {/* Without `sizes` next/image requests the 1920px variant for a
                  336px box — the card sat blank while it downloaded. */}
              <Image
                src={active.src}
                alt={active.alt}
                width={780}
                height={527}
                sizes="(min-width: 992px) 392px, 90vw"
              />
            </div>
            <p className="tpl-fg-card-text">{active.text}</p>
          </div>

          <div className="tpl-fg-meta">
            <button type="button" className="tpl-fg-skip" onClick={skip}>
              {labels.skip}
              <span aria-hidden>›</span>
            </button>
          </div>
        </div>

        <div className="tpl-fg-progress">
          <button
            type="button"
            className="tpl-fg-nav-button"
            onClick={() => scrollToIndex(index - 1)}
          >
            {labels.prev}
          </button>
          <div className="tpl-fg-progress-track" aria-hidden>
            <span className="tpl-fg-progress-line" />
            <span ref={fillRef} className="tpl-fg-progress-fill" />
          </div>
          <button
            type="button"
            className="tpl-fg-nav-button"
            onClick={() => scrollToIndex(index + 1)}
          >
            {labels.next}
          </button>
        </div>
      </div>
    </section>
  )
}
