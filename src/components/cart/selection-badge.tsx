'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useCart } from './cart-provider'

/**
 * Header entry point to the selection.
 *
 * Always rendered, so the cart is a fixed landmark in the header rather than a
 * control that appears out of nowhere the first time something is added — which
 * also meant a visitor who had built a selection on a previous visit had no
 * visible way back to it until the page rehydrated.
 *
 * The count bubble is the part that is conditional. `ready` guards it rather
 * than the whole button: the server cannot know what is in localStorage, so
 * rendering the count before hydration would mismatch.
 */
export function SelectionBadge() {
  const t = useTranslations('cart')
  const { items, ready } = useCart()
  const count = ready ? items.length : 0

  return (
    <Link
      href="/ma-selection"
      aria-label={t('count', { count })}
      title={t('open')}
      className="relative inline-flex size-[38px] items-center justify-center border border-strong/45 text-foreground transition-colors hover:border-brand-border hover:text-brand"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-5"
        aria-hidden
      >
        <path d="M4 7h16l-1.2 12.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9L4 7Z" strokeLinejoin="round" />
        <path d="M9 7V5.5a3 3 0 0 1 6 0V7" strokeLinecap="round" />
      </svg>
      {count > 0 ? (
        <span className="absolute -end-1.5 -top-1.5 grid size-[18px] place-items-center bg-brand-solid text-[0.625rem] font-semibold text-brand-solid-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  )
}
