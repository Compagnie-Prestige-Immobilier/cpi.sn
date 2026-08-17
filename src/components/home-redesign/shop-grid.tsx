import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Eyebrow } from './section-head'

/**
 * The Boutique.
 *
 * IMPORTANT — this is a shopfront, not a checkout. Nothing here takes money:
 * every action opens the enquiry form, or the client portal for the two items
 * that belong to an existing customer. The design's original strapline promised
 * "paiement sécurisé par carte, Wave ou Orange Money — reçu délivré
 * immédiatement"; that copy is deliberately not reproduced, because a page
 * advertising instant card payment that processes none is a complaint at best
 * and reads as fraud at worst.
 *
 * Prices are shown as indicative ("dès X"), which is true and useful. When a
 * real gateway is chosen (PayDunya and CinetPay both cover Wave + Orange Money
 * + card in Senegal) this is where it lands: an orders collection, webhooks,
 * and a refund path for the reservation's cooling-off promise.
 */
const ITEMS = [
  { key: 'plot', popular: true, href: '/contact' },
  { key: 'documents', popular: false, href: '/contact' },
  { key: 'advisory', popular: false, href: '/contact' },
  { key: 'instalment', popular: false, portal: true },
  { key: 'account', popular: false, portal: true },
] as const

export async function ShopGrid() {
  const [t, tShop] = await Promise.all([
    getTranslations('home.shop'),
    getTranslations('boutique'),
  ])

  return (
    <section id="shop" className="mx-auto max-w-[1400px] px-6 pt-[110px]">
      <div className="max-w-3xl">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <h2 className="mt-4 font-heading text-[clamp(2.25rem,4vw,3.5rem)] leading-[0.95] font-bold text-foreground uppercase">
          {t('title')}
        </h2>
        <p className="mt-5 text-[15px] leading-relaxed text-foreground-muted">
          {tShop('onQuoteHint')}
        </p>
      </div>

      <div className="mt-14 grid gap-px bg-subtle sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item) => {
          const label = t(`items.${item.key}.cta`)

          return (
            <article key={item.key} className="flex flex-col bg-surface p-8">
              {item.popular ? (
                <p className="mb-4 w-max bg-brand-solid px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-brand-solid-foreground uppercase">
                  {t('popular')}
                </p>
              ) : null}
              <h3 className="font-heading text-2xl font-semibold text-foreground uppercase">
                {t(`items.${item.key}.title`)}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground-muted">
                {t(`items.${item.key}.body`)}
              </p>

              <div className="mt-7 flex items-center justify-between gap-4 border-t border-subtle pt-5">
                {/* "Sur devis", matching the Boutique. A figure here and a
                    quote there, two clicks apart, reads as a bait price. */}
                <p className="text-[13px] font-semibold text-brand">{tShop('onQuote')}</p>
                {'portal' in item && item.portal ? (
                  <a
                    href="https://monespace.cpi.sn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className="text-[13px] font-semibold text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
                  >
                    {label}
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
