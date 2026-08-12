import { getLocale, getTranslations } from 'next-intl/server'
import { CmsLink } from '@/components/ui/cms-link'
import { getNavigation, getSiteSettings } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

/**
 * Footer, driven by `site-settings` and `navigation`.
 *
 * Contact details are CMS-managed rather than constants: the phone number
 * appears in the header, the footer, every form and the WhatsApp cart handoff,
 * and CPI will change it. One edit, everywhere.
 */
export async function SiteFooter() {
  const locale = (await getLocale()) as Locale
  const [tSite, settings, nav] = await Promise.all([
    getTranslations('site'),
    getSiteSettings(locale),
    getNavigation(locale),
  ])

  const year = new Date().getFullYear()
  const columns = nav.footerColumns ?? []

  return (
    <footer className="mt-24 border-t border-subtle bg-surface-sunken">
      <div className="container-page grid gap-12 py-16 md:grid-cols-3">
        <div>
          <p className="font-heading text-2xl text-brand">
            {settings.siteName ?? tSite('fullName')}
          </p>
          {settings.tagline ? (
            <p className="mt-3 max-w-xs text-sm text-foreground-muted">{settings.tagline}</p>
          ) : null}
          {settings.address ? (
            <p className="mt-4 max-w-xs text-sm whitespace-pre-line text-foreground-muted">
              {settings.address}
            </p>
          ) : null}
        </div>

        {columns.length ? (
          columns.map((column) => (
            <nav key={column.id ?? column.heading} className="flex flex-col gap-2.5">
              {column.heading ? (
                <p className="text-xs font-medium tracking-[0.16em] text-foreground uppercase">
                  {column.heading}
                </p>
              ) : null}
              {(column.links ?? []).map((link) => (
                <CmsLink
                  key={link.id ?? link.label}
                  href={link.href}
                  className="text-sm text-foreground-muted transition-colors hover:text-brand"
                >
                  {link.label}
                </CmsLink>
              ))}
            </nav>
          ))
        ) : (
          /* No footer columns configured yet — fall back to the main menu so the
             footer is never an empty band. */
          <nav className="flex flex-col gap-2.5">
            {(nav.header ?? []).map((item) => (
              <CmsLink
                key={item.id ?? item.label}
                href={item.href}
                className="text-sm text-foreground-muted transition-colors hover:text-brand"
              >
                {item.label}
              </CmsLink>
            ))}
          </nav>
        )}

        <div className="flex flex-col gap-2.5 text-sm">
          {(settings.phones ?? []).map((phone) => (
            <a
              key={phone.id ?? phone.number}
              href={`tel:${(phone.number ?? '').replace(/\s/g, '')}`}
              className="text-foreground-muted transition-colors hover:text-brand"
            >
              {phone.number}
            </a>
          ))}

          {settings.email ? (
            <a
              href={`mailto:${settings.email}`}
              className="text-foreground-muted transition-colors hover:text-brand"
            >
              {settings.email}
            </a>
          ) : null}

          {settings.openingHours ? (
            <p className="text-foreground-muted">{settings.openingHours}</p>
          ) : null}

          {(settings.socials ?? []).length ? (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {(settings.socials ?? []).map((social) => (
                <li key={social.id ?? social.url}>
                  <a
                    href={social.url ?? '#'}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs tracking-wide text-foreground-muted uppercase transition-colors hover:text-brand"
                  >
                    {social.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="border-t border-subtle">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.siteName ?? tSite('fullName')}
          </p>
          <div className="flex gap-5">
            {(nav.legal ?? []).map((link) => (
              <CmsLink
                key={link.id ?? link.label}
                href={link.href}
                className="transition-colors hover:text-brand"
              >
                {link.label}
              </CmsLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
