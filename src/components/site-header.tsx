import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { Link, getPathname } from '@/i18n/routing'
import { CmsLink } from '@/components/ui/cms-link'
import { MySpaceLink } from '@/components/my-space-link'
import { SelectionBadge } from '@/components/cart/selection-badge'
import { MobileNav } from '@/components/mobile-nav'
import { HeaderTopBar } from '@/components/header/top-bar'
import { getNavigation, getProperties } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

/**
 * Site header — utility strip, then logo + mega-menu.
 *
 * The dropdowns are multi-column panels, which the `navigation` global cannot
 * express on its own (it is two levels, no group headings). So the menu is
 * assembled from two sources:
 *
 *   - editorial items and their children come from the global, as before;
 *   - the Terrains panel is generated from the land actually for sale, because
 *     the design lists eleven named sites and hardcoding them would go stale
 *     the first time CPI sells one.
 *
 * Hover *and* focus-within opens a panel, so the menu is reachable by keyboard
 * rather than mouse-only as in the export.
 */
export async function SiteHeader() {
  const locale = (await getLocale()) as Locale
  const [t, nav, land] = await Promise.all([
    getTranslations('nav'),
    getNavigation(locale),
    getProperties({
      locale,
      productLine: 'foncier',
      availability: ['disponible', 'en-cours'],
      limit: 14,
    }),
  ])

  const items = nav.header ?? []
  const homePath = getPathname({ locale, href: '/' })
  const shopHref = `${homePath}#shop`
  const boutiquePath = getPathname({ locale, href: '/boutique' })
  const landPath = getPathname({ locale, href: '/terrains' })

  /**
   * The land menu hangs off the navigation item CPI already has — it is not a
   * second entry. Rendering our own alongside the global's put "Terrains
   * disponibles" in the bar twice.
   */
  const isLandItem = (href?: string | null) =>
    Boolean(href && (href === landPath || href.replace(/\/$/, '').endsWith('/terrains')))

  const linkClass =
    'block px-3 py-1.5 text-[14px] text-foreground-muted transition-colors hover:text-brand'

  return (
    <header className="sticky top-0 z-40 border-b border-subtle bg-surface/[0.92] backdrop-blur-[14px]">
      <HeaderTopBar />

      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label="CPI">
          {/* Two files, not a CSS filter: inverting the logo mangles its colour. */}
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

        <nav
          className="ms-auto hidden items-center lg:flex"
          aria-label={t('home')}
        >
          {items.map((item) => (
            <div key={item.id ?? item.label} className="group relative flex items-center">
              <CmsLink
                href={item.href}
                className="flex items-center gap-1.5 px-2.5 py-2 text-[11.5px] tracking-[0.06em] whitespace-nowrap text-foreground-muted transition-colors hover:text-brand"
              >
                {item.label}
                {item.children?.length || (isLandItem(item.href) && land.length) ? <Chevron /> : null}
              </CmsLink>

              {isLandItem(item.href) && land.length ? (
                <Panel>
                  <p className="px-3 pb-2 text-[10px] tracking-[0.22em] text-brand uppercase">
                    {t('landCount', { count: land.length })}
                  </p>
                  {/* Fixed width and single-line entries: CPI's titles run to
                      "Projet de lotissement Yenne – Benteigner", which wrapped
                      across five lines and collided with the next column. */}
                  <div className="grid w-[560px] grid-cols-2 gap-x-4">
                    {land.map((p) => (
                      /* Dynamic routes need the object form so next-intl can
                         resolve the localized segment (/terrains ↔ /en/land). */
                      <Link
                        key={p.id}
                        href={{ pathname: '/terrains/[slug]', params: { slug: p.slug ?? '' } }}
                        title={p.title}
                        className={`${linkClass} truncate`}
                      >
                        {p.title}
                      </Link>
                    ))}
                  </div>
                  <a
                    href={shopHref}
                    className="mt-2 block border-t border-subtle px-3 pt-3 text-[13px] font-semibold text-brand transition-colors hover:text-brand-hover"
                  >
                    {t('allLandInShop')} →
                  </a>
                </Panel>
              ) : item.children?.length ? (
                <Panel>
                  <div className="min-w-[240px]">
                    {item.children.map((child) => (
                      <CmsLink key={child.id ?? child.label} href={child.href} className={linkClass}>
                        {child.label}
                      </CmsLink>
                    ))}
                  </div>
                </Panel>
              ) : null}
            </div>
          ))}

          {/* Boutique — gold, and the only nav item with its own panel: the
              designer's seven-item shop menu. */}
          <div className="group relative flex items-center">
            <a
              href={boutiquePath}
              className="flex items-center gap-[7px] px-2.5 py-2 text-[11.5px] tracking-[0.06em] whitespace-nowrap text-brand transition-colors hover:text-brand-hover"
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
              <Chevron />
            </a>
            <Panel>
              <div className="min-w-[240px]">
                <a href={boutiquePath} className={linkClass}>
                  {t('shopBuy')}
                </a>
                <a href={`${boutiquePath}#catalogue`} className={linkClass}>
                  {t('shopLand')}
                </a>
                <a href={`${boutiquePath}#services`} className={linkClass}>
                  {t('shopDocs')}
                </a>
                <a href={`${boutiquePath}#services`} className={linkClass}>
                  {t('shopAdvisory')}
                </a>
                <a
                  href="https://monespace.cpi.sn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {t('shopInstalment')}
                </a>
                <a href={`${boutiquePath}#services`} className={linkClass}>
                  {t('shopGoodies')}
                </a>
                <Link href="/ma-selection" className={`${linkClass} border-t border-subtle mt-1 pt-2.5 text-brand`}>
                  {t('shopBasket')}
                </Link>
              </div>
            </Panel>
          </div>
        </nav>

        <div className="ms-auto flex items-center gap-2.5 lg:ms-0">
          <SelectionBadge />
          <MySpaceLink className="hidden sm:inline-flex" />
          <MobileNav
            shopHref={shopHref}
            items={items.map((i) => ({
              label: i.label ?? '',
              href: i.href ?? null,
              children: (i.children ?? []).map((c) => ({
                label: c.label ?? '',
                href: c.href ?? null,
              })),
            }))}
          />
        </div>
      </div>
    </header>
  )
}

function Chevron() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="transition-transform group-hover:rotate-180"
    >
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  )
}

/** The dropdown surface. `pt-2` keeps a hover bridge to the trigger. */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="invisible absolute start-0 top-full z-20 pt-2 opacity-0 transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
      <div className="border border-subtle bg-surface-raised p-4 shadow-2xl">{children}</div>
    </div>
  )
}
