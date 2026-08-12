import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'
import { isAdmin, isPublishedOrStaff, isStaff } from '@/access'

/**
 * Blog articles.
 *
 * The 12 existing French articles are genuinely good content and rank — their
 * slugs must migrate byte-identical. See plan.md §5.
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: { fr: 'Article', en: 'Article' },
    plural: { fr: 'Articles', en: 'Articles' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
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
              name: 'excerpt',
              type: 'textarea',
              localized: true,
              maxLength: 300,
              label: { fr: 'Chapô', en: 'Excerpt' },
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              label: { fr: 'Image de couverture', en: 'Cover image' },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              localized: true,
              label: { fr: 'Article', en: 'Article' },
            },
            {
              name: 'relatedProperties',
              type: 'relationship',
              relationTo: 'properties',
              hasMany: true,
              label: { fr: 'Biens liés', en: 'Related properties' },
              admin: {
                description: {
                  fr: "Affichés en fin d'article — un article sur Sangalkam peut pointer vers le lotissement.",
                  en: 'Shown at the end of the article — a Sangalkam article can point at the development.',
                },
              },
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
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: { fr: 'Catégorie', en: 'Category' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: { fr: 'Auteur', en: 'Author' },
      admin: { position: 'sidebar' },
      defaultValue: ({ user }) => user?.id,
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: { fr: 'Date de publication', en: 'Published at' },
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) =>
            value ?? (siblingData?._status === 'published' ? new Date() : value),
        ],
      },
    },
  ],
}
