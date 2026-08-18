import { getLocale, getTranslations } from 'next-intl/server'

import { ContactForm } from '@/components/forms/contact-form'
import { getSiteSettings } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

/**
 * Coordinates beside the enquiry form — the body of the contact page.
 *
 * Laid out like `FounderIntro` on /a-propos: a narrow left column carrying the
 * fixed detail, a wide right column carrying the thing the visitor came to do.
 * The page it replaces was the WordPress import — two identical <h1>s, the
 * address typed out three times, and the social networks rendered as the plain
 * sentence "Facebook Twitter Youtube Linkedin Instagram Skype".
 *
 * Every value comes from `site-settings`, so CPI changes a phone number in one
 * place and the header strip, the footer and this page all follow. That import
 * also carried two addresses — commercial@ and marketing@ — that CPI no longer
 * uses; reading the global rather than the page body is what retires them.
 *
 * There is no embedded map. A Google Maps iframe is ~1 MB and third-party
 * cookies on a page whose only job is a phone number and a form; the address
 * plus a directions link does the same work. If CPI wants the map, it should be
 * a click-to-load facade like `VideoModal`, not an eager iframe.
 */
export async function ContactDetails() {
  const locale = (await getLocale()) as Locale
  const [t, settings] = await Promise.all([getTranslations('contact'), getSiteSettings(locale)])

  const phones = (settings.phones ?? []).filter((p) => p.number)
  const directionsHref = settings.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${settings.address}, Dakar, Sénégal`,
      )}`
    : null

  return (
    <section className="border-b border-subtle bg-surface">
      <div className="container-page py-20 lg:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-14">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-brand uppercase">
              {t('detailsTitle')}
            </p>

            {/* Hairline grid, the same construction as the founder highlights:
                one border, cell backgrounds, gaps drawn by the parent. */}
            <dl className="mt-6 grid gap-px border border-subtle bg-subtle">
              {settings.address ? (
                <Row icon={<Pin />} label={t('address')}>
                  <span className="whitespace-pre-line">{settings.address}</span>
                  {directionsHref ? (
                    <a
                      href={directionsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-brand transition-colors hover:text-brand-hover"
                    >
                      {t('directions')} →
                    </a>
                  ) : null}
                </Row>
              ) : null}

              {phones.length ? (
                <Row icon={<Phone />} label={t('phone')}>
                  {phones.map((p) => (
                    <a
                      key={p.number}
                      href={`tel:${(p.number ?? '').replace(/\s+/g, '')}`}
                      className="block transition-colors hover:text-brand"
                    >
                      {p.number}
                      {p.label ? (
                        <span className="text-foreground-muted/70"> — {p.label}</span>
                      ) : null}
                    </a>
                  ))}
                </Row>
              ) : null}

              {settings.email ? (
                <Row icon={<Envelope />} label={t('email')}>
                  <a
                    href={`mailto:${settings.email}`}
                    className="transition-colors hover:text-brand"
                  >
                    {settings.email}
                  </a>
                </Row>
              ) : null}

              {settings.openingHours ? (
                <Row icon={<Clock />} label={t('hours')}>
                  {settings.openingHours}
                </Row>
              ) : null}
            </dl>
          </div>

          <div>
            <h2 className="font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.05] font-bold text-foreground uppercase">
              {t('formTitle')}
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground-muted">
              {t('formLead')}
            </p>
            <div className="mt-8">
              <ContactForm subject="/contact" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-surface p-5">
      <dt className="flex items-center gap-2 text-[11px] tracking-[0.18em] text-foreground-muted/70 uppercase">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 text-[14px] leading-relaxed text-foreground-muted">{children}</dd>
    </div>
  )
}

const stroke = {
  width: 15,
  height: 15,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  className: 'text-brand',
} as const

function Pin() {
  return (
    <svg {...stroke}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  )
}

function Phone() {
  return (
    <svg {...stroke}>
      <path d="M5 4h3.5l1.8 4.3-2.2 1.3a11.5 11.5 0 0 0 5.3 5.3l1.3-2.2L19 14.5V18a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 6.2 2 2 0 0 1 5 4Z" />
    </svg>
  )
}

function Envelope() {
  return (
    <svg {...stroke}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  )
}

function Clock() {
  return (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}
