import { getLocale, getTranslations } from 'next-intl/server'

import { getSiteSettings } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

/**
 * The four ways to reach CPI, as a hairline grid.
 *
 * Same construction as the founder highlights on /a-propos — one border, cell
 * backgrounds, gaps drawn by the parent — so the two pages read as one system.
 *
 * WhatsApp appears here as a *contact detail*, which is what
 * `siteSettings.whatsappNumber` is retained for. It does not carry a cart
 * handoff: that flow was removed precisely because a conversation CPI cannot
 * see is not a lead. Nothing on this page prefills a basket.
 *
 * Every cell is a real link — a card that only describes a channel makes the
 * visitor go and find it themselves. Cells whose detail is missing from
 * `site-settings` are dropped rather than rendered dead.
 */
export async function ContactChannels() {
  const locale = (await getLocale()) as Locale
  const [t, settings] = await Promise.all([getTranslations('contact'), getSiteSettings(locale)])

  const firstPhone = (settings.phones ?? []).find((p) => p.number)?.number
  const directionsHref = settings.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${settings.address}, Dakar, Sénégal`,
      )}`
    : null

  const cells = [
    firstPhone && {
      key: 'call',
      href: `tel:${firstPhone.replace(/\s+/g, '')}`,
      title: t('callTitle'),
      text: t('callText'),
      detail: firstPhone,
      external: false,
    },
    settings.whatsappNumber && {
      key: 'whatsapp',
      href: `https://wa.me/${settings.whatsappNumber}`,
      title: t('whatsappTitle'),
      text: t('whatsappText'),
      detail: `+${settings.whatsappNumber}`,
      external: true,
    },
    directionsHref && {
      key: 'visit',
      href: directionsHref,
      title: t('visitTitle'),
      text: t('visitText'),
      detail: t('directions'),
      external: true,
    },
    {
      key: 'portal',
      // A separate application, so a plain anchor — `Link` would resolve it
      // against the locale routing map.
      href: 'https://monespace.cpi.sn',
      title: t('portalTitle'),
      text: t('portalText'),
      detail: 'monespace.cpi.sn',
      external: true,
    },
  ].filter(Boolean) as {
    key: string
    href: string
    title: string
    text: string
    detail: string
    external: boolean
  }[]

  return (
    <section className="border-b border-subtle bg-surface-sunken">
      <div className="container-page py-20 lg:py-24">
        <p className="text-[11px] tracking-[0.28em] text-brand uppercase">{t('channelsTitle')}</p>

        <div className="mt-8 grid gap-px border border-subtle bg-subtle sm:grid-cols-2 lg:grid-cols-4">
          {cells.map((cell) => (
            <a
              key={cell.key}
              href={cell.href}
              {...(cell.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="group flex flex-col bg-surface p-6 transition-colors hover:bg-surface-raised"
            >
              <span className="font-heading text-lg leading-tight font-bold text-foreground uppercase transition-colors group-hover:text-brand">
                {cell.title}
              </span>
              <span className="mt-2.5 flex-1 text-[13px] leading-relaxed text-foreground-muted">
                {cell.text}
              </span>
              <span className="mt-5 text-[13px] font-semibold text-brand">{cell.detail} →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
