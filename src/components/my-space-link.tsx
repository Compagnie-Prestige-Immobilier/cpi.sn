import { getTranslations } from 'next-intl/server'

/**
 * Link to CPI's client portal.
 *
 * A separate application on its own subdomain, so this is a plain `<a>` — not
 * `Link` or `CmsLink`, which would try to resolve it against the locale routing
 * map and rewrite it.
 *
 * `rel="noopener noreferrer"` is not decoration: `target="_blank"` otherwise
 * hands the opened page a live `window.opener` reference back into this one.
 *
 * The label lives in the message catalogs like every other UI string, though
 * both locales currently read "Mon espace" — it is the portal's name, not a
 * phrase to translate.
 */
export async function MySpaceLink({ className = '' }: { className?: string }) {
  const t = await getTranslations('nav')

  return (
    <a
      href="https://monespace.cpi.sn"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-[9px] bg-brand-solid px-[18px] py-3 text-[13px] font-semibold tracking-[0.03em] text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover ${className}`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="4" y="10.5" width="16" height="10.5" rx="1" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      </svg>
      {t('mySpace')}
    </a>
  )
}
