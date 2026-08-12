import Image from 'next/image'
import { setRequestLocale, getTranslations, getFormatter } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { RichText } from '@/components/rich-text'
import { PostCard } from '@/components/blog/post-card'
import { Reveal } from '@/components/ui/reveal'
import { PropertyCard } from '@/components/property/property-card'
import { getPostBySlug, getPosts } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import type { Media, Category, Property } from '@/payload-types'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug, locale as Locale)
  if (!post) return {}

  const og = (post.seo?.ogImage ?? post.coverImage) as Media | null
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || undefined,
    openGraph: og?.url
      ? { type: 'article', images: [{ url: og.url, alt: og.alt ?? '' }] }
      : { type: 'article' },
  }
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const post = await getPostBySlug(slug, locale as Locale)
  if (!post) notFound()

  const [t, format] = await Promise.all([getTranslations('blog'), getFormatter()])
  const cover = post.coverImage as Media | null
  const category = post.category as Category | null

  const related = (post.relatedProperties ?? []).filter(
    (p): p is Property => typeof p === 'object',
  )

  const { docs: more } = await getPosts({ locale: locale as Locale, limit: 4 })
  const others = more.filter((p) => p.id !== post.id).slice(0, 3)

  return (
    <article>
      <header className="container-page pt-16 lg:pt-24">
        <div className="mx-auto max-w-3xl">
          {category ? (
            <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
              {category.name}
            </p>
          ) : null}
          <h1 className="mt-4 font-heading text-4xl leading-[1.1] text-foreground lg:text-5xl">
            {post.title}
          </h1>
          {post.publishedAt ? (
            <p className="mt-5 text-sm text-foreground-muted">
              {t('publishedOn', { date: format.dateTime(new Date(post.publishedAt), 'long') })}
            </p>
          ) : null}
        </div>
      </header>

      {cover?.url ? (
        <div className="container-page mt-10">
          <div className="relative mx-auto aspect-[16/9] max-w-4xl overflow-hidden rounded-lg">
            <Image
              src={cover.url}
              alt={cover.alt ?? post.title}
              fill
              priority
              sizes="(min-width: 1024px) 56rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      <div className="container-page py-14">
        <div className="mx-auto max-w-3xl">
          <RichText data={post.content} />
        </div>
      </div>

      {related.length ? (
        <section className="container-page pb-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-2xl text-foreground">
              {t('relatedPosts')}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {others.length ? (
        <section className="border-t border-subtle">
          <div className="container-page py-16">
            <h2 className="font-heading text-2xl text-foreground">{t('relatedPosts')}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((other, i) => (
                <Reveal key={other.id} delay={(i % 3) * 90}>
                  <PostCard post={other} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  )
}
