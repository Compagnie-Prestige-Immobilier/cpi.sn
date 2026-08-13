import { getTranslations } from 'next-intl/server'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import { VideoModal } from '@/components/ui/video-modal'
import type { Testimonial, Media } from '@/payload-types'

/**
 * Video testimonials from named clients.
 *
 * Each plays in a modal on the page — never a jump to YouTube, which would hand
 * a warm visitor a sidebar of competing developers. The poster images are
 * imported into Payload rather than hotlinked from `i.ytimg.com`, so nothing is
 * requested from Google until someone actually presses play.
 *
 * Renders nothing when the collection is empty: an invented quote is worse than
 * no section at all. See CLAUDE.md → Media and placeholders.
 */
export async function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[]
}) {
  const t = await getTranslations('blog')
  if (!testimonials.length) return null

  return (
    <section className="bg-surface-sunken py-20 lg:py-28">
      <div className="container-page">
        <SectionHeader
          eyebrow="Témoignages"
          title="Ils nous ont fait confiance"
          subtitle="Les expériences de nos clients, dans leurs mots."
          align="start"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, i) => {
            const poster = item.photo as Media | null
            return (
              <Reveal key={item.id} delay={(i % 3) * 90}>
                <figure className="h-full overflow-hidden rounded-lg border border-subtle bg-surface-raised">
                  {item.videoUrl ? (
                    <VideoModal
                      url={item.videoUrl}
                      poster={poster?.url ?? undefined}
                      posterAlt={poster?.alt ?? item.author}
                      label={`${t('title')} — ${item.author}`}
                    />
                  ) : poster?.url ? (
                    <img
                      src={poster.url}
                      alt={poster.alt ?? item.author}
                      className="aspect-video w-full object-cover"
                    />
                  ) : null}

                  <figcaption className="p-5">
                    <p className="font-heading text-lg text-foreground">{item.author}</p>
                    {item.role ? (
                      <p className="mt-1 text-sm text-foreground-muted">{item.role}</p>
                    ) : null}
                    {item.quote ? (
                      <blockquote className="mt-3 text-sm text-foreground-muted italic">
                        “{item.quote}”
                      </blockquote>
                    ) : null}
                  </figcaption>
                </figure>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
