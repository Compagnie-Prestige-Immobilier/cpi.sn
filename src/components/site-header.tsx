import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/routing'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'

/**
 * Header shell for phase 1.
 *
 * The navigation tree is intentionally flat here: the old WordPress menu nested
 * four levels deep ("PROJETS → PROJETS RÉALISÉS → PROGRAMMES FONCIERS"), where
 * every leaf was just a filter over the same collection. Filters belong on the
 * listing page, not in the menu — see plan.md §5.
 *
 * Becomes CMS-driven from the `navigation` global in phase 2.
 */
export async function SiteHeader() {
  const t = await getTranslations('nav')

  const links = [
    { href: '/a-propos', label: t('about') },
    { href: '/programmes', label: t('developments') },
    { href: '/terrains', label: t('land') },
    { href: '/nos-services', label: t('services') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ] as const

  return (
    <header className="sticky top-0 z-40 border-b border-subtle bg-surface/85 backdrop-blur-md">
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="CPI">
          {/*
            Two files rather than a CSS filter: the burgundy logo cannot be
            inverted for dark mode (it turns cyan). See CLAUDE.md → Theming 9.
          */}
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

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[0.8125rem] font-medium tracking-[0.08em] text-foreground-muted uppercase transition-colors hover:text-brand"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
