import Image from 'next/image'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'

import { AddToBasket } from '@/components/boutique/add-to-basket'
import { Basket } from '@/components/boutique/basket'
import { BoutiqueCatalogue } from '@/components/boutique/catalogue'
import { PLOTS } from '@/components/boutique/plots'
import { getProperties } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'boutique' })
  return { title: t('title') }
}

/**
 * The Boutique, laid out as the designer drew it: full-bleed hero with three
 * figures, a sticky region/sort bar, the plot grid, then documents and
 * services, the trust strip and the basket.
 *
 * The plot list is hardcoded (`plots.ts`) at the client's request — his export
 * drives this grid from a placeholder loop, and matching the page he signed off
 * mattered more than sourcing it from Payload. Photographs are still resolved
 * from the media library so the imagery stays in step with CPI's uploads.
 *
 * Nothing here charges a card. See `basket.tsx` for why the checkout submits a
 * priced quote request instead.
 */
const SERVICES = [
  { key: 'documents', id: -101, price: 15000 },
  { key: 'advisory', id: -102, price: 50000 },
  { key: 'goodies', id: -103, price: 5000 },
] as const

export default async function BoutiquePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tHome, format, everything] = await Promise.all([
    getTranslations('boutique'),
    getTranslations('home.shop'),
    getFormatter(),
    getProperties({ locale: locale as Locale, limit: 60 }),
  ])

  const money = (n: number) => `${format.number(n, { maximumFractionDigits: 0 })} FCFA`

  /**
   * Resolve each plot's photograph.
   *
   * The named hint wins. The fallback pool is gallery PHOTOGRAPHS only — a
   * featured image is a marketing banner with the site name burned across it,
   * and the first pass put "NDAYANE — Le luxe au Cœur…" on the Noflaye and
   * Kounoune cards. Each image is claimed once so no two cards match either.
   */
  const featuredUrls = new Set(
    everything
      .map((p) => (typeof p.featuredImage === 'object' ? p.featuredImage?.url : null))
      .filter(Boolean) as string[],
  )
  const photos: Media[] = everything
    .flatMap((p) => (p.gallery ?? []).filter((m): m is Media => typeof m === 'object' && Boolean(m?.url)))
    .filter((m) => !featuredUrls.has(m.url as string))

  const claimed = new Set<string>()
  const images: Record<string, string | null> = {}
  for (const plot of PLOTS) {
    const hit = plot.imageHint
      ? photos.find(
          (m) =>
            (m.filename ?? '').toLowerCase().includes(plot.imageHint!) &&
            !claimed.has(m.url as string),
        )
      : undefined
    const pick = hit ?? photos.find((m) => !claimed.has(m.url as string))
    if (pick?.url) claimed.add(pick.url)
    images[plot.slug] = pick?.url ?? null
  }

  const allMedia: Media[] = everything.flatMap((p) => [
    ...((p.gallery ?? []).filter((m): m is Media => typeof m === 'object' && Boolean(m?.url))),
    ...(typeof p.featuredImage === 'object' && p.featuredImage?.url ? [p.featuredImage as Media] : []),
  ])

  const heroImage = allMedia.find((m) => (m.filename ?? '').includes('capture-decran-2025-11-05'))

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-subtle">
        {heroImage?.url ? (
          <Image
            src={heroImage.url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(26_15_14/0.72)_0%,rgb(26_15_14/0.86)_60%,rgb(26_15_14/0.96)_100%)]"
        />
        <div className="relative mx-auto max-w-[1400px] px-6 py-[92px]">
          <div className="mb-[22px] flex items-center gap-3.5">
            <span aria-hidden className="h-px w-[46px] bg-[var(--accent-on-dark)]" />
            <span className="text-[11px] tracking-[0.34em] text-[var(--accent-on-dark)] uppercase">
              {t('title')}
            </span>
          </div>
          <h1 className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-extrabold text-white uppercase">
            {t('heading')}
          </h1>
          <p className="mt-[22px] max-w-[60ch] text-[17px] leading-relaxed text-white/80">
            {t('heroIntro')}
          </p>

          <dl className="mt-[38px] flex flex-wrap gap-7">
            {(
              [
                { v: String(PLOTS.length), l: t('statSites') },
                { v: '150–300', l: t('statParcel') },
                { v: t('statInstalmentValue'), l: t('statInstalment') },
              ] as const
            ).map((s) => (
              <div key={s.l} className="flex flex-col gap-1">
                <dd className="font-heading text-[38px] leading-none font-bold text-[var(--accent-on-dark)]">
                  {s.v}
                </dd>
                <dt className="text-[11px] tracking-[0.16em] text-white/60 uppercase">{s.l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Sticky filter bar + plot grid ────────────────────────── */}
      <BoutiqueCatalogue plots={PLOTS} images={images} />

      {/* ── Documents & services ─────────────────────────────────── */}
      <section id="services" className="mx-auto max-w-[1400px] px-6 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-subtle pb-6">
          <div>
            <span className="text-[11px] tracking-[0.34em] text-brand uppercase">
              {t('servicesEyebrow')}
            </span>
            <h2 className="mt-3 font-heading text-[clamp(2rem,4vw,3rem)] leading-[0.95] font-bold text-foreground uppercase">
              {t('servicesHeading')}
            </h2>
          </div>
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-foreground-muted">
            {t('servicesNote')}
          </p>
        </div>

        <div className="mt-10 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {SERVICES.map((s) => (
            <article key={s.key} className="flex flex-col border border-subtle bg-surface-raised p-6">
              <h3 className="font-heading text-xl font-semibold text-foreground uppercase">
                {tHome(`items.${s.key}.title`)}
              </h3>
              <p className="mt-3 flex-1 text-[13px] leading-relaxed text-foreground-muted">
                {tHome(`items.${s.key}.body`)}
              </p>
              <p className="mt-5 font-heading text-2xl leading-none font-bold text-brand">
                {money(s.price)}
              </p>
              <div className="mt-4">
                <AddToBasket
                  item={{
                    id: s.id,
                    slug: s.key,
                    title: tHome(`items.${s.key}.title`),
                    details: '',
                    productLine: 'foncier',
                    price: s.price,
                    kind: 'service',
                    qty: 1,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Trust strip. His copy promised instant card payment; ours
             describes what actually happens. ────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 pt-24">
        <div className="grid gap-px border border-subtle bg-subtle sm:grid-cols-3">
          {(['legal', 'pay', 'hold'] as const).map((k) => (
            <div key={k} className="bg-surface-raised p-7">
              <h3 className="font-heading text-lg font-semibold text-brand uppercase">
                {t(`trust.${k}Title`)}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground-muted">
                {t(`trust.${k}Body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Basket ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 pt-24 pb-24">
        <h2 className="mb-6 font-heading text-[clamp(2rem,4vw,3rem)] leading-[0.95] font-bold text-foreground uppercase">
          {t('cart.title')}
        </h2>
        <div className="max-w-2xl">
          <Basket />
        </div>
      </section>
    </>
  )
}
