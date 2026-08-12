import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { isAdmin, isPublic, isStaff } from '@/access'

/**
 * Senegalese localities used by properties.
 *
 * The old Houzez install had 40 "cities" and 41 "areas", most of them empty
 * demo terms. Only ~12 carried real listings — see content-audit/INVENTORY.md.
 * `region` collapses the redundant second taxonomy into one field.
 */
export const Cities: CollectionConfig = {
  slug: 'cities',
  labels: {
    singular: { fr: 'Localité', en: 'City' },
    plural: { fr: 'Localités', en: 'Cities' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'region'],
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
      name: 'region',
      type: 'select',
      label: { fr: 'Région', en: 'Region' },
      // The 14 administrative regions of Senegal.
      options: [
        'Dakar',
        'Diourbel',
        'Fatick',
        'Kaffrine',
        'Kaolack',
        'Kédougou',
        'Kolda',
        'Louga',
        'Matam',
        'Saint-Louis',
        'Sédhiou',
        'Tambacounda',
        'Thiès',
        'Ziguinchor',
      ].map((r) => ({ label: r, value: r })),
    },
  ],
}
