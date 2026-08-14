import { getTranslations } from 'next-intl/server'
import { ContactForm } from '@/components/forms/contact-form'
import { getSiteSettings } from '@/lib/payload'
import { getLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/locales'
import { Eyebrow } from './section-head'

/**
 * Closing contact block.
 *
 * Phone numbers and the address come from `site-settings`, never hardcoded —
 * they are the details most likely to change, and CPI has to be able to change
 * them without a deploy.
 */
export async function ContactSection() {
  const locale = (await getLocale()) as Locale
  const [t, settings] = await Promise.all([getTranslations('home.contact'), getSiteSettings(locale)])

  // `phones` is a repeater on the global, not two fixed fields — CPI adds and
  // removes numbers themselves.
  const phones = (settings.phones ?? []).map((p) => p.number).filter(Boolean)

  return (
    <section id="s9" className="mt-[110px] bg-surface-sunken">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-[110px] lg:grid-cols-2 lg:gap-20">
        <div>
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h2 className="mt-4 font-heading text-[clamp(2.25rem,4vw,3.5rem)] leading-[0.95] font-bold text-foreground uppercase">
            {t('title')}
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-foreground-muted">
            {t('body')}
          </p>

          <ul className="mt-10 space-y-3 border-t border-subtle pt-8">
            {phones.map((phone) => (
              <li key={phone}>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="font-heading text-3xl font-semibold text-foreground transition-colors hover:text-brand"
                >
                  {phone}
                </a>
              </li>
            ))}
            {settings.email ? (
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-[15px] text-foreground-muted transition-colors hover:text-brand"
                >
                  {settings.email}
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <ContactForm subject="home:s9-contact" />
        </div>
      </div>
    </section>
  )
}
