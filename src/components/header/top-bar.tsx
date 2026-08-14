import { getLocale } from 'next-intl/server'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { getSiteSettings } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

/**
 * The utility strip above the main header.
 *
 * Every value comes from `site-settings` — address, hours, phone numbers, email
 * and socials. The design hardcodes them, but these are exactly the details
 * that change, and CPI has to be able to change them without a deploy.
 *
 * Visible at every width. It was hidden below `lg`, which made the address and
 * opening hours vanish on a narrow window — the strip is where visitors look
 * for them, so it now wraps instead of disappearing. Only the social icons drop
 * on the smallest screens, where they are the least useful item and repeat in
 * the footer anyway.
 */
const SOCIAL_PATHS: Record<string, string> = {
  facebook:
    'M13.5 21v-7h2.6l.4-3h-3V9.2c0-.9.3-1.5 1.6-1.5H16.6V5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H7.8v3h2.4v7h3.3Z',
  linkedin:
    'M6.9 8.6H4.3V20h2.6V8.6ZM5.6 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM20 13.6c0-3-1.6-4.4-3.8-4.4-1.7 0-2.5.9-2.9 1.6V8.6H10.7V20h2.6v-6.3c0-1.4.8-2 1.8-2 1 0 1.6.6 1.6 2V20H20v-6.4Z',
  tiktok:
    'M16.5 3c.3 1.9 1.4 3.1 3.3 3.3v2.4c-1.1.1-2.1-.2-3.2-.8v5.6c0 3.4-2.6 5.6-5.6 5.1-2.4-.4-4.1-2.4-4.1-4.8 0-2.8 2.3-5 5.1-4.9v2.5c-.4-.1-.8-.1-1.2 0-1.2.2-2 1.2-1.9 2.4.1 1.2 1.1 2.1 2.3 2 1.2 0 2.2-1 2.2-2.3V3h3.1Z',
  youtube:
    'M21.6 7.9a2.5 2.5 0 0 0-1.8-1.8C18.2 5.7 12 5.7 12 5.7s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.9C2 9.5 2 12 2 12s0 2.5.4 4.1a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.1.4-4.1s0-2.5-.4-4.1ZM10 15V9l5.2 3L10 15Z',
  x: 'M17.6 3h3.3l-7.2 8.2L22 21h-6.6l-5.2-6.6L4.3 21H1l7.7-8.8L1.3 3H8l4.7 6.1L17.6 3Zm-1.2 16h1.8L7.7 4.9H5.7L16.4 19Z',
}

export async function HeaderTopBar() {
  const locale = (await getLocale()) as Locale
  const settings = await getSiteSettings(locale)

  const phones = (settings.phones ?? []).map((p) => p.number).filter(Boolean)
  const socials = settings.socials ?? []

  return (
    <div className="border-b border-subtle/60">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-1 px-6 py-2 text-[12px] text-foreground-muted">
        {settings.address ? (
          <span className="flex items-center gap-[7px]">
            <Pin />
            {settings.address}
          </span>
        ) : null}
        {settings.openingHours ? (
          <span className="flex items-center gap-[7px]">
            <Clock />
            {settings.openingHours}
          </span>
        ) : null}

        <span className="ms-auto flex flex-wrap items-center gap-x-4 gap-y-1">
          {phones.map((phone) => (
            <a
              key={phone}
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="transition-colors hover:text-brand"
            >
              {phone}
            </a>
          ))}
          {settings.email ? (
            <a href={`mailto:${settings.email}`} className="transition-colors hover:text-brand">
              {settings.email}
            </a>
          ) : null}

          <ThemeToggle compact />
          <LanguageSwitcher compact />

          {socials.length ? (
            <span className="hidden items-center gap-2.5 sm:flex">
              {socials.map((s) => {
                const path = SOCIAL_PATHS[s.platform]
                return (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="text-foreground-muted transition-colors hover:text-brand"
                  >
                    {path ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d={path} />
                      </svg>
                    ) : (
                      /* Instagram and anything without a filled glyph above. */
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden
                      >
                        <rect x="4" y="4" width="16" height="16" rx="4.5" />
                        <circle cx="12" cy="12" r="3.6" />
                      </svg>
                    )}
                  </a>
                )
              })}
            </span>
          ) : null}
        </span>
      </div>
    </div>
  )
}

function Pin() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="text-brand"
    >
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  )
}

function Clock() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="text-brand"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}
