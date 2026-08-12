import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/routing'
import { CmsLink } from '@/components/ui/cms-link'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileNav } from '@/components/mobile-nav'
import { getNavigation } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

/**
 * Site header, driven by the `navigation` global.
 *
 * The menu is two levels at most. The old WordPress menu nested four deep
 * ("PROJETS → PROJETS RÉALISÉS → PROGRAMMES FONCIERS → …") where every leaf was
 * a filter over one collection — filtering belongs on the listing page.
 */
export async function SiteHeader() {
  const locale = (await getLocale()) as Locale
  const [t, nav] = await Promise.all([getTranslations('nav'), getNavigation(locale)])

  const items = nav.header ?? []

  return (
    <header className="sticky top-0 z-40 border-b border-subtle bg-surface/85 backdrop-blur-md">
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="CPI">
          {/* Two files, not a CSS filter: inverting the burgundy logo turns it
              cyan. See CLAUDE.md → Theming. */}
          <Image
            src="/brand/logo-dark.png"
            alt="Compagnie Prestige Immobilier"
            width={244}
            height={91}
            priority
            data-no-dim
            className="h-11 w-auto dark:hidden"
          />
          <Image
            src="/brand/logo-light.png"
            alt="Compagnie Prestige Immobilier"
            width={244}
            height={91}
            priority
            data-no-dim
            className="hidden h-11 w-auto dark:block"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label={t('home')}>
          {items.map((item) => (
            <div key={item.id ?? item.label} className="group relative">
              <CmsLink
                href={item.href}
                className="flex items-center gap-1 text-[0.8125rem] font-medium tracking-[0.08em] text-foreground-muted uppercase transition-colors hover:text-brand"
              >
                {item.label}
                {item.children?.length ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3"
                    aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                  </svg>
                ) : null}
              </CmsLink>

              {item.children?.length ? (
                /* Hover *and* focus-within, so the submenu is reachable by
                   keyboard rather than mouse-only as in the template. */
                <div className="invisible absolute start-0 top-full z-10 min-w-60 translate-y-1 rounded-lg border border-subtle bg-surface-raised p-2 opacity-0 shadow-lg transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {item.children.map((child) => (
                    <CmsLink
                      key={child.id ?? child.label}
                      href={child.href}
                      className="block rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-brand-muted hover:text-brand"
                    >
                      {child.label}
                    </CmsLink>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <MobileNav
            items={items.map((i) => ({
              label: i.label ?? '',
              href: i.href ?? null,
              children: (i.children ?? []).map((c) => ({ label: c.label ?? '', href: c.href ?? null })),
            }))}
          />
        </div>
      </div>
    </header>
  )
}
