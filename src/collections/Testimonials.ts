import type { CollectionConfig } from 'payload'
import { isAdmin, isPublic, isStaff } from '@/access'

/**
 * Client testimonials — text or video.
 *
 * The Houzez `houzez_testimonials` post type was four empty placeholders, but
 * the legacy homepage carried real VIDEO testimonials from named people. Those
 * are the ones worth having, so this collection supports both shapes: a written
 * quote, a video, or both.
 *
 * Never invent a quote or attribute one to a plausible-sounding name. On a site
 * whose whole proposition is trust, a fabricated testimonial reaching
 * production is a serious problem. See CLAUDE.md → Media and placeholders.
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
      // Optional: a video testimonial carries no transcript.
      localized: true,
      label: { fr: 'Témoignage (texte)', en: 'Quote (text)' },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: { fr: 'Vidéo (YouTube)', en: 'Video (YouTube)' },
      admin: {
        description: {
          fr: "S'ouvre dans une fenêtre modale sur le site — jamais de redirection vers YouTube.",
          en: 'Opens in a modal on the site — never a redirect to YouTube.',
        },
      },
    },
    {
      name: 'role',
      type: 'text',
      localized: true,
      label: { fr: 'Fonction', en: 'Role' },
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
      label: { fr: 'Photo / vignette', en: 'Photo / poster' },
      admin: {
        description: {
          fr: 'Sert aussi de vignette pour la vidéo.',
          en: 'Doubles as the video poster.',
        },
      },
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
