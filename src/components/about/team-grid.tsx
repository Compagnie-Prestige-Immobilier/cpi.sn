import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import type { Team, Media } from '@/payload-types'

/**
 * Leadership team.
 *
 * Portraits are optional and default to a marked silhouette. The old site had
 * no photograph that could be matched to a person, and attaching an unverified
 * face to a named individual is a misattribution — CPI uploads real ones in the
 * admin. See CLAUDE.md → Media and placeholders.
 */
export async function TeamGrid({ members }: { members: Team[] }) {
  const t = await getTranslations('placeholder')
  if (!members.length) return null

  return (
    <section className="bg-surface-sunken py-20 lg:py-24">
      <div className="container-page">
        <SectionHeader
          eyebrow="Notre équipe"
          title="L'équipe dirigeante"
          subtitle="Une expertise reconnue au service de votre projet."
          align="start"
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, i) => {
            const photo = member.photo as Media | null
            return (
              <Reveal key={member.id} delay={(i % 3) * 80}>
                <li className="flex h-full gap-4 rounded-lg border border-subtle bg-surface-raised p-5">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-brand-muted">
                    {photo?.url ? (
                      <Image
                        src={photo.url}
                        alt={photo.alt ?? member.name}
                        fill
                        sizes="4rem"
                        className="object-cover"
                      />
                    ) : (
                      <span
                        className="absolute inset-0 grid place-items-center text-brand/40"
                        title={t('notice')}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="size-8" aria-hidden>
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
                        </svg>
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-heading text-lg leading-tight text-foreground">{member.name}</p>
                    <p className="mt-0.5 text-xs tracking-wide text-accent uppercase">{member.role}</p>
                    {member.bio ? (
                      <p className="mt-3 text-sm text-foreground-muted">{member.bio}</p>
                    ) : null}
                  </div>
                </li>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
