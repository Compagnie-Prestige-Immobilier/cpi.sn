import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import { PostCard } from '@/components/blog/post-card'
import { getPosts, getCategories } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'

type Props = { params: Promise<{ locale: string; slug: string }> }

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
