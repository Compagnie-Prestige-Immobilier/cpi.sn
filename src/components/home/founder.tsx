import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { RichText } from '@/components/rich-text'
import { Reveal } from '@/components/ui/reveal'
import { ButtonLink } from '@/components/ui/button-link'
import type { HomePage, Media } from '@/payload-types'

/**
 * The founder.
 *
 * On a site selling land in Senegal, where buyers are rightly wary about title,
 * "our founder won a Supreme Court case about administrative overreach and
 * spent a career in economic regulation" is the single strongest thing CPI can
 * say. The old site buried it below the fold on the homepage and repeated it on
 * À propos; here it gets a section of its own.
 */
export async function Founder({ founder }: { founder: HomePage['founder'] }) {
  const t = await getTranslations('placeholder')
  const tCommon = await getTranslations('common')

  if (!founder?.name) return null

  const portrait = founder.portrait as Media | null

  return (
    <section className="bg-surface-sunken py-20 lg:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-[20rem_1fr] lg:gap-16">
        <Reveal direction="right">
          <figure>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-raised">
              {portrait?.url ? (
                <Image
                  src={portrait.url}
                  alt={portrait.alt ?? founder.name}
                  fill
                  sizes="20rem"
                  className="object-cover"
                />
              ) : (
                /*
                 * Deliberately a marked placeholder, not a stock portrait. The
                 * legacy media library contains a `founder.jpg` that is Houzez
                 * theme filler showing an entirely different person — putting a
                 * stranger's face under a named individual is a misattribution,
                 * not a design shortcut.
                 */
                <div className="absolute inset-0 grid place-items-center bg-brand-muted">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="size-24 text-brand/40"
                    aria-hidden
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
            {!portrait?.url ? (
              <figcaption className="mt-3 text-xs text-foreground-muted">
                {t('notice')}
              </figcaption>
            ) : null}
          </figure>
        </Reveal>

        <Reveal>
          <p className="text-xs font-medium tracking-[0.22em] text-accent uppercase">
            {founder.role}
          </p>
          <h2 className="mt-4 font-heading text-4xl leading-tight text-foreground lg:text-5xl">
            {founder.name}
          </h2>

          {founder.highlights?.length ? (
            <ul className="mt-8 space-y-3">
              {founder.highlights.map((h) => (
                <li key={h.id ?? h.year} className="flex gap-4">
                  <span className="w-14 shrink-0 pt-0.5 text-sm font-medium text-brand tabular-nums">
                    {h.year}
                  </span>
                  <span className="text-foreground-muted">{h.text}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <RichText data={founder.bio} className="mt-8 max-w-2xl" />

          <ButtonLink href="/a-propos" variant="outline" className="mt-9">
            {tCommon('readMore')}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  )
}
