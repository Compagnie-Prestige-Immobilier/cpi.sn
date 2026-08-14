'use client'

import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

/**
 * Day/night theme switch.
 *
 * Two states, not three. Cycling light → dark → system is why reaching dark
 * once took two clicks: the stored value started at `system`, so the first
 * click only moved to `light`, which usually looked identical to what was
 * already on screen. `ThemeProvider` pins the default to `light`, making this a
 * straight boolean.
 *
 * NOTE — this replaced the sky/cloud switch to match the redesign, which draws
 * a plain bordered icon button. `sky-toggle.tsx` and `sky-toggle.css` are still
 * in the repository; swapping back is a one-line import change.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean } = {}) {
  const t = useTranslations('theme')
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // The server cannot know the visitor's theme, so the first client render must
  // match the server's markup. Until mount the icon renders in its light state,
  // which is also the default — for most visits nothing changes.
  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={t('toggle')}
      title={mounted ? t(isDark ? 'dark' : 'light') : undefined}
      className={
        compact
          ? 'grid size-[26px] place-items-center border border-subtle text-foreground-muted transition-colors hover:border-brand-border hover:text-brand'
          : 'grid size-[38px] place-items-center border border-strong/45 text-foreground transition-colors hover:border-brand-border hover:text-brand'
      }
    >
      {isDark ? (
        <svg
          width={compact ? 15 : 17}
          height={compact ? 15 : 17}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.4v2.2m0 14.8v2.2M4.4 12H2.2m19.6 0h-2.2M5.6 5.6 4 4m16 16-1.6-1.6M18.4 5.6 20 4M4 20l1.6-1.6" />
        </svg>
      ) : (
        <svg
          width={compact ? 15 : 17}
          height={compact ? 15 : 17}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
        </svg>
      )}
    </button>
  )
}
