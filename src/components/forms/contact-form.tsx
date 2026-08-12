'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Lead-capture form used by the `contactForm` block and the /demande pages.
 *
 * Posts to /api/leads, which writes through Payload's Local API — the `leads`
 * collection stays closed to anonymous REST writes (src/collections/Leads.ts).
 */
export function ContactForm({ subject }: { subject?: string | null }) {
  const t = useTranslations('forms')
  const tCart = useTranslations('cart')
  const locale = useLocale()
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')

    const form = new FormData(event.currentTarget)

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'form',
          name: form.get('name'),
          phone: form.get('phone'),
          email: form.get('email') || undefined,
          message: form.get('message') || undefined,
          company: form.get('company') || undefined, // honeypot
          source: subject || window.location.pathname,
          locale,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="rounded-lg border border-brand-border bg-brand-muted p-8 text-center"
      >
        <p className="font-heading text-xl text-brand">{t('success')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-subtle bg-surface-raised p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label={tCart('form.name')} required />
        <Field name="phone" label={tCart('form.phone')} type="tel" required />
      </div>
      <div className="mt-4 space-y-4">
        <Field name="email" label={tCart('form.email')} type="email" />
        <Field name="message" label={tCart('form.message')} textarea />
      </div>

      <div aria-hidden className="absolute left-[-9999px]">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === 'error' ? (
        <p role="alert" className="mt-4 text-sm text-brand">
          {t('error')}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-6 rounded-full bg-brand-solid px-7 py-3 text-sm font-medium text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover disabled:opacity-60"
      >
        {status === 'sending' ? t('submitting') : t('submit')}
      </button>
    </form>
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
        <textarea name={name} rows={4} className={className} />
      ) : (
        <input type={type} name={name} required={required} className={className} />
      )}
    </label>
  )
}
