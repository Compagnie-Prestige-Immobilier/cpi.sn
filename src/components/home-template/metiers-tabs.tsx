'use client'

import Image from 'next/image'
import { useId, useState } from 'react'

export type MetierTab = {
  label: string
  title: string
  body: string
  image?: { src: string; alt: string } | null
}

/**
 * The template's jQuery tab strip (§6.6), rebuilt as a real tablist.
 *
 * The original toggles an `.active` class on `<li>` elements, which gives a
 * keyboard or screen-reader user nothing to work with. Same visual behaviour
 * here, on `button` + `role="tab"` with arrow-key navigation — a change the
 * designer will not see and an assistive-technology user will.
 */
export function MetiersTabs({ tabs }: { tabs: MetierTab[] }) {
  const [active, setActive] = useState(0)
  const baseId = useId()

  if (!tabs.length) return null

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const dir = e.key === 'ArrowRight' ? 1 : -1
    const next = (active + dir + tabs.length) % tabs.length
    setActive(next)
    document.getElementById(`${baseId}-tab-${next}`)?.focus()
  }

  return (
    <>
      <ul className="tpl-fac-tabs-nav" role="tablist" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <li key={tab.label} role="presentation">
            <button
              type="button"
              id={`${baseId}-tab-${i}`}
              role="tab"
              aria-selected={i === active}
              aria-controls={`${baseId}-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              className="tpl-fac-tabs-item"
              onClick={() => setActive(i)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {tabs.map((tab, i) =>
        i === active ? (
          <div
            key={tab.label}
            id={`${baseId}-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${i}`}
            className="tpl-fac-tab-pane"
          >
            <h3>{tab.title}</h3>
            <p>{tab.body}</p>
            {tab.image ? (
              <Image
                src={tab.image.src}
                alt={tab.image.alt}
                width={900}
                height={560}
                sizes="(min-width: 992px) 50vw, 100vw"
                className="mt-3 h-auto w-full object-cover"
              />
            ) : null}
          </div>
        ) : null,
      )}
    </>
  )
}
