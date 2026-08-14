/**
 * Shared section furniture for the redesigned homepage.
 *
 * The design repeats one rhythm: a small gold eyebrow in letterspaced caps, a
 * large condensed heading, then an optional muted subtitle. Keeping it in one
 * place is what stops the nine sections drifting apart as they get edited.
 */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] tracking-[0.28em] text-brand uppercase">{children}</p>
  )
}

export function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="max-w-3xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-heading text-[clamp(2.25rem,4vw,3.5rem)] leading-[0.95] font-bold text-foreground uppercase">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-5 text-[15px] leading-relaxed text-foreground-muted">{subtitle}</p>
      ) : null}
    </div>
  )
}
