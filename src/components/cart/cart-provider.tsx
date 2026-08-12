'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * The visitor's property selection.
 *
 * Client-side only, persisted to localStorage. There are no accounts and no
 * server-side sessions — nothing is written to the database until checkout, so
 * an abandoned selection leaves no orphan rows. See CLAUDE.md → Cart.
 */
export type CartItem = {
  id: number
  slug: string
  title: string
  details: string
  productLine: 'foncier' | 'immobilier'
}

type CartContextValue = {
  items: CartItem[]
  /** False until localStorage has been read — see the hydration note below. */
  ready: boolean
  has: (id: number) => boolean
  add: (item: CartItem) => void
  remove: (id: number) => void
  toggle: (item: CartItem) => void
  clear: () => void
}

const STORAGE_KEY = 'cpi.selection.v1'
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  /**
   * `ready` guards against a hydration mismatch: the server has no idea what is
   * in localStorage, so the first client render must match the server's empty
   * state. Consumers render their neutral state until this flips.
   */
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed as CartItem[])
      }
    } catch {
      // Corrupt or unavailable storage (private mode, quota) must never break
      // the page — an empty selection is a fine fallback.
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* quota exceeded — the selection simply won't persist */
    }
  }, [items, ready])

  // Keep tabs in sync: a visitor comparing listings in two tabs should not see
  // one overwrite the other's selection.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue === null) return
      try {
        const parsed: unknown = JSON.parse(e.newValue)
        if (Array.isArray(parsed)) setItems(parsed as CartItem[])
      } catch {
        /* ignore malformed writes from another tab */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const has = useCallback((id: number) => items.some((i) => i.id === id), [items])

  const add = useCallback((item: CartItem) => {
    setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]))
  }, [])

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const toggle = useCallback((item: CartItem) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item],
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({ items, ready, has, add, remove, toggle, clear }),
    [items, ready, has, add, remove, toggle, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
