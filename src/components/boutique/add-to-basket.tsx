'use client'

import { useTranslations } from 'next-intl'
import { useCart, type CartItem } from '@/components/cart/cart-provider'

/**
 * Add-to-basket control.
 *
 * Renders a neutral label until the cart has hydrated: the server cannot know
 * what is in localStorage, so showing "in basket" before then would flip on
 * first paint.
 */
export function AddToBasket({ item }: { item: CartItem }) {
  const t = useTranslations('boutique')
  const { add, has, ready } = useCart()
  const inBasket = ready && has(item.id)

  return (
    <button
      type="button"
      onClick={() => add(item)}
      aria-live="polite"
      className={
        inBasket
          ? 'w-full border border-brand-border px-4 py-2.5 text-[13px] font-semibold text-brand transition-colors'
          : 'w-full bg-brand-solid px-4 py-2.5 text-[13px] font-semibold text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover'
      }
    >
      {inBasket ? t('added') : t('add')}
    </button>
  )
}
