'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useTransition } from 'react'
import { locales } from '@/i18n/locales'
import { usePathname, useRouter } from '@/i18n/routing'

/**
 * Renders one entry per locale straight from the registry — adding Wolof means
 * adding a registry entry, not touching this component.
 *
 * Switching preserves the current route: next-intl's `usePathname` returns the
 * *internal* pathname, so the router can re-resolve it to the target locale's
 * translated segment (/a-propos ↔ /en/about).
 */
export function LanguageSwitcher() {
  const t = useTranslations('language')
  const active = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [isPending, startTransition] = useTransition()

  if (locales.length < 2) return null

  return (
    <nav aria-label={t('switch')} className="flex items-center gap-1">
      {locales.map(({ code, label }) => {
        const isActive = code === active

        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-current={isActive ? 'true' : undefined}
            disabled={isActive || isPending}
            onClick={() =>
              startTransition(() => {
                router.replace(
                  // @ts-expect-error — params are validated by the route itself
                  { pathname, params },
                  { locale: code },
                )
              })
            }
            className={
              isActive
                ? 'rounded-full px-2.5 py-1 text-xs font-medium tracking-wide text-brand uppercase'
                : 'rounded-full px-2.5 py-1 text-xs tracking-wide text-foreground-muted uppercase transition-colors hover:text-foreground disabled:opacity-50'
            }
          >
            {label}
          </button>
        )
      })}
    </nav>
  )
}
