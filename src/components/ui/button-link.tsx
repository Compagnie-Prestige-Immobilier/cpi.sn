import type { ComponentProps, ReactNode } from 'react'
import { Link } from '@/i18n/routing'

/**
 * Link styled as a button.
 *
 * `tone` exists because the hero sits on a dark ground in every state — a photo
 * with a scrim, or the burgundy fallback. The default burgundy fill measures
 * 1.14:1 against that ground: effectively invisible. On-dark surfaces get a
 * white fill instead (15.4:1), with burgundy text (13.5:1).
 *
 * Never use `tone="default"` over the hero, and never hand-roll a hero button.
 */
type Variant = 'solid' | 'outline'
type Tone = 'default' | 'onDark'

const STYLES: Record<Tone, Record<Variant, string>> = {
  default: {
    solid:
      'bg-brand-solid text-brand-solid-foreground hover:bg-brand-solid-hover',
    outline: 'border border-brand-border text-brand hover:bg-brand-muted',
  },
  onDark: {
    solid: 'bg-white text-[var(--burgundy-800)] hover:bg-white/90',
    outline: 'border border-white/45 text-white hover:bg-white/10',
  },
}

export function ButtonLink({
  href,
  children,
  variant = 'solid',
  tone = 'default',
  className = '',
}: {
  href: ComponentProps<typeof Link>['href']
  children: ReactNode
  variant?: Variant
  tone?: Tone
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-7 py-3 text-sm font-medium transition-colors ${STYLES[tone][variant]} ${className}`}
    >
      {children}
    </Link>
  )
}
