import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'

export default async function NotFound() {
  const t = await getTranslations('error')

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">404</p>
      <h1 className="mt-5 font-heading text-4xl text-foreground lg:text-5xl">
        {t('notFoundTitle')}
      </h1>
      <p className="mt-4 max-w-md text-foreground-muted">{t('notFoundBody')}</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand-solid px-7 py-3 text-sm font-medium text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover"
      >
        {t('backHome')}
      </Link>
    </div>
  )
}
