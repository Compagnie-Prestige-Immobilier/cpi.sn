import { setRequestLocale, getTranslations } from 'next-intl/server'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import { PostCard } from '@/components/blog/post-card'
import { Link } from '@/i18n/routing'
import { getPosts, getCategories } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  return { title: t('title'), description: t('subtitle') }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('blog')
  const [{ docs: posts }, categories] = await Promise.all([
    getPosts({ locale: locale as Locale }),
    getCategories(locale as Locale),
  ])

  return (
    <div className="container-page py-20 lg:py-28">
      <SectionHeader eyebrow="CPI" title={t('title')} subtitle={t('subtitle')} align="start" />

      {categories.length ? (
        <nav className="mt-10 flex flex-wrap gap-2" aria-label={t('categories')}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={{ pathname: '/blog/categorie/[slug]', params: { slug: category.slug } }}
              className="rounded-full border border-subtle px-5 py-2 text-sm text-foreground-muted transition-colors hover:border-brand-border hover:text-brand"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      ) : null}

      {posts.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 90}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-foreground-muted">{t('empty')}</p>
      )}
    </div>
  )
}
