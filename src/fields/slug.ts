import type { Field } from 'payload'

/** Accent-aware slugify — French titles are full of é/è/à/ç. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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
