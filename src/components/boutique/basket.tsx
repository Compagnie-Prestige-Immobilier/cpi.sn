'use client'

import { useState } from 'react'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { useCart } from '@/components/cart/cart-provider'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * The basket, and its checkout.
 *
 * IMPORTANT — this does not take money. The design's checkout promises
 * "paiement sécurisé … reçu délivré immédiatement"; there is no payment
 * gateway, so the final action submits a **priced quote request** to Payload
 * and says so. A checkout button that charges nothing is worse than no
 * checkout, and in Senegal that reads as fraud rather than an oversight.
 *
 * When a gateway is chosen (PayDunya and CinetPay both cover Wave + Orange
 * Money + card), this is the component it lands in — it already carries lines,
 * quantities and a total.
 *
 * Totals cover priced lines only: most CPI listings are "prix sur demande", and
 * counting them as zero would imply the land is free.
 */
export function Basket() {
  const t = useTranslations('boutique.cart')
  const tShop = useTranslations('boutique')
  const tForms = useTranslations('forms')
  const tCart = useTranslations('cart')
  const format = useFormatter()
  const locale = useLocale()
  const { items, ready, setQty, remove, clear, total } = useCart()
  const [status, setStatus] = useState<Status>('idle')
  const [reference, setReference] = useState<string | null>(null)

  const hasUnpriced = items.some((i) => i.price == null)

  // XOF has no minor unit — never render decimals. See CLAUDE.md.
  const money = (n: number) =>
    `${format.number(n, { maximumFractionDigits: 0 })} FCFA`

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    const form = new FormData(event.currentTarget)

    // The quoted lines travel in the message so CPI sees exactly what was in
    // the basket, including quantities and the indicative total.
    const lines = items
      .map((i) => `• ${i.title} ×${i.qty ?? 1} — ${i.price != null ? money(i.price) : tShop('onRequest')}`)
      .join('\n')

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cart',
          name: form.get('name'),
          phone: form.get('phone'),
          email: form.get('email') || undefined,
          message: `${lines}\n\n${t('total')}: ${money(total)}${
            form.get('message') ? `\n\n${form.get('message')}` : ''
          }`,
          company: form.get('company') || undefined, // honeypot
          items: items.filter((i) => i.kind !== 'service').map((i) => i.id),
          source: '/boutique',
          locale,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setReference((await res.json()).reference ?? null)
    } catch {
      setStatus('error')
      return
    }

    clear()
    setStatus('sent')
  }

  if (!ready) return null

  if (status === 'sent') {
    return (
      <div role="status" className="border border-brand-border bg-brand-muted p-8 text-center">
        <p className="font-heading text-2xl font-bold text-brand uppercase">
          {tCart('successTitle')}
        </p>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-foreground-muted">
          {tCart('successBody')}
        </p>
        {reference ? (
          <p className="mt-6 inline-block border border-brand-border px-5 py-2 font-mono text-sm text-brand">
            {tCart('successReference', { reference })}
          </p>
        ) : null}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="border border-subtle bg-surface-raised p-8 text-center text-foreground-muted">
        {t('empty')}
      </div>
    )
  }

  return (
    <div className="border border-subtle bg-surface-raised">
      <ul className="divide-y divide-subtle">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-4 p-5">
            <div className="min-w-0 flex-1">
              <p className="font-heading text-lg leading-tight font-semibold text-foreground uppercase">
                {item.title}
              </p>
              <p className="mt-1 text-[13px] text-brand">
                {item.price != null ? money(item.price) : tShop('onRequest')}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center border border-subtle">
                  <button
                    type="button"
                    aria-label={t('decrease')}
                    onClick={() => setQty(item.id, (item.qty ?? 1) - 1)}
                    className="px-2.5 py-1 text-foreground-muted transition-colors hover:text-brand"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm tabular-nums">{item.qty ?? 1}</span>
                  <button
                    type="button"
                    aria-label={t('increase')}
                    onClick={() => setQty(item.id, (item.qty ?? 1) + 1)}
                    className="px-2.5 py-1 text-foreground-muted transition-colors hover:text-brand"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="text-[13px] text-foreground-muted underline-offset-2 transition-colors hover:text-brand hover:underline"
                >
                  {t('remove')}
                </button>
              </div>
            </div>

            {item.price != null ? (
              <p className="shrink-0 text-[13px] font-semibold text-foreground tabular-nums">
                {money(item.price * (item.qty ?? 1))}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="border-t border-subtle p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] tracking-[0.1em] text-foreground-muted uppercase">
            {t('total')}
          </span>
          <span className="font-heading text-2xl font-bold text-foreground tabular-nums">
            {money(total)}
          </span>
        </div>
        {hasUnpriced ? (
          <p className="mt-2 text-[12px] leading-relaxed text-foreground-muted">{t('quoteNote')}</p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <Field name="name" label={tCart('form.name')} required />
          <Field name="phone" label={tCart('form.phone')} type="tel" required />
          <Field name="email" label={tCart('form.email')} type="email" />
          <Field name="message" label={tCart('form.message')} textarea />

          <div aria-hidden className="absolute left-[-9999px]">
            <label>
              Company
              <input type="text" name="company" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {status === 'error' ? (
            <p role="alert" className="text-sm text-brand">
              {tForms('error')}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full bg-brand-solid px-6 py-3.5 text-[13px] font-semibold text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover disabled:opacity-60"
          >
            {status === 'sending' ? tCart('submitting') : t('checkout')}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  name,
  label,
  type = 'text',
  required,
  textarea,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  textarea?: boolean
}) {
  const className =
    'mt-1.5 w-full border border-subtle bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-brand-border'
  return (
    <label className="block text-[13px] text-foreground-muted">
      {label}
      {required ? <span className="text-brand"> *</span> : null}
      {textarea ? (
        <textarea name={name} rows={3} className={className} />
      ) : (
        <input type={type} name={name} required={required} className={className} />
      )}
    </label>
  )
}
