'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useCart } from './cart-provider'

/**
 * Header entry point to the selection.
 *
 * Renders nothing until the cart is empty *and* hydrated — an always-visible
 * empty basket is noise on a site where most visitors never build a selection.
 */
export function SelectionBadge() {
  const t = useTranslations('cart')
  const { items, ready } = useCart()

  if (!ready || !items.length) return null

  return (
    <Link
      href="/ma-selection"
      aria-label={t('count', { count: items.length })}
      className="relative inline-flex size-10 items-center justify-center rounded-full border border-brand-border text-brand transition-colors hover:bg-brand-muted"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5" aria-hidden>
        <path d="M4 7h16l-1.2 12.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9L4 7Z" strokeLinejoin="round" />
        <path d="M9 7V5.5a3 3 0 0 1 6 0V7" strokeLinecap="round" />
      </svg>
      <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-brand-solid text-[0.625rem] font-semibold text-brand-solid-foreground">
        {items.length}
      </span>
    </Link>
  )
}
