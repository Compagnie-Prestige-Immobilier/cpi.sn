'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { useCart } from '@/components/cart/cart-provider'


/**
 * The plot catalogue — region filter, sort, and the card grid.
 *
 * Client-side because filtering and sorting are instant interactions on a short
 * list; a server round trip per filter click would be slower and no more
 * correct. The filter bar is sticky under the header, as in the export.
 *
 * Data comes from the `shop-items` collection, so CPI edits it in the admin.
 */
export type CataloguePlot = {
  id: number
  title: string
  place: string
  region: string
  surface: string
  tags: string[]
  price: number | null
  priceCaption: string
  image: string | null
  featured: boolean
}

export function BoutiqueCatalogue({ plots }: { plots: CataloguePlot[] }) {
  const t = useTranslations('boutique')
  const { add, has, ready } = useCart()

  // Filters come from the data, so a new region entered in the admin creates
  // its own filter without a code change.
  const regions = useMemo(
    () => [...new Set(plots.map((p) => p.region).filter(Boolean))].sort(),
    [plots],
  )
  const [region, setRegion] = useState<string | null>(null)
  const [sort, setSort] = useState('featured')

  const shown = useMemo(() => {
    const list = region ? plots.filter((p) => p.region === region) : [...plots]
    switch (sort) {
      case 'name':
        return list.sort((a, b) => a.title.localeCompare(b.title))
      case 'surface-asc':
      case 'surface-desc':
        // Every plot carries the same published range, so this orders by name
        // rather than pretending to a precision the data does not have.
        return list.sort((a, b) =>
          sort === 'surface-asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title),
        )
      default:
        return list.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
    }
  }, [plots, region, sort])

  const chip = (active: boolean) =>
    `border px-3.5 py-1.5 text-[12px] tracking-[0.06em] transition-colors ${
      active
        ? 'border-brand-border bg-brand-solid text-brand-solid-foreground'
        : 'border-subtle text-foreground-muted hover:border-brand-border hover:text-brand'
    }`

  return (
    <>
      <div
        id="catalogue"
        className="sticky top-[73px] z-30 border-y border-subtle bg-surface/95 backdrop-blur-[14px]"
      >
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-6 py-4">
          <span className="text-[11px] tracking-[0.22em] text-foreground-muted uppercase">
            {t('region')}
          </span>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setRegion(null)} className={chip(region === null)}>
              {t('regionAll')}
            </button>
            {regions.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={chip(region === r)}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="ms-auto flex items-center gap-3">
            <span className="text-[12px] text-foreground-muted">
              {t('results', { count: shown.length })}
            </span>
            <label className="sr-only" htmlFor="boutique-sort">
              {t('sortLabel')}
            </label>
            <select
              id="boutique-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              /* `[&>option]` is load-bearing: a native option inherits no
                 background, so the popup was painting cream-on-transparent and
                 the choices were unreadable in dark mode. */
              className="border border-subtle bg-surface-raised px-3 py-1.5 text-[12px] text-foreground outline-none focus:border-brand-border [&>option]:bg-surface-raised [&>option]:text-foreground"
            >
              <option value="featured">{t('sortFeatured')}</option>
              <option value="surface-asc">{t('sortSurfaceAsc')}</option>
              <option value="surface-desc">{t('sortSurfaceDesc')}</option>
              <option value="name">{t('sortName')}</option>
            </select>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-6 pt-11">
        {shown.length ? (
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
            {shown.map((p) => {
              // Shop-item ids are negated so a catalogue line can never collide
              // with a property id in the shared basket.
              const cartId = -p.id
              const inBasket = ready && has(cartId)
              const img = p.image

              return (
                <article
                  key={p.id}
                  className="flex flex-col border border-subtle bg-surface-raised"
                >
                  <div className="relative">
                    {img ? (
                      <Image
                        src={img}
                        alt={p.title}
                        width={640}
                        height={230}
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="h-[230px] w-full object-cover"
                      />
                    ) : (
                      <div className="h-[230px] w-full bg-surface-sunken" />
                    )}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(180deg,rgb(36_11_9/0)_45%,rgb(36_11_9/0.75)_100%)]"
                    />
                    {p.featured ? (
                      <span className="absolute start-3.5 top-3.5 bg-brand-solid px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-brand-solid-foreground uppercase">
                        {t('popular')}
                      </span>
                    ) : null}
                    <span className="absolute bottom-3.5 start-3.5 text-[12px] tracking-[0.1em] text-white">
                      {p.surface}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h3 className="font-heading text-[28px] leading-none font-bold text-foreground uppercase">
                      {p.title}
                    </h3>
                    <p className="flex items-center gap-2 text-[13px] text-foreground-muted">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden
                        className="shrink-0 text-brand"
                      >
                        <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
                        <circle cx="12" cy="10" r="2.4" />
                      </svg>
                      {p.place}
                    </p>
                    <div className="flex flex-wrap gap-[7px]">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border border-subtle px-2.5 py-1 text-[11px] text-foreground-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-4 border-t border-subtle pt-[18px]">
                      {/* Prices are held in the CMS but not published: every
                          plot is quoted case by case, so a figure here would be
                          a number the visitor could hold us to. */}
                      <span className="flex flex-col gap-[3px]">
                        <span className="font-heading text-2xl leading-none font-bold text-brand">
                          {t('onQuote')}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          add({
                            id: cartId,
                            slug: String(p.id),
                            title: p.title,
                            details: p.place,
                            productLine: 'foncier',
                            price: p.price,
                            kind: 'service',
                            qty: 1,
                          })
                        }
                        className={
                          inBasket
                            ? 'border border-brand-border px-4 py-2.5 text-[13px] font-semibold text-brand'
                            : 'bg-brand-solid px-4 py-2.5 text-[13px] font-semibold text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover'
                        }
                      >
                        {inBasket ? t('added') : t('add')}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="py-16 text-center text-foreground-muted">{t('noResults')}</p>
        )}
      </section>
    </>
  )
}
