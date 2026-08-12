'use client'

import { useTranslations } from 'next-intl'
import { useCart, type CartItem } from './cart-provider'

export function AddToSelection({
  item,
  className = '',
}: {
  item: CartItem
  className?: string
}) {
  const t = useTranslations('property')
  const { has, toggle, ready } = useCart()

  const selected = ready && has(item.id)

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      // Until localStorage has been read the server and client must agree, so
      // the button renders in its neutral "add" state and is inert.
      disabled={!ready}
      aria-pressed={selected}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors disabled:opacity-60 ${
        selected
          ? 'border border-brand-border bg-brand-muted text-brand'
          : 'bg-brand-solid text-brand-solid-foreground hover:bg-brand-solid-hover'
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden>
        {selected ? (
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        )}
      </svg>
      {selected ? t('inSelection') : t('addToSelection')}
    </button>
  )
}
