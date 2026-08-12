import { Reveal } from './reveal'

/**
 * Ombara's `accent-text` / `section-title` / `section-subtitle` trio.
 *
 * The template rendered the eyebrow in Allura script and gold. Here it is
 * small-caps burgundy: the script face reads as a wedding invitation on a
 * property developer's site, and gold is not part of CPI's palette.
 * `text-accent` resolves per theme, so this stays legible on both grounds.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  onDark = false,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'start'
  onDark?: boolean
}) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-start items-start'

  return (
    <Reveal className={`flex flex-col ${alignment}`}>
      {eyebrow ? (
        <span
          className={`text-xs font-medium tracking-[0.22em] uppercase ${
            onDark ? 'text-accent-on-dark' : 'text-accent'
          }`}
        >
          {eyebrow}
        </span>
      ) : null}

      <h2
        className={`mt-4 max-w-3xl font-heading text-4xl leading-[1.1] lg:text-5xl ${
          onDark ? 'text-white' : 'text-foreground'
        }`}
      >
        {title}
      </h2>

      {subtitle ? (
        <p
          className={`mt-4 max-w-xl text-base ${
            onDark ? 'text-white/70' : 'text-foreground-muted'
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  )
}
