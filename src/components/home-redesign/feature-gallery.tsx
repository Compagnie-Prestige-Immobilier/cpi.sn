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
 * Full-bleed scroll-driven gallery.
 *
 * The section is several viewports tall with a sticky child; scroll position
 * through that height picks the active slide. Slides change at the midpoint
 * between steps rather than at the boundary, so the transition lands while the
 * visitor is still moving.
 */
export function FeatureGallery({
  slides,
  labels,
}: {
  slides: FeatureSlide[]
  labels: { prev: string; next: string; skip: string }
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const [index, setIndex] = useState(0)
  const total = slides.length

  useEffect(() => {
    const section = sectionRef.current
    if (!section || total === 0) return

    const update = () => {
      const rect = section.getBoundingClientRect()
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1)
      const progress = Math.min(Math.max(-rect.top, 0), distance) / distance
      setIndex(Math.min(total - 1, Math.round(progress * Math.max(total - 1, 1))))
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

  const scrollToIndex = (target: number) => {
    const section = sectionRef.current
    if (!section) return
    const maxIndex = Math.max(total - 1, 1)
    const safe = Math.max(0, Math.min(target, maxIndex))
    const distance = Math.max(section.offsetHeight - window.innerHeight, 1)
    const top = window.scrollY + section.getBoundingClientRect().top
    window.scrollTo({ top: top + (safe / maxIndex) * distance, behavior: 'smooth' })
  }

  if (!total) return null
  const active = slides[index]
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <section
      id="s7"
      ref={sectionRef}
      className="relative mt-[110px] min-h-[500vh] border-y border-subtle"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {slides.map((slide, i) => (
          <figure
            key={slide.src}
            aria-hidden={i !== index}
            className={`absolute inset-0 m-0 transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image src={slide.src} alt={slide.alt} fill sizes="100vw" className="object-cover" />
          </figure>
        ))}
        {/* Pinned dark in both themes: the overlay type here is always white. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgb(8_17_28/0.55)_0%,rgb(8_17_28/0.2)_45%,rgb(8_17_28/0.6)_100%)]"
        />

        <div className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6">
          <p className="text-[11px] tracking-[0.28em] text-[var(--accent-on-dark)] uppercase">
            {active.eyebrow}
          </p>
          <h2 className="mt-4 max-w-3xl font-heading text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-bold text-white uppercase">
            {active.title}
          </h2>
          {active.text ? (
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/80">{active.text}</p>
          ) : null}
          <p className="mt-8 text-[11px] tracking-[0.2em] text-white/60">
            {pad(index + 1)} — {pad(total)}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-6 mx-auto flex max-w-[560px] items-center gap-4 px-6">
          <button
            type="button"
            onClick={() => scrollToIndex(index - 1)}
            className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase transition-colors hover:text-white"
          >
            {labels.prev}
          </button>
          <span aria-hidden className="relative h-px flex-1 bg-white/25">
            <span
              ref={fillRef}
              className="absolute inset-0 origin-left scale-x-0 bg-[var(--accent-on-dark)]"
            />
          </span>
          <button
            type="button"
            onClick={() => scrollToIndex(index + 1)}
            className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase transition-colors hover:text-white"
          >
            {labels.next}
          </button>
        </div>
      </div>
    </section>
  )
}
