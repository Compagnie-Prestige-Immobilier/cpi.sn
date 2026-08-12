import type { Field } from 'payload'

/**
 * Accent-aware slugify — French titles are full of é/è/à/ç, and real-estate
 * copy is full of `m²`.
 *
 * Superscripts are folded to digits first: without that, "Villa de 200 m²"
 * loses the 2 entirely. WordPress percent-encoded them instead, which is why
 * the old URLs look like `villa-de-200-m%c2%b2-a-ouakam`.
 */
export function slugify(input: string): string {
  let value = input
  // Decode percent-encoded source slugs (…-m%c2%b2-… → …-m²-…).
  try {
    value = decodeURIComponent(value)
  } catch {
    /* leave malformed sequences as-is */
  }

  return value
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .replace(/[‘’']/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 96)
}

/**
 * Localized URL slug.
 *
 * Localized because English routes should read `/en/land/serviced-plot`, not
 * `/en/land/terrain-viabilise`. Payload scopes uniqueness per locale.
 *
 * Auto-filled from the source field when left blank, but never regenerated
 * afterwards: changing a published slug silently breaks inbound links and the
 * 301 map in plan.md §5. Editors can still override it deliberately.
 */
export function slugField(from = 'title'): Field {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    localized: true,
    label: { fr: 'Slug (URL)', en: 'Slug (URL)' },
    admin: {
      position: 'sidebar',
      description: {
        fr: "Généré depuis le titre s'il est laissé vide. Attention : le modifier casse les liens existants.",
        en: 'Generated from the title if left blank. Warning: changing it breaks existing links.',
      },
    },
    hooks: {
      beforeValidate: [
        ({ value, data, originalDoc }) => {
          if (typeof value === 'string' && value.trim()) return slugify(value)

          // Only auto-generate on create, never on update.
          if (originalDoc?.slug) return originalDoc.slug

          const source = data?.[from]
          return typeof source === 'string' && source.trim()
            ? slugify(source)
            : value
        },
      ],
    },
  }
}
