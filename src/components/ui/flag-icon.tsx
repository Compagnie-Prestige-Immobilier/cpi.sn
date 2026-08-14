/**
 * Flag glyphs for the language switcher.
 *
 * Inline SVG rather than emoji, which was the explicit request — and which is
 * also the only thing that works: Windows ships no colour flag glyphs, so 🇫🇷
 * renders as the letters "FR" in a box on a large share of visitors' machines.
 *
 * Keyed by ISO 3166 region from the locale registry. A locale with no `flag`
 * (or one whose region has no glyph here yet) falls back to a lettered badge,
 * so adding Wolof stays a registry change rather than a code change — it just
 * shows "WO" until someone draws a flag for it.
 */
const FLAGS: Record<string, React.ReactNode> = {
  FR: (
    <>
      <rect width="9" height="18" x="0" fill="#002654" />
      <rect width="9" height="18" x="9" fill="#fff" />
      <rect width="9" height="18" x="18" fill="#ce1126" />
    </>
  ),
  GB: (
    <>
      <rect width="27" height="18" fill="#012169" />
      <path d="M0 0l27 18M27 0L0 18" stroke="#fff" strokeWidth="3.6" />
      <path d="M0 0l27 18M27 0L0 18" stroke="#c8102e" strokeWidth="2.4" />
      <path d="M13.5 0v18M0 9h27" stroke="#fff" strokeWidth="6" />
      <path d="M13.5 0v18M0 9h27" stroke="#c8102e" strokeWidth="3.6" />
    </>
  ),
  SN: (
    <>
      <rect width="9" height="18" x="0" fill="#00853f" />
      <rect width="9" height="18" x="9" fill="#fdef42" />
      <rect width="9" height="18" x="18" fill="#e31b23" />
      <path
        d="M13.5 6.4l.85 2.6h2.74l-2.22 1.62.85 2.6-2.22-1.61-2.22 1.61.85-2.6L9.91 9h2.74z"
        fill="#00853f"
      />
    </>
  ),
}

export function FlagIcon({
  region,
  code,
  className = '',
}: {
  region?: string
  code: string
  className?: string
}) {
  const glyph = region ? FLAGS[region] : undefined

  if (!glyph) {
    return (
      <span
        aria-hidden
        className={`inline-flex h-[13px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border border-subtle bg-surface-sunken text-[8px] leading-none font-semibold tracking-tight text-foreground-muted uppercase ${className}`}
      >
        {code.slice(0, 2)}
      </span>
    )
  }

  return (
    <svg
      viewBox="0 0 27 18"
      aria-hidden
      className={`h-[13px] w-[18px] shrink-0 rounded-[2px] ring-1 ring-black/10 ${className}`}
    >
      {glyph}
    </svg>
  )
}
