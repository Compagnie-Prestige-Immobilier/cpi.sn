import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'
import { pageBlocks } from '@/blocks'
import { isAdmin, isPublishedOrStaff, isStaff } from '@/access'

/**
 * Marketing pages assembled from blocks — À propos, Nos services, service
 * detail pages, lead-capture landing pages.
 *
 * Routes with their own data requirements (properties, blog, cart) are real
 * Next.js routes, not entries here. This collection is for editorial pages
 * whose layout CPI should be able to change without a developer.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { fr: 'Page', en: 'Page' },
    plural: { fr: 'Pages', en: 'Pages' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: { fr: 'Contenu', en: 'Content' },
  },
  versions: {
    // Explicit save, not autosave. With autosave Payload persists a document
    // the moment the "New" form opens, so every abandoned click leaves an
    // empty draft titled "4", "6"… in the list. For non-technical editors that
    // clutter is worse than the small risk of losing an unsaved edit — and
    // versions still capture every explicit save.
    drafts: true,
    maxPerDoc: 20,
  },
  access: {
    read: isPublishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { fr: 'Contenu', en: 'Content' },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: { fr: 'Titre', en: 'Title' },
            },
            {
              name: 'blocks',
              type: 'blocks',
              label: { fr: 'Sections', en: 'Sections' },
              labels: {
                singular: { fr: 'Section', en: 'Section' },
                plural: { fr: 'Sections', en: 'Sections' },
              },
              blocks: pageBlocks,
            },
          ],
        },
        {
          label: { fr: 'SEO', en: 'SEO' },
          fields: [seoField],
        },
      ],
    },

    slugField('title'),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      label: { fr: 'Page parente', en: 'Parent page' },
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Ex. « Promotion foncière » sous « Nos services ».',
          en: 'e.g. "Land development" under "Services".',
        },
      },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
  ],
}
