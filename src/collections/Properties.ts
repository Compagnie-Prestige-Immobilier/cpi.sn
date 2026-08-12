import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { seoField } from '@/fields/seo'
import { isAdmin, isPublishedOrStaff, isStaff } from '@/access'

/**
 * The core collection: terrains, programmes fonciers/immobiliers, villas,
 * appartements, immeubles, bureaux and commerces — all of it.
 *
 * This single collection replaces the 17 overlapping Houzez `property_type`
 * terms (`Programme Immobilier – Réalisé`, `Projets déjà réalisés`,
 * `Nos Realisations`, `Projets en cours`… all of which meant roughly the same
 * thing). Those collapse into three orthogonal axes:
 *
 *     productLine  what business line it belongs to   (2 values)
 *     kind         what the thing physically is       (6 values)
 *     availability where it is in its lifecycle       (5 values)
 *
 * Every old listing page becomes a filter over these instead of a hand-built
 * page. See plan.md §5 and content-audit/INVENTORY.md.
 */
export const Properties: CollectionConfig = {
  slug: 'properties',
  labels: {
    singular: { fr: 'Bien', en: 'Property' },
    plural: { fr: 'Biens', en: 'Properties' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'productLine', 'kind', 'availability', 'city'],
    group: { fr: 'Contenu', en: 'Content' },
    description: {
      fr: 'Terrains, programmes fonciers et immobiliers, villas, appartements.',
      en: 'Land, developments, villas and apartments.',
    },
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
        // ── Général ───────────────────────────────────────────────────────
        {
          label: { fr: 'Général', en: 'General' },
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
              label: { fr: 'Résumé', en: 'Excerpt' },
              admin: {
                description: {
                  fr: 'Affiché sur les cartes et dans les listes.',
                  en: 'Shown on cards and in listings.',
                },
              },
            },
            {
              name: 'description',
              type: 'richText',
              localized: true,
              label: { fr: 'Description', en: 'Description' },
            },
            {
              name: 'amenities',
              type: 'relationship',
              relationTo: 'amenities',
              hasMany: true,
              label: { fr: 'Équipements', en: 'Amenities' },
            },
          ],
        },

        // ── Localisation ──────────────────────────────────────────────────
        {
          label: { fr: 'Localisation', en: 'Location' },
          fields: [
            {
              name: 'city',
              type: 'relationship',
              relationTo: 'cities',
              label: { fr: 'Localité', en: 'City' },
            },
            {
              name: 'address',
              type: 'text',
              localized: true,
              label: { fr: 'Adresse', en: 'Address' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'latitude',
                  type: 'number',
                  label: { fr: 'Latitude', en: 'Latitude' },
                  admin: { width: '50%' },
                },
                {
                  name: 'longitude',
                  type: 'number',
                  label: { fr: 'Longitude', en: 'Longitude' },
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },

        // ── Caractéristiques ──────────────────────────────────────────────
        {
          label: { fr: 'Caractéristiques', en: 'Specifications' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'surface',
                  type: 'number',
                  min: 0,
                  label: { fr: 'Superficie (m²)', en: 'Surface (m²)' },
                  admin: { width: '50%' },
                },
                {
                  name: 'plotSize',
                  type: 'number',
                  min: 0,
                  label: { fr: 'Superficie du terrain (m²)', en: 'Plot size (m²)' },
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'bedrooms',
                  type: 'number',
                  min: 0,
                  label: { fr: 'Chambres', en: 'Bedrooms' },
                  admin: { width: '33%' },
                },
                {
                  name: 'bathrooms',
                  type: 'number',
                  min: 0,
                  label: { fr: 'Salles de bain', en: 'Bathrooms' },
                  admin: { width: '33%' },
                },
                {
                  name: 'floors',
                  type: 'text',
                  label: { fr: 'Niveaux', en: 'Floors' },
                  admin: {
                    width: '33%',
                    description: { fr: 'Ex. R+5, RDC', en: 'e.g. R+5, RDC' },
                  },
                },
              ],
            },
            {
              name: 'year',
              type: 'number',
              min: 1950,
              max: 2100,
              label: { fr: 'Année', en: 'Year' },
            },
            {
              name: 'titleDeed',
              type: 'text',
              label: { fr: 'Titre foncier (TF)', en: 'Title deed' },
              admin: {
                description: {
                  fr: "Ex. TF 7350/R. Argument commercial fort au Sénégal — à renseigner dès qu'il est connu.",
                  en: 'e.g. TF 7350/R. A strong selling point in Senegal — fill in whenever known.',
                },
              },
            },
          ],
        },

        // ── Médias ────────────────────────────────────────────────────────
        {
          label: { fr: 'Médias', en: 'Media' },
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              label: { fr: 'Image principale', en: 'Featured image' },
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: { fr: 'Galerie', en: 'Gallery' },
            },
            {
              name: 'videoUrl',
              type: 'text',
              label: { fr: 'Vidéo (YouTube)', en: 'Video (YouTube)' },
              admin: {
                description: {
                  fr: "S'ouvre dans une fenêtre modale, jamais en redirection vers YouTube.",
                  en: 'Opens in a modal — never a redirect to YouTube.',
                },
              },
            },
            {
              name: 'brochure',
              type: 'upload',
              relationTo: 'media',
              label: { fr: 'Brochure (PDF)', en: 'Brochure (PDF)' },
            },
          ],
        },

        // ── SEO ───────────────────────────────────────────────────────────
        {
          label: { fr: 'SEO', en: 'SEO' },
          fields: [seoField],
        },
      ],
    },

    // ── Sidebar: the three classification axes ────────────────────────────
    slugField('title'),
    {
      name: 'productLine',
      type: 'select',
      required: true,
      label: { fr: 'Ligne de métier', en: 'Product line' },
      admin: { position: 'sidebar' },
      options: [
        { label: { fr: 'Promotion foncière', en: 'Land development' }, value: 'foncier' },
        {
          label: { fr: 'Promotion immobilière', en: 'Property development' },
          value: 'immobilier',
        },
      ],
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      label: { fr: 'Type de bien', en: 'Property kind' },
      admin: { position: 'sidebar' },
      options: [
        { label: { fr: 'Terrain', en: 'Land' }, value: 'terrain' },
        { label: { fr: 'Villa', en: 'Villa' }, value: 'villa' },
        { label: { fr: 'Appartement', en: 'Apartment' }, value: 'appartement' },
        { label: { fr: 'Immeuble', en: 'Building' }, value: 'immeuble' },
        { label: { fr: 'Bureau', en: 'Office' }, value: 'bureau' },
        { label: { fr: 'Commerce', en: 'Retail' }, value: 'commerce' },
      ],
    },
    {
      /**
       * NOT named `status`: Payload's drafts feature owns that name. A field
       * called `status` generates the same Postgres enum as the internal
       * `_status` draft column (`enum_properties_status`), so both columns end
       * up sharing one type containing only ('draft','published') — the admin
       * would offer the French options and Postgres would reject them on save.
       */
      name: 'availability',
      type: 'select',
      required: true,
      defaultValue: 'disponible',
      label: { fr: 'Statut', en: 'Status' },
      admin: { position: 'sidebar' },
      options: [
        { label: { fr: 'Disponible', en: 'Available' }, value: 'disponible' },
        { label: { fr: 'En cours', en: 'Ongoing' }, value: 'en-cours' },
        { label: { fr: 'Réalisé', en: 'Completed' }, value: 'realise' },
        { label: { fr: 'Vendu', en: 'Sold' }, value: 'vendu' },
        { label: { fr: 'À louer', en: 'For rent' }, value: 'a-louer' },
      ],
    },

    // ── Sidebar: pricing ──────────────────────────────────────────────────
    {
      name: 'showPrice',
      type: 'checkbox',
      defaultValue: false,
      label: { fr: 'Afficher le prix', en: 'Show price' },
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Décoché, la fiche affiche « Prix sur demande » — le cas le plus fréquent.',
          en: 'Unchecked shows "Price on request" — the common case.',
        },
      },
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      label: { fr: 'Prix (FCFA)', en: 'Price (XOF)' },
      admin: {
        position: 'sidebar',
        // XOF has no minor unit; the front end never renders decimals.
        step: 1000,
        condition: (data) => Boolean(data?.showPrice),
      },
    },
    {
      name: 'priceNote',
      type: 'text',
      localized: true,
      label: { fr: 'Mention de prix', en: 'Price note' },
      admin: {
        position: 'sidebar',
        description: { fr: 'Ex. « à partir de », « / mois »', en: 'e.g. "from", "/ month"' },
        condition: (data) => Boolean(data?.showPrice),
      },
    },

    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: { fr: 'Mettre en avant', en: 'Featured' },
      admin: { position: 'sidebar' },
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
