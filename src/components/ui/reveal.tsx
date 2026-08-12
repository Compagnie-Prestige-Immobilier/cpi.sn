'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Direction = 'up' | 'left' | 'right' | 'none'

const HIDDEN: Record<Direction, string> = {
  up: 'translate-y-8',
  left: '-translate-x-8',
  right: 'translate-x-8',
  none: '',
}

/**
 * Scroll-reveal, replacing Ombara's jQuery `data-reveal` behaviour.
 *
 * Two things the template got wrong and we don't:
 *   - It animated on every scroll pass; this fires once and disconnects.
 *   - It ignored `prefers-reduced-motion`. Here the content renders visible
 *     immediately for those users — never hidden behind an animation they
 *     asked not to see.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: {
  children: ReactNode
  direction?: Direction
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
        shown ? 'translate-x-0 translate-y-0 opacity-100' : `opacity-0 ${HIDDEN[direction]}`
      } ${className}`}
    >
      {children}
    </div>
  )
}
