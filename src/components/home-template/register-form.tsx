'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * The template's register form, wired to CPI's lead pipeline.
 *
 * Posts to `/api/enquiries` — the same endpoint as `ContactForm`, honeypot and
 * all — rather than the template's `contact-submit.php`. The `leads` collection
 * stays closed to anonymous REST writes; the route handler writes through
 * Payload's Local API with `overrideAccess`.
 *
 * The dialling codes lead with +221 and then the diaspora markets CPI actually
 * sells into; the template's +60/+62 Malaysia/Indonesia list is meaningless
 * here.
 */
const DIAL_CODES = ['+221', '+33', '+1', '+39', '+34', '+32', '+44']

export function TemplateRegisterForm() {
  const t = useTranslations('homeTemplate.register')
  const tForms = useTranslations('forms')
  const locale = useLocale()
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')

    const form = new FormData(event.currentTarget)
    const dial = String(form.get('dialCode') ?? '')
    const phone = String(form.get('phone') ?? '')

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'form',
          name: form.get('name'),
          phone: `${dial} ${phone}`.trim(),
          email: form.get('email') || undefined,
          message: form.get('country') ? `${t('country')}: ${form.get('country')}` : undefined,
          company: form.get('company') || undefined, // honeypot
          source: 'home:s9-register',
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
        className="border border-brand-border bg-brand-muted p-8 text-center"
      >
        <p className="font-heading text-xl text-brand">{tForms('success')}</p>
      </div>
    )
  }

  const field =
    'w-full border border-transparent bg-black/5 px-4 py-3 text-foreground outline-none transition-colors focus:border-strong dark:bg-white/5'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="reg-name" className="mb-2 block text-sm text-foreground-muted">
          {t('name')}
        </label>
        <input id="reg-name" name="name" required className={field} placeholder={t('namePlaceholder')} />
      </div>

      <div>
        <label htmlFor="reg-email" className="mb-2 block text-sm text-foreground-muted">
          {t('email')}
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          className={field}
          placeholder={t('emailPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="reg-phone" className="mb-2 block text-sm text-foreground-muted">
          {t('phone')}
        </label>
        <div className="flex gap-2">
          <select
            name="dialCode"
            aria-label={t('dialCode')}
            defaultValue="+221"
            className={`${field} w-auto min-w-24`}
          >
            {DIAL_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <input
            id="reg-phone"
            name="phone"
            type="tel"
            required
            className={field}
            placeholder={t('phonePlaceholder')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="reg-country" className="mb-2 block text-sm text-foreground-muted">
          {t('country')}
        </label>
        <input
          id="reg-country"
          name="country"
          className={field}
          placeholder={t('countryPlaceholder')}
        />
      </div>

      <div aria-hidden className="absolute left-[-9999px]">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="mt-2 flex cursor-pointer items-start gap-3 text-sm text-foreground-muted">
        <input type="checkbox" name="terms" required className="mt-1 accent-[var(--brand-solid)]" />
        <span>{t('terms')}</span>
      </label>

      {status === 'error' ? (
        <p role="alert" className="text-sm text-brand">
          {tForms('error')}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-4 inline-flex w-max items-center justify-center rounded-full bg-brand-solid px-6 py-3 font-medium text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover disabled:opacity-60"
      >
        {status === 'sending' ? tForms('submitting') : t('submit')}
      </button>
    </form>
  )
}
