'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useCart } from './cart-provider'
import { Link } from '@/i18n/routing'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Selection checkout.
 *
 * The enquiry is written to Payload and stops there — CPI reads it in the
 * admin. There is no WhatsApp handoff: the earlier flow opened `wa.me` after
 * saving, which meant the visitor's last step happened somewhere CPI could not
 * see, and any reply lived in one salesperson's phone rather than the shared
 * pipeline. Persisting was always the part that mattered; it is now the whole
 * of it.
 *
 * On success the reference is shown, so the visitor has something to quote and
 * CPI can find the record instantly.
 */
export function SelectionForm() {
  const t = useTranslations('cart')
  const tForms = useTranslations('forms')
  const tProperty = useTranslations('property')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const { items, ready, remove, clear } = useCart()

  const [status, setStatus] = useState<Status>('idle')
  const [reference, setReference] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')

    const form = new FormData(event.currentTarget)

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cart',
          name: form.get('name'),
          phone: form.get('phone'),
          email: form.get('email') || undefined,
          message: form.get('message') || undefined,
          company: form.get('company') || undefined, // honeypot
          items: items.map((i) => i.id),
          source: window.location.pathname,
          locale,
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setReference((await res.json()).reference ?? null)
    } catch {
      // Never report success we did not get: the visitor would walk away
      // believing CPI has their details when nobody does.
      setStatus('error')
      return
    }

    // Only cleared once the write is confirmed, so a failed submit leaves the
    // selection intact to retry.
    clear()
    setStatus('sent')
  }

  // Neutral state until localStorage has been read, so the first client render
  // matches the server's.
  if (!ready) {
    return <p className="text-foreground-muted">{tCommon('loading')}</p>
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="rounded-lg border border-brand-border bg-brand-muted p-10 text-center"
      >
        <p className="font-heading text-2xl text-brand">{t('successTitle')}</p>
        <p className="mx-auto mt-3 max-w-md text-foreground-muted">{t('successBody')}</p>
        {reference ? (
          <p className="mt-6 inline-block rounded-full border border-brand-border px-5 py-2 font-mono text-sm text-brand">
            {t('successReference', { reference })}
          </p>
        ) : null}
        <div className="mt-8">
          <Link
            href="/terrains"
            className="inline-flex rounded-full bg-brand-solid px-7 py-3 text-sm font-medium text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover"
          >
            {t('emptyAction')}
          </Link>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border border-subtle bg-surface-raised p-10 text-center">
        <p className="text-foreground-muted">{t('empty')}</p>
        <Link
          href="/terrains"
          className="mt-6 inline-flex rounded-full bg-brand-solid px-7 py-3 text-sm font-medium text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover"
        >
          {t('emptyAction')}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <ul className="divide-y divide-subtle rounded-lg border border-subtle bg-surface-raised">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 p-5">
            <div>
              <p className="font-heading text-lg text-foreground">{item.title}</p>
              {item.details ? (
                <p className="mt-1 text-sm text-foreground-muted">{item.details}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="shrink-0 text-sm text-foreground-muted underline underline-offset-2 hover:text-brand"
            >
              {t('remove')}
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="rounded-lg border border-subtle bg-surface-raised p-6">
        <p className="text-sm text-foreground-muted">
          {tProperty('count', { count: items.length })}
        </p>

        <div className="mt-5 space-y-4">
          <Field name="name" label={t('form.name')} required />
          <Field name="phone" label={t('form.phone')} type="tel" required />
          <Field name="email" label={t('form.email')} type="email" />
          <Field name="message" label={t('form.message')} textarea />
        </div>

        {/* Honeypot: hidden from people, irresistible to bots. */}
        <div aria-hidden className="absolute left-[-9999px]">
          <label>
            Company
            <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {status === 'error' ? (
          <p role="alert" className="mt-4 text-sm text-brand">
            {tForms('error')}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="mt-6 w-full rounded-full bg-brand-solid px-7 py-3 text-sm font-medium text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover disabled:opacity-60"
        >
          {status === 'sending' ? t('submitting') : t('submit')}
        </button>

        <p className="mt-3 text-xs text-foreground-muted">{t('hint')}</p>
      </form>
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
    'mt-1.5 w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-brand-border'

  return (
    <label className="block text-sm text-foreground-muted">
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
