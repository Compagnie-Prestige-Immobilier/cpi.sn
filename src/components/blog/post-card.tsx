import Image from 'next/image'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import type { Post, Media, Category } from '@/payload-types'

export async function PostCard({ post }: { post: Post }) {
  const [t, format] = await Promise.all([getTranslations('blog'), getFormatter()])
  const cover = post.coverImage as Media | null
  const category = post.category as Category | null

  return (
    <Link
      href={{ pathname: '/blog/[slug]', params: { slug: post.slug } }}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-subtle bg-surface-raised transition-colors hover:border-brand-border"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-sunken">
        {cover?.url ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {category ? (
          <p className="text-[0.6875rem] tracking-[0.16em] text-accent uppercase">
            {category.name}
          </p>
        ) : null}

        <h3 className="mt-2 font-heading text-xl leading-snug text-foreground group-hover:text-brand">
          {post.title}
        </h3>

        {post.excerpt ? (
          <p className="mt-3 line-clamp-3 text-sm text-foreground-muted">{post.excerpt}</p>
        ) : null}

        {post.publishedAt ? (
          <p className="mt-auto pt-5 text-xs text-foreground-muted">
            {t('publishedOn', { date: format.dateTime(new Date(post.publishedAt), 'long') })}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
