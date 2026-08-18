import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AddToBasket } from '@/components/boutique/add-to-basket'
import { Basket } from '@/components/boutique/basket'
import { BoutiqueCatalogue, type CataloguePlot } from '@/components/boutique/catalogue'
import { getShopItems } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import type { Media } from '@/payload-types'
import { localeAlternates } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'boutique' })
  return { title: t('title'), alternates: localeAlternates(locale as Locale, '/boutique') }
}

/**
 * The Boutique, laid out as the designer drew it: full-bleed hero with three
 * figures, a sticky region/sort bar, the plot grid, then documents and
 * services, the trust strip and the basket.
 *
 * Everything on sale comes from the `shop-items` collection — names, photos,
 * regions, prices and captions are all editable in the admin. It started as a
 * hardcoded list to match his page exactly; `npm run seed:shop` is what moved
 * it into the CMS.
 *
 * Nothing here charges a card. See `basket.tsx` for why the checkout submits a
 * priced quote request instead.
 */

export default async function BoutiquePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, items] = await Promise.all([
    getTranslations('boutique'),
    getShopItems(locale as Locale),
  ])

  const mediaUrl = (v: unknown) =>
    typeof v === 'object' && v !== null && 'url' in v ? ((v as Media).url ?? null) : null

  const plots: CataloguePlot[] = items
    .filter((i) => i.kind === 'terrain')
    .map((i) => ({
      id: i.id,
      title: i.title,
      place: i.place ?? '',
      region: i.region ?? '',
      surface: i.surface ?? '',
      tags: (i.tags ?? []).map((t) => t.label).filter(Boolean),
      price: i.price ?? null,
      priceCaption: i.priceCaption ?? '',
      image: mediaUrl(i.image),
      featured: Boolean(i.featured),
    }))

  const services = items.filter((i) => i.kind === 'service')
  const heroImage = plots.find((p) => p.image)?.image ?? null

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-subtle">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(44_0_6/0.72)_0%,rgb(44_0_6/0.86)_60%,rgb(44_0_6/0.96)_100%)]"
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
                { v: String(plots.length), l: t('statSites') },
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
      <BoutiqueCatalogue plots={plots} />

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
            {t('onQuoteHint')}
          </p>
        </div>

        <div className="mt-10 grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {services.map((s) => (
            <article key={s.id} className="flex flex-col border border-subtle bg-surface-raised p-6">
              <h3 className="font-heading text-xl font-semibold text-foreground uppercase">
                {s.title}
              </h3>
              {s.description ? (
                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-foreground-muted">
                  {s.description}
                </p>
              ) : (
                <span className="flex-1" />
              )}
              <p className="mt-5 font-heading text-2xl leading-none font-bold text-brand">
                {t('onQuote')}
              </p>
              <div className="mt-4">
                {s.action === 'portal' ? (
                  <a
                    href="https://monespace.cpi.sn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full border border-brand-border px-4 py-2.5 text-center text-[13px] font-semibold text-brand transition-colors hover:bg-brand-muted"
                  >
                    {t('cart.checkout')}
                  </a>
                ) : (
                  <AddToBasket
                    item={{
                      id: -s.id,
                      slug: String(s.id),
                      title: s.title,
                      details: '',
                      productLine: 'foncier',
                      price: s.price ?? null,
                      kind: 'service',
                      qty: 1,
                    }}
                  />
                )}
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
