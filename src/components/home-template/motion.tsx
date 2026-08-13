'use client'

import { useEffect } from 'react'

/**
 * The template's scroll behaviour, ported off jQuery.
 *
 * `main.js` runs four things globally; all four are reproduced here and scoped
 * to the page that mounts this component:
 *
 *   1. Lenis smooth scroll (§1)
 *   2. the `.reveal` IntersectionObserver (§7.1)
 *   3. the hero mask's scroll-driven clip-path (§7.2)
 *   4. `[data-speed]` parallax on media (§7.3)
 *
 * Everything bails out under `prefers-reduced-motion`. That is not just
 * politeness: the reveal classes start at `opacity: 0`, so a visitor who has
 * asked for less motion and never gets the observer callback would be left
 * looking at an empty page. The stylesheet neutralises the pre-reveal state for
 * those users, and this component skips straight to the finished state.
 */
export function TemplateMotion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealTargets = document.querySelectorAll<HTMLElement>(
      '.tpl-reveal, .tpl-reveal-media',
    )

    if (reduced) {
      revealTargets.forEach((el) => el.classList.add('is-visible'))
      return
    }

    let disposed = false
    let rafId = 0
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null

    // --- 2. Reveal ---------------------------------------------------------
    // Fires once per element, exactly like the template: `observer.unobserve`
    // on intersect, so nothing re-animates when scrolling back up.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' },
    )
    revealTargets.forEach((el) => observer.observe(el))

    // Anything already on screen at mount reveals immediately — otherwise the
    // hero and the first section sit invisible until the visitor scrolls.
    const revealVisible = () => {
      revealTargets.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top <= window.innerHeight * 0.95 && rect.bottom >= window.innerHeight * 0.05) {
          el.classList.add('is-visible')
        }
      })
    }

    // --- 3 & 4. Scroll-driven effects -------------------------------------
    const heroMask = document.querySelector<HTMLElement>('.tpl-hero-mask')
    const parallaxEls = document.querySelectorAll<HTMLElement>('[data-speed]')

    const handleScrollEffects = (scrollY = window.scrollY) => {
      if (heroMask) {
        const distance = window.innerHeight * 0.9
        if (scrollY <= 0) {
          heroMask.style.clipPath = 'inset(0% 0% 0% 0%)'
        } else if (scrollY < distance) {
          const eased = Math.pow(scrollY / distance, 0.9)
          heroMask.style.clipPath = `inset(${20 * eased}% ${3 * eased}% ${20 * eased}% ${3 * eased}%)`
        } else {
          heroMask.style.clipPath = 'inset(20% 3% 20% 3%)'
        }
      }

      parallaxEls.forEach((el) => {
        const speed = Number.parseFloat(el.dataset.speed ?? '1')
        const rect = el.getBoundingClientRect()
        const distanceFromCenter = rect.top + rect.height / 2 - window.innerHeight / 2
        const maxOffset = Math.max(28, rect.height * 0.08)
        const yPos = Math.max(
          -maxOffset,
          Math.min(maxOffset, -distanceFromCenter * (speed - 1) * 0.45),
        )
        el.style.setProperty('--parallax-offset', `${yPos}px`)
        el.style.setProperty('--parallax-scale', Math.max(1.12, 1 + (speed - 1) * 2.4).toFixed(3))
      })
    }

    const onScroll = () => {
      handleScrollEffects()
      revealVisible()
    }

    handleScrollEffects()
    requestAnimationFrame(revealVisible)
    const settleTimer = window.setTimeout(revealVisible, 160)

    // --- 1. Lenis ----------------------------------------------------------
    // Imported dynamically so it stays out of the bundle for anyone who never
    // reaches this page, and never runs during SSR.
    void import('lenis').then(({ default: Lenis }) => {
      if (disposed) return

      const instance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 2,
      })
      lenis = instance

      instance.on('scroll', ({ scroll }: { scroll: number }) => {
        handleScrollEffects(scroll)
        revealVisible()
      })

      const raf = (time: number) => {
        instance.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      disposed = true
      observer.disconnect()
      window.clearTimeout(settleTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
      lenis?.destroy()
    }
  }, [])

  return null
}
