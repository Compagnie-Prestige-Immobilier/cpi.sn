import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { alternatesForSlugs } from '@/lib/seo'
import { notFound } from 'next/navigation'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import { PostCard } from '@/components/blog/post-card'
import { getPosts, getCategories } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

type Props = { params: Promise<{ locale: string; slug: string }> }

/**
 * Without this the route inherited the layout's metadata, so all six category
 * pages declared the *homepage* as their canonical — telling Google the
 * homepage was the real version of each of them, and that none of them should
 * be indexed in their own right.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const [t, categories] = await Promise.all([
    getTranslations({ locale, namespace: 'blog' }),
    getCategories(locale as Locale),
  ])
  const category = categories.find((c) => c.slug === slug)
  if (!category) return {}

  return {
    title: `${category.name} — ${t('title')}`,
    // The imported categories have no description, so one is generated from the
    // category name rather than left blank — a listing page with no description
    // gets whatever snippet Google scrapes off the nav.
    description: category.description || t('categoryMeta', { category: category.name }),
    alternates: alternatesForSlugs(locale as Locale, '/blog/categorie/[slug]', {
      [locale as Locale]: slug,
    }),
  }
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const t = await getTranslations('blog')
  const categories = await getCategories(locale as Locale)
  const category = categories.find((c) => c.slug === slug)
  if (!category) notFound()

  const { docs: posts } = await getPosts({ locale: locale as Locale, categorySlug: slug })

  return (
    <div className="container-page py-20 lg:py-28">
      <SectionHeader eyebrow={t('categories')} title={category.name} align="start" />
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
