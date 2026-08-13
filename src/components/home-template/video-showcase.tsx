'use client'

import Image from 'next/image'
import { useState } from 'react'
import { extractYouTubeId } from '@/components/ui/video-modal'

/**
 * The template's room showcase (§6.9): a poster with a play button that swaps
 * itself for the embed on click.
 *
 * Kept as a facade rather than an eager iframe — a YouTube embed costs ~1 MB
 * and a chunk of main-thread time before anyone presses play, which matters on
 * the mobile connections most CPI visitors use. `youtube-nocookie` for the same
 * reason it is used everywhere else on the site.
 *
 * The embed replaces the poster in place rather than opening a modal. That
 * still satisfies the rule this site actually cares about — the visitor is
 * never sent to youtube.com and handed a wall of competitors' recommendations.
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
    <div className="tpl-showcase-media tpl-reveal-media tpl-reveal tpl-delay-12" data-reveal="fade-left">
      {loaded && videoId ? (
        <iframe
          className="absolute inset-0 z-[2] size-full border-0"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={posterAlt || playLabel}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {poster ? (
            <Image
              src={poster}
              alt={posterAlt}
              fill
              sizes="(min-width: 992px) 60vw, 100vw"
              className="tpl-showcase-image"
              data-speed="1.08"
            />
          ) : null}
          <button
            type="button"
            className="tpl-showcase-trigger"
            aria-label={playLabel}
            onClick={() => setLoaded(true)}
            disabled={!videoId}
          >
            <span className="tpl-showcase-play" aria-hidden />
          </button>
        </>
      )}
    </div>
  )
}
