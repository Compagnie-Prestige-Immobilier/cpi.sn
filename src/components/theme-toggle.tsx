'use client'

import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

const ORDER = ['light', 'dark', 'system'] as const
type ThemeName = (typeof ORDER)[number]

export function ThemeToggle() {
  const t = useTranslations('theme')
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // The server cannot know the visitor's theme, so the first client render must
  // match the server's markup exactly. Rendering a stable placeholder until
  // mount is what prevents a hydration mismatch here.
  useEffect(() => setMounted(true), [])

  const current: ThemeName = (theme as ThemeName) ?? 'system'

  function cycle() {
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={t('toggle')}
      title={mounted ? t(current) : t('toggle')}
      className="inline-flex size-10 items-center justify-center rounded-full border border-subtle text-foreground-muted transition-colors hover:border-brand-border hover:text-brand"
    >
      {mounted ? (
        <Icon theme={current} resolved={resolvedTheme} />
      ) : (
        <span className="size-5" aria-hidden />
      )}
    </button>
  )
}

function Icon({ theme, resolved }: { theme: ThemeName; resolved?: string }) {
  const shape = theme === 'system' ? 'system' : theme

  if (shape === 'system') {
    return (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
        data-resolved={resolved}
      >
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8m-4-4v4" strokeLinecap="round" />
      </svg>
    )
  }

  if (shape === 'dark') {
    return (
      <svg
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path
          d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
