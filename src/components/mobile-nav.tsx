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
export function MobileNav({ items, shopHref }: { items: Item[]; shopHref?: string }) {
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
        className="inline-flex size-[38px] items-center justify-center border border-strong/45 text-foreground transition-colors hover:border-brand-border hover:text-brand lg:hidden"
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
        <div className="absolute inset-x-0 top-full z-30 max-h-[calc(100dvh-100%)] overflow-y-auto border-t border-subtle bg-surface lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-6" aria-label={t('openMenu')}>
            {/* Accordions, as the export does on small screens: a section with
                children collapses instead of dumping every link on screen at
                once. `<details>` rather than JS state — keyboard- and
                screen-reader-accessible for free, and findable by in-page
                search in browsers that expand hidden content. */}
            {items.map((item) =>
              item.children.length ? (
                <details key={item.label} className="group border-b border-subtle py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-medium tracking-[0.08em] text-foreground uppercase marker:content-none">
                    {item.label}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden
                      className="size-4 text-foreground-muted transition-transform group-open:rotate-180"
                    >
                      <path d="m6 9.5 6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="flex flex-col gap-1 pb-3 ps-4">
                    {item.href ? (
                      <CmsLink href={item.href} className="py-1.5 text-sm text-brand">
                        {item.label}
                      </CmsLink>
                    ) : null}
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
                </details>
              ) : (
                <div key={item.label} className="border-b border-subtle">
                  <CmsLink
                    href={item.href}
                    className="block py-4 text-sm font-medium tracking-[0.08em] text-foreground uppercase"
                  >
                    {item.label}
                  </CmsLink>
                </div>
              ),
            )}

            {shopHref ? (
              <a
                href={shopHref}
                className="flex items-center gap-2 border-b border-subtle py-4 text-sm tracking-[0.04em] text-brand"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 7h16l-1.4 12.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 7Z" />
                  <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
                </svg>
                {t('shop')}
              </a>
            ) : null}

            {/* The header button it mirrors is hidden below `sm`, so without
                this the portal is unreachable on a phone — which is most of
                CPI's traffic. A plain anchor: it leaves the site, so it must
                not go through the locale routing map. */}
            <a
              href="https://monespace.cpi.sn"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-solid px-5 py-3 text-sm font-medium tracking-wide text-brand-solid-foreground uppercase"
            >
              {t('mySpace')}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="size-3.5"
              >
                <path d="M7 17L17 7M17 7H8m9 0v9" />
              </svg>
            </a>
          </nav>
        </div>
      ) : null}
    </>
  )
}
