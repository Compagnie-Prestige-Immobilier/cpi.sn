import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { isAdmin, isPublic, isStaff } from '@/access'

/**
 * Equipment and services attached to a property (eau, électricité, voirie,
 * climatisation…). Migrated from the Houzez `property_feature` taxonomy, which
 * had 26 terms and was the one part of the old taxonomy that was actually clean.
 */
export const Amenities: CollectionConfig = {
  slug: 'amenities',
  labels: {
    singular: { fr: 'Équipement', en: 'Amenity' },
    plural: { fr: 'Équipements', en: 'Amenities' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category'],
    group: { fr: 'Référentiels', en: 'Taxonomies' },
  },
  access: { read: isPublic, create: isStaff, update: isStaff, delete: isAdmin },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Nom', en: 'Name' },
    },
    slugField('name'),
    {
      name: 'category',
      type: 'select',
      defaultValue: 'viabilisation',
      label: { fr: 'Catégorie', en: 'Category' },
      options: [
        {
          label: { fr: 'Viabilisation', en: 'Site servicing' },
          value: 'viabilisation',
        },
        { label: { fr: 'Confort', en: 'Comfort' }, value: 'confort' },
        { label: { fr: 'Sécurité', en: 'Security' }, value: 'securite' },
        { label: { fr: 'Extérieur', en: 'Outdoor' }, value: 'exterieur' },
      ],
    },
    {
      name: 'icon',
      type: 'text',
      label: { fr: 'Icône', en: 'Icon' },
      admin: {
        description: {
          fr: "Nom de l'icône utilisée dans la fiche du bien.",
          en: 'Icon name used on the property page.',
        },
      },
    },
  ],
}
