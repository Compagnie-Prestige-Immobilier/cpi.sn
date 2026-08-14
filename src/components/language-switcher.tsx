'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { locales } from '@/i18n/locales'
import { usePathname, useRouter } from '@/i18n/routing'
import { FlagIcon } from '@/components/ui/flag-icon'

/**
 * Locale dropdown.
 *
 * Options come straight from the registry — adding Wolof means adding a
 * registry entry, not touching this component.
 *
 * Switching preserves the current route: next-intl's `usePathname` returns the
 * *internal* pathname, so the router can re-resolve it to the target locale's
 * translated segment (/a-propos ↔ /en/about).
 *
 * Built on a native listbox pattern rather than a `<select>` because a select
 * cannot render the flag artwork, and rather than a bare div because this is a
 * navigation control a keyboard user has to be able to reach and operate.
 */
export function LanguageSwitcher() {
  const t = useTranslations('language')
  const active = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const current = locales.find((l) => l.code === active) ?? locales[0]

  // Close on outside click and on Escape. Escape also returns focus to the
  // trigger, so keyboard users are not stranded at the top of the document.
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (locales.length < 2) return null

  function choose(code: string) {
    setOpen(false)
    if (code === active) return
    startTransition(() => {
      router.replace(
        // @ts-expect-error — params are validated by the route itself
        { pathname, params },
        { locale: code },
      )
    })
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('switch')}
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-subtle px-3 py-1.5 text-xs tracking-wide text-foreground-muted uppercase transition-colors hover:border-brand-border hover:text-brand disabled:opacity-50"
      >
        <FlagIcon region={current.flag} code={current.code} />
        <span>{current.code}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={t('switch')}
          className="absolute end-0 z-50 mt-2 min-w-44 overflow-hidden rounded-lg border border-subtle bg-surface-raised py-1 shadow-lg"
        >
          {locales.map(({ code, label, flag }) => {
            const isActive = code === active
            return (
              <li key={code} role="none">
                <button
                  type="button"
                  role="option"
                  lang={code}
                  aria-selected={isActive}
                  onClick={() => choose(code)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-muted font-medium text-brand'
                      : 'text-foreground hover:bg-surface-sunken'
                  }`}
                >
                  <FlagIcon region={flag} code={code} />
                  <span className="flex-1">{label}</span>
                  {isActive ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className="size-3.5"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
