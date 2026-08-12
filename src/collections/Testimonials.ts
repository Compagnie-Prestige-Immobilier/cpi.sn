import type { CollectionConfig } from 'payload'
import { isAdmin, isPublic, isStaff } from '@/access'

/**
 * Client testimonials.
 *
 * All four on the old site were empty placeholders, so this collection ships
 * empty. Do NOT seed it with invented quotes: for a business whose entire
 * proposition is trust, a fabricated testimonial reaching production is a
 * serious problem. The front end renders a marked placeholder when the
 * collection is empty. See CLAUDE.md → Media and placeholders.
 */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: { fr: 'Témoignage', en: 'Testimonial' },
    plural: { fr: 'Témoignages', en: 'Testimonials' },
  },
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'location', 'featured'],
    group: { fr: 'Contenu', en: 'Content' },
  },
  access: { read: isPublic, create: isStaff, update: isStaff, delete: isAdmin },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Témoignage', en: 'Quote' },
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      label: { fr: 'Client', en: 'Client' },
    },
    {
      name: 'location',
      type: 'text',
      label: { fr: 'Localité / projet', en: 'Location / project' },
      admin: {
        description: {
          fr: 'Ex. « Propriétaire à Sangalkam ». Ancre le témoignage dans un lieu réel.',
          en: 'e.g. "Owner in Sangalkam". Anchors the quote to a real place.',
        },
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Photo', en: 'Photo' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: { fr: 'Mettre en avant', en: 'Featured' },
      admin: { position: 'sidebar' },
    },
  ],
}
