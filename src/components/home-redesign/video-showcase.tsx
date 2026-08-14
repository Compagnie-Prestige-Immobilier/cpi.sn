'use client'

import Image from 'next/image'
import { useState } from 'react'
import { extractYouTubeId } from '@/components/ui/video-modal'

/**
 * Click-to-load YouTube facade.
 *
 * The embed replaces the poster in place rather than opening a modal, and the
 * visitor is never sent to youtube.com — which is the rule that matters, since
 * landing there hands them a sidebar of competitors. The iframe is created on
 * click: an eager embed costs ~1 MB before anyone presses play, which is real
 * money on the mobile connections most CPI visitors use.
 */
export function VideoShowcase({
  url,
  poster,
  posterAlt,
  playLabel,
}: {
  url: string
  poster: string | null
  posterAlt: string
  playLabel: string
}) {
  const [loaded, setLoaded] = useState(false)
  const videoId = extractYouTubeId(url)

  return (
    <div className="relative aspect-video overflow-hidden bg-surface-sunken">
      {loaded && videoId ? (
        <iframe
          className="absolute inset-0 size-full border-0"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={posterAlt || playLabel}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {poster ? (
            <Image src={poster} alt={posterAlt} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
          ) : null}
          <button
            type="button"
            aria-label={playLabel}
            onClick={() => setLoaded(true)}
            disabled={!videoId}
            className="group absolute inset-0 grid place-items-center bg-[rgb(13_23_18/0.25)] transition-colors hover:bg-[rgb(13_23_18/0.35)]"
          >
            <span className="grid size-20 place-items-center bg-brand-solid text-brand-solid-foreground transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="currentColor" className="ms-1 size-7" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        </>
      )}
    </div>
  )
}
