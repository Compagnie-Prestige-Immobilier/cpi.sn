'use client'

import { useId, useState } from 'react'

export type MetierTab = { label: string; body: string }

/**
 * The disciplines tab strip.
 *
 * A real tablist rather than styled divs: arrow keys move between tabs and the
 * relationship is announced. The design draws these as a plain stack of labels
 * with the active one in gold, so the affordance is subtle — which makes the
 * keyboard and screen-reader semantics matter more, not less.
 */
export function MetiersTabs({ tabs }: { tabs: MetierTab[] }) {
  const [active, setActive] = useState(0)
  const baseId = useId()

  if (!tabs.length) return null

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (active + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    setActive(next)
    document.getElementById(`${baseId}-tab-${next}`)?.focus()
  }

  return (
    <div>
      <div role="tablist" onKeyDown={onKeyDown} className="flex flex-col border-t border-subtle">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            id={`${baseId}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={`border-b border-subtle py-4 text-start font-heading text-2xl font-semibold uppercase transition-colors ${
              i === active ? 'text-brand' : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`${baseId}-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="mt-6 text-[15px] leading-relaxed text-foreground-muted"
      >
        {tabs[active].body}
      </div>
    </div>
  )
}
