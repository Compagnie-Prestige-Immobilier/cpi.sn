import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { Link, getPathname } from '@/i18n/routing'
import { CmsLink } from '@/components/ui/cms-link'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { MySpaceLink } from '@/components/my-space-link'
import { SelectionBadge } from '@/components/cart/selection-badge'
import { MobileNav } from '@/components/mobile-nav'
import { getNavigation } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

/**
 * Site header, in the redesign's visual language.
 *
 * Square corners, hairline borders, 13px sentence-case navigation and a filled
 * gold action on the right — the export uses no border radius anywhere, and
 * that flatness is most of what makes it read as the new design rather than the
 * old one.
 *
 * The menu itself is still driven by the `navigation` global, two levels at
 * most. The old WordPress menu nested four deep ("PROJETS → PROJETS RÉALISÉS →
 * PROGRAMMES FONCIERS → …") where every leaf was a filter over one collection —
 * filtering belongs on the listing page.
 */
export async function SiteHeader() {
  const locale = (await getLocale()) as Locale
  const [t, nav] = await Promise.all([getTranslations('nav'), getNavigation(locale)])

  const items = nav.header ?? []

  // The shop is a section of the homepage, so the link has to carry the
  // locale's home path rather than a bare "/#shop" — which would drop an
  // English visitor onto the French route.
  const shopHref = `${getPathname({ locale, href: '/' })}#shop`

  return (
    <header className="sticky top-0 z-40 border-b border-subtle bg-surface/[0.86] backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-3.5">
        <Link href="/" className="flex shrink-0 items-center" aria-label="CPI">
          {/* Two files, not a CSS filter: inverting the logo mangles its
              colour. See CLAUDE.md → Theming. */}
          <Image
            src="/brand/logo-dark.png"
            alt="Compagnie Prestige Immobilier"
            width={244}
            height={91}
            priority
            data-no-dim
            className="h-10 w-auto max-w-[148px] object-contain dark:hidden"
          />
          <Image
            src="/brand/logo-light.png"
            alt="Compagnie Prestige Immobilier"
            width={244}
            height={91}
            priority
            data-no-dim
            className="hidden h-10 w-auto max-w-[148px] object-contain dark:block"
          />
        </Link>

        <nav className="ms-auto hidden items-center gap-[18px] lg:flex" aria-label={t('home')}>
          {items.map((item) => (
            <div key={item.id ?? item.label} className="group relative">
              <CmsLink
                href={item.href}
                className="flex items-center gap-1 text-[13px] tracking-[0.04em] whitespace-nowrap text-foreground-muted transition-colors hover:text-brand"
              >
                {item.label}
                {item.children?.length ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3 transition-transform group-hover:rotate-180"
                    aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                  </svg>
                ) : null}
              </CmsLink>

              {item.children?.length ? (
                /* Hover *and* focus-within, so the submenu is reachable by
                   keyboard rather than mouse-only as in the export. */
                <div className="invisible absolute start-0 top-full z-10 min-w-60 translate-y-1 border border-subtle bg-surface-raised p-1 opacity-0 shadow-xl transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {item.children.map((child) => (
                    <CmsLink
                      key={child.id ?? child.label}
                      href={child.href}
                      className="block px-3 py-2 text-[13px] text-foreground-muted transition-colors hover:bg-brand-muted hover:text-brand"
                    >
                      {child.label}
                    </CmsLink>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {/* Gold, and the only nav item that is: the shop is the one place a
              visitor can transact. */}
          <a
            href={shopHref}
            className="flex items-center gap-[7px] text-[13px] tracking-[0.04em] whitespace-nowrap text-brand transition-colors hover:text-brand-hover"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4 7h16l-1.4 12.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 7Z" />
              <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
            </svg>
            {t('shop')}
          </a>
        </nav>

        <div className="ms-auto flex items-center gap-2.5 lg:ms-0">
          <SelectionBadge />
          <LanguageSwitcher />
          <ThemeToggle />
          {/* Far right, after the site's own controls: it leaves the site. */}
          <MySpaceLink className="hidden sm:inline-flex" />
          <MobileNav
            shopHref={shopHref}
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
