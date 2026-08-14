import Image from 'next/image'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'

import { AddToBasket } from '@/components/boutique/add-to-basket'
import { Basket } from '@/components/boutique/basket'
import { Eyebrow } from '@/components/home-redesign/section-head'
import { getProperties } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import type { City, Media } from '@/payload-types'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'boutique' })
  return { title: t('title') }
}

/**
 * The Boutique.
 *
 * Land comes from the properties collection — the design lists eleven named
 * sites, but hardcoding them would go stale the first time CPI sells one, and
 * the count is already wrong. Prices come from the `price` field; anything
 * unpriced shows "Prix sur demande" and still adds to the basket, which matters
 * because most of CPI's catalogue is priced on request today.
 *
 * The services below are fixed-price products with no inventory behind them, so
 * they are defined here rather than in the CMS. If CPI starts varying them,
 * they want a collection.
 */
const SERVICES = [
  { key: 'documents', id: -101, price: 15000 },
  { key: 'advisory', id: -102, price: 50000 },
  { key: 'goodies', id: -103, price: 5000 },
] as const

export default async function BoutiquePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tHome, format, land] = await Promise.all([
    getTranslations('boutique'),
    getTranslations('home.shop'),
    getFormatter(),
    getProperties({
      locale: locale as Locale,
      productLine: 'foncier',
      availability: ['disponible', 'en-cours'],
      limit: 40,
    }),
  ])

  const money = (n: number) => `${format.number(n, { maximumFractionDigits: 0 })} FCFA`

  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-14 pb-24">
      <header className="max-w-3xl">
        <Eyebrow>{t('title')}</Eyebrow>
        <h1 className="mt-4 font-heading text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] font-bold text-foreground uppercase">
          {t('heading')}
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-foreground-muted">{t('intro')}</p>
      </header>

      <dl className="mt-10 flex gap-10 border-y border-subtle py-6">
        <div>
          <dd className="font-heading text-3xl leading-none font-bold text-brand">{land.length}</dd>
          <dt className="mt-1 text-[11px] tracking-[0.16em] text-foreground-muted uppercase">
            {t('statSites')}
          </dt>
        </div>
        <div>
          <dd className="font-heading text-3xl leading-none font-bold text-brand">150–300</dd>
          <dt className="mt-1 text-[11px] tracking-[0.16em] text-foreground-muted uppercase">
            {t('statParcel')}
          </dt>
        </div>
      </dl>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-10">
        <div>
          {/* ── Land ───────────────────────────────────────────── */}
          <h2 className="font-heading text-3xl font-bold text-foreground uppercase">
            {t('landHeading')}
          </h2>
          <div className="mt-8 grid gap-px bg-subtle sm:grid-cols-2 xl:grid-cols-3">
            {land.map((p) => {
              const media = (p.featuredImage as Media | null) ?? null
              const city = typeof p.city === 'object' ? (p.city as City | null) : null
              return (
                <article key={p.id} className="flex flex-col bg-surface p-5">
                  {media?.url ? (
                    <div className="relative mb-4 aspect-[4/3] overflow-hidden">
                      <Image
                        src={media.url}
                        alt={media.alt ?? p.title}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 40vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  {city?.name ? (
                    <p className="text-[10px] tracking-[0.22em] text-brand uppercase">{city.name}</p>
                  ) : null}
                  <h3 className="mt-1.5 font-heading text-xl leading-tight font-semibold text-foreground uppercase">
                    {p.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[13px] text-foreground-muted">
                    {p.plotSize ? `${p.plotSize} m²` : null}
                  </p>
                  <p className="mt-4 text-[15px] font-semibold text-brand">
                    {p.price ? money(p.price) : t('onRequest')}
                  </p>
                  <div className="mt-4">
                    <AddToBasket
                      item={{
                        id: p.id,
                        slug: p.slug,
                        title: p.title,
                        details: city?.name ?? '',
                        productLine: 'foncier',
                        price: p.price ?? null,
                        kind: 'property',
                        qty: 1,
                      }}
                    />
                  </div>
                </article>
              )
            })}
          </div>

          {/* ── Documents & services ───────────────────────────── */}
          <div className="mt-16">
            <Eyebrow>{t('servicesEyebrow')}</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground uppercase">
              {t('servicesHeading')}
            </h2>
            <p className="mt-4 max-w-2xl text-[14px] text-foreground-muted">{t('servicesIntro')}</p>

            <div className="mt-8 grid gap-px bg-subtle sm:grid-cols-3">
              {SERVICES.map((s) => (
                <article key={s.key} className="flex flex-col bg-surface p-6">
                  <h3 className="font-heading text-xl font-semibold text-foreground uppercase">
                    {tHome(`items.${s.key}.title`)}
                  </h3>
                  <p className="mt-3 flex-1 text-[13px] leading-relaxed text-foreground-muted">
                    {tHome(`items.${s.key}.body`)}
                  </p>
                  <p className="mt-4 text-[15px] font-semibold text-brand">
                    {tHome('from', { price: money(s.price) })}
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
          </div>

          {/* ── Trust strip. The payment line is rewritten: nothing here
                 charges a card, so it must not claim to. ─────────────── */}
          <div className="mt-16 grid gap-px border border-subtle bg-subtle sm:grid-cols-3">
            {(['legal', 'pay', 'hold'] as const).map((k) => (
              <div key={k} className="bg-surface p-6">
                <h3 className="font-heading text-lg font-semibold text-brand uppercase">
                  {t(`trust.${k}Title`)}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-foreground-muted">
                  {t(`trust.${k}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Basket ───────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <h2 className="mb-4 font-heading text-2xl font-bold text-foreground uppercase">
            {t('cart.title')}
          </h2>
          <Basket />
        </aside>
      </div>
    </div>
  )
}
