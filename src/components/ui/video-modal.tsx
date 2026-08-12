'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

/**
 * Click-to-load YouTube facade.
 *
 * Two rules from CLAUDE.md, both deliberate:
 *
 *   1. The video opens in a modal — never a redirect to YouTube. Sending a
 *      visitor to youtube.com hands them a sidebar of competitors.
 *   2. The iframe is created on click, not on page load. An eager YouTube embed
 *      costs ~1 MB and several hundred ms of main-thread time before it is ever
 *      played — real money on the mobile connections most CPI visitors use.
 *      `youtube-nocookie.com` keeps it out of ad-tracking territory too.
 */
export function VideoModal({
  url,
  poster,
  posterAlt,
  label,
}: {
  url: string
  poster?: string
  posterAlt?: string
  label?: string
}) {
  const t = useTranslations('video')
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const videoId = extractYouTubeId(url)

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)

    // Lock scroll behind the modal, then hand focus to the close button so
    // keyboard users are not left behind the overlay.
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open])

  if (!videoId) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label ?? t('play')}
        className="group relative block w-full overflow-hidden rounded-lg"
      >
        {poster ? (
          <Image
            src={poster}
            alt={posterAlt ?? ''}
            width={1280}
            height={720}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <span className="block aspect-video w-full bg-surface-sunken" />
        )}

        <span className="absolute inset-0 grid place-items-center bg-black/25 transition-colors group-hover:bg-black/35">
          <span className="grid size-20 place-items-center rounded-full bg-brand-solid text-brand-solid-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" fill="currentColor" className="ms-1 size-7" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </button>

      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={label ?? t('label')}
          onClick={(e) => {
            if (e.target === dialogRef.current) setOpen(false)
          }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t('close')}
            className="absolute end-5 top-5 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-lg bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={label ?? t('label')}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
        </div>
      ) : null}
    </>
  )
}

/** Handles youtu.be/ID, /watch?v=ID, /embed/ID and /shorts/ID. */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return /^[\w-]{11}$/.test(url) ? url : null
}
