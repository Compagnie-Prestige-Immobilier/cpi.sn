import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { isAdmin, isPublic, isStaff } from '@/access'

/**
 * Blog categories. Six are in real use on the old site:
 * marché immobilier, achat/vente de terrains, conseils juridiques & fiscaux,
 * construction & architecture, promotion foncière, vie & habitat.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: { fr: 'Catégorie', en: 'Category' },
    plural: { fr: 'Catégories', en: 'Categories' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
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
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { fr: 'Description', en: 'Description' },
    },
  ],
}
