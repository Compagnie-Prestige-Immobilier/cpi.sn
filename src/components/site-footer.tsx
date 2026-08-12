import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'

/**
 * Footer shell for phase 1. Contact details and socials move to the
 * `site-settings` Payload global in phase 2 — CPI will change the phone number.
 */
export async function SiteFooter() {
  const [t, tSite] = await Promise.all([
    getTranslations('nav'),
    getTranslations('site'),
  ])

  const year = new Date().getFullYear()

  const socials = [
    { label: 'Facebook', href: 'https://www.facebook.com/immobilierCPI' },
    { label: 'Instagram', href: 'https://www.instagram.com/cpi.immobilier/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/cpiimmobilier/' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@cpi.immobilier' },
    { label: 'YouTube', href: 'https://www.youtube.com/@-cpi.immobilier' },
  ]

  return (
    <footer className="mt-24 border-t border-subtle bg-surface-sunken">
      <div className="container-page grid gap-12 py-16 md:grid-cols-3">
        <div>
          <p className="font-heading text-2xl text-brand">{tSite('fullName')}</p>
          <p className="mt-3 max-w-xs text-sm text-foreground-muted">
            {tSite('tagline')}
          </p>
        </div>

        <nav className="flex flex-col gap-2.5" aria-label={t('services')}>
          <Link href="/a-propos" className="text-sm text-foreground-muted hover:text-brand">
            {t('about')}
          </Link>
          <Link href="/nos-services" className="text-sm text-foreground-muted hover:text-brand">
            {t('services')}
          </Link>
          <Link href="/terrains" className="text-sm text-foreground-muted hover:text-brand">
            {t('land')}
          </Link>
          <Link href="/blog" className="text-sm text-foreground-muted hover:text-brand">
            {t('blog')}
          </Link>
          <Link href="/contact" className="text-sm text-foreground-muted hover:text-brand">
            {t('contact')}
          </Link>
        </nav>

        <div className="flex flex-col gap-2.5 text-sm">
          <a href="tel:+221776649400" className="text-foreground-muted hover:text-brand">
            77 664 94 00
          </a>
          <a href="tel:+221766200624" className="text-foreground-muted hover:text-brand">
            76 620 06 24
          </a>
          <a href="mailto:contact@cpi.sn" className="text-foreground-muted hover:text-brand">
            contact@cpi.sn
          </a>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {socials.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs tracking-wide text-foreground-muted uppercase hover:text-brand"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-subtle">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {tSite('fullName')}
          </p>
          <Link href="/politique-de-confidentialite" className="hover:text-brand">
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </footer>
  )
}
