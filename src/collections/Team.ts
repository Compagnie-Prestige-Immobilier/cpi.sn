import type { CollectionConfig } from 'payload'
import { isAdmin, isPublic, isStaff } from '@/access'

/**
 * Leadership team, shown on À propos.
 *
 * CPI has not supplied portraits yet, so entries render with a neutral
 * silhouette until `photo` is filled. That is deliberate: a placeholder must
 * look like a placeholder. See CLAUDE.md → Media and placeholders.
 */
export const Team: CollectionConfig = {
  slug: 'team',
  labels: {
    singular: { fr: "Membre de l'équipe", en: 'Team member' },
    plural: { fr: 'Équipe', en: 'Team' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
    group: { fr: 'Contenu', en: 'Content' },
  },
  defaultSort: 'order',
  access: { read: isPublic, create: isStaff, update: isStaff, delete: isAdmin },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: { fr: 'Nom', en: 'Name' },
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Fonction', en: 'Role' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Photo', en: 'Photo' },
      admin: {
        description: {
          fr: "Sans photo, une silhouette neutre est affichée à la place.",
          en: 'Without a photo, a neutral silhouette is shown instead.',
        },
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
      label: { fr: 'Biographie', en: 'Biography' },
    },
    {
      name: 'linkedin',
      type: 'text',
      label: { fr: 'LinkedIn', en: 'LinkedIn' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { fr: 'Ordre d’affichage', en: 'Display order' },
      admin: { position: 'sidebar' },
    },
  ],
}
