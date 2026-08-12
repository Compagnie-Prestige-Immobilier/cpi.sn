'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useCart } from './cart-provider'
import { Link } from '@/i18n/routing'
import { buildWhatsAppMessage, whatsAppUrl } from '@/lib/whatsapp'

type Status = 'idle' | 'sending' | 'error'

export function SelectionForm({ whatsappNumber }: { whatsappNumber: string }) {
  const t = useTranslations('cart')
  const tForms = useTranslations('forms')
  const tProperty = useTranslations('property')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const { items, ready, remove, clear } = useCart()

  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')

    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '')
    const phone = String(form.get('phone') ?? '')

    let reference: string | null = null

    try {
      /**
       * Persist FIRST, open WhatsApp second.
       *
       * If the visitor never presses send in WhatsApp — or the handoff fails
       * entirely — CPI still has the enquiry. Reversing this order silently
       * loses every abandoned conversation. See CLAUDE.md → Cart.
       */
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cart',
          name,
          phone,
          email: form.get('email') || undefined,
          message: form.get('message') || undefined,
          company: form.get('company') || undefined, // honeypot
          items: items.map((i) => i.id),
          source: window.location.pathname,
          locale,
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      reference = (await res.json()).reference ?? null
    } catch {
      // The lead could not be saved. Do NOT hand off to WhatsApp pretending it
      // worked — the visitor would believe CPI has their details when nobody
      // does. Let them retry or call.
      setStatus('error')
      return
    }

    const message = buildWhatsAppMessage({
      intro: t('whatsapp.intro'),
      lines: items.map((i) => ({ title: i.title, details: i.details })),
      referenceLabel: reference ? t('whatsapp.reference', { reference }) : '',
      truncatedLabel: (count) => t('whatsapp.truncated', { count }),
      contactLine: [name, phone].filter(Boolean).join(' · '),
    })

    clear()
    window.open(whatsAppUrl(whatsappNumber, message), '_blank', 'noopener,noreferrer')
  }

  // Neutral state until localStorage has been read, so the first client render
  // matches the server's.
  if (!ready) {
    return <p className="text-foreground-muted">{tCommon('loading')}</p>
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

        <p className="mt-3 text-xs text-foreground-muted">{t('whatsappHint')}</p>
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
