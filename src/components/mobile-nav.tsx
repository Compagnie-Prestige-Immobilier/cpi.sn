'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/routing'
import { CmsLink } from '@/components/ui/cms-link'

type Item = {
  label: string
  href: string | null
  children: { label: string; href: string | null }[]
}

/**
 * Mobile menu.
 *
 * Ombara used Bootstrap's collapse plugin; this is the React equivalent with
 * the accessibility gaps closed — Escape closes, body scroll locks, and the
 * panel dismisses on navigation (Bootstrap's did not, so tapping a link left
 * the overlay covering the page you just opened).
 */
export function MobileNav({ items }: { items: Item[] }) {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('closeMenu') : t('openMenu')}
        aria-expanded={open}
        className="inline-flex size-10 items-center justify-center rounded-full border border-subtle text-foreground-muted transition-colors hover:border-brand-border hover:text-brand lg:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5" aria-hidden>
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-x-0 top-20 bottom-0 z-30 overflow-y-auto border-t border-subtle bg-surface lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-6" aria-label={t('openMenu')}>
            {items.map((item) => (
              <div key={item.label} className="border-b border-subtle py-2 last:border-0">
                <CmsLink
                  href={item.href}
                  className="block py-2 text-sm font-medium tracking-[0.08em] text-foreground uppercase"
                >
                  {item.label}
                </CmsLink>
                {item.children.length ? (
                  <div className="flex flex-col gap-1 ps-4 pb-2">
                    {item.children.map((child) => (
                      <CmsLink
                        key={child.label}
                        href={child.href}
                        className="py-1.5 text-sm text-foreground-muted"
                      >
                        {child.label}
                      </CmsLink>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  )
}
