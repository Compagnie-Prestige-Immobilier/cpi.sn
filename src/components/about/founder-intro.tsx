import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'

import { RichText } from '@/components/rich-text'
import { getHomePage } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import type { Media } from '@/payload-types'

/**
 * The Administratrice Générale, introduced immediately after the À propos hero.
 *
 * Reads the `founder` group on the `home-page` global rather than duplicating
 * her details into a second place — the same record already drives the
 * homepage, so a correction in the admin lands on both.
 *
 * Renders nothing without a name. A titled block with an empty body would be
 * worse than its absence, and the whole section is editorial: if CPI clears the
 * field, the page should simply close over the gap.
 *
 * The portrait is a real photograph CPI supplied. There is deliberately no
 * silhouette fallback here — a placeholder face beside a named, quoted person
 * misattributes her, which on a trust-driven page is the one failure worth
 * avoiding outright. Without a portrait the text runs full width instead.
 */
export async function FounderIntro() {
  const locale = (await getLocale()) as Locale
  const [t, home] = await Promise.all([getTranslations('about'), getHomePage(locale)])

  const founder = home.founder
  if (!founder?.name) return null

  const portrait = (founder.portrait as Media | null) ?? null
  const highlights = (founder.highlights ?? []).filter((h) => h.year || h.text)

  return (
    <section className="border-b border-subtle bg-surface">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:py-24">
        <div
          className={
            portrait?.url
              ? 'grid items-start gap-10 lg:grid-cols-[minmax(0,30rem)_1fr] lg:gap-14'
              : 'max-w-3xl'
          }
        >
          {/* 4:3 rather than a portrait frame: CPI's photograph is 16:9, and
              forcing it into a tall crop cut the top of her head and threw away
              the composition. This keeps her face and her steepled hands. */}
          {portrait?.url ? (
            <figure className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={portrait.url}
                alt={portrait.alt ?? founder.name}
                fill
                sizes="(min-width: 1024px) 30rem, 100vw"
                className="object-cover object-center"
              />
            </figure>
          ) : null}

          <div>
            <p className="text-[11px] tracking-[0.28em] text-brand uppercase">{t('founder')}</p>
            <h2 className="mt-4 font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[0.95] font-bold text-foreground uppercase">
              {founder.name}
            </h2>
            {founder.role ? (
              <p className="mt-3 text-[15px] text-foreground-muted">{founder.role}</p>
            ) : null}

            {founder.bio ? (
              <RichText
                data={founder.bio}
                className="mt-7 max-w-2xl text-[15px] leading-relaxed text-foreground-muted"
              />
            ) : null}

            {highlights.length ? (
              <dl className="mt-9 grid gap-px border border-subtle bg-subtle sm:grid-cols-2">
                {highlights.map((h, i) => (
                  <div key={h.id ?? i} className="bg-surface p-5">
                    {h.year ? (
                      <dt className="font-heading text-2xl leading-none font-bold text-brand tabular-nums">
                        {h.year}
                      </dt>
                    ) : null}
                    {h.text ? (
                      <dd className="mt-2 text-[13px] leading-relaxed text-foreground-muted">
                        {h.text}
                      </dd>
                    ) : null}
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
