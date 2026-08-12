import type { ReactNode } from 'react'
import { Link, pathnames } from '@/i18n/routing'

/**
 * Static (parameterless) route keys. Dynamic ones like `/terrains/[slug]`
 * cannot be built from a bare href — they need params — and an editor would
 * never type a literal `[slug]` anyway, so they are excluded from resolution.
 */
type StaticPathname = {
  [K in keyof typeof pathnames]: K extends `${string}[${string}` ? never : K
}[keyof typeof pathnames]

const STATIC_ENTRIES = Object.entries(pathnames).filter(
  ([key]) => !key.includes('['),
) as [StaticPathname, string | Record<string, string>][]

/**
 * Resolve a raw href stored in the CMS to a typed, locale-aware route.
 *
 * Editors type French paths (`/terrains`) because that is what the site looks
 * like to them. Rendering those as a plain <a> would send an English visitor to
 * the French URL and drop the locale, so we map the stored path back to its
 * internal pathname key and let next-intl emit `/en/land`.
 *
 * Returns null for anything not in the routing map — external links, `mailto:`,
 * `tel:` — which the caller renders as a plain anchor.
 */
export function resolveInternal(href: string): StaticPathname | null {
  if (!href || !href.startsWith('/')) return null
  const clean = href.replace(/\/+$/, '') || '/'

  for (const [key, value] of STATIC_ENTRIES) {
    if (typeof value === 'string') {
      if (value === clean) return key
    } else if (Object.values(value).includes(clean)) {
      return key
    }
  }
  return null
}

export function CmsLink({
  href,
  children,
  className,
}: {
  href?: string | null
  children: ReactNode
  className?: string
}) {
  if (!href) return <span className={className}>{children}</span>

  const internal = resolveInternal(href)
  if (internal) {
    return (
      <Link href={internal} className={className}>
        {children}
      </Link>
    )
  }

  const external = /^https?:\/\//i.test(href)
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
    >
      {children}
    </a>
  )
}
