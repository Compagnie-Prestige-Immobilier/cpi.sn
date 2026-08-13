import { SectionHeader } from '@/components/ui/section-header'
import { Reveal } from '@/components/ui/reveal'
import type { HomePage } from '@/payload-types'

export function ValueProps({
  items,
  eyebrow,
  title,
}: {
  items: HomePage['valueProps']
  eyebrow?: string
  title: string
}) {
  if (!items?.length) return null

  return (
    <section className="container-page py-20 lg:py-24">
      <SectionHeader eyebrow={eyebrow} title={title} align="start" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.id ?? i} delay={(i % 3) * 90}>
            <div className="h-full rounded-lg border border-subtle bg-surface-raised p-6">
              {/* Numbered rather than iconified: the source content has no icons,
                  and inventing a pictogram per value adds noise, not meaning. */}
              <span className="font-heading text-2xl text-brand/40">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-heading text-xl text-foreground">{item.title}</h3>
              {item.body ? (
                <p className="mt-3 text-sm text-foreground-muted">{item.body}</p>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
