import type { Block } from 'payload'

/**
 * Page-builder blocks.
 *
 * These exist so À propos, Nos services and future landing pages are editable
 * without a deploy — the old site's Elementor layouts are rebuilt as these,
 * never pasted in as raw HTML (plan.md §12).
 *
 * Deliberately a small, opinionated set. A block library that mirrors every
 * Elementor widget just recreates the mess we are migrating away from.
 */

const linkFields: Block['fields'] = [
  {
    type: 'row',
    fields: [
      {
        name: 'label',
        type: 'text',
        localized: true,
        label: { fr: 'Libellé', en: 'Label' },
        admin: { width: '50%' },
      },
      {
        name: 'href',
        type: 'text',
        label: { fr: 'Lien', en: 'Link' },
        admin: { width: '50%' },
      },
    ],
  },
]

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: { fr: 'Hero', en: 'Hero' }, plural: { fr: 'Heros', en: 'Heroes' } },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      localized: true,
      label: { fr: 'Sur-titre', en: 'Eyebrow' },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Titre', en: 'Heading' },
    },
    {
      name: 'subheading',
      type: 'textarea',
      localized: true,
      label: { fr: 'Sous-titre', en: 'Subheading' },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Image de fond', en: 'Background image' },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: { fr: 'Vidéo (YouTube)', en: 'Video (YouTube)' },
      admin: {
        description: {
          fr: 'Chargée uniquement au clic, dans une fenêtre modale.',
          en: 'Loaded on click only, in a modal.',
        },
      },
    },
    { name: 'cta', type: 'group', label: { fr: 'Bouton', en: 'Button' }, fields: linkFields },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: { fr: 'Texte', en: 'Rich text' }, plural: { fr: 'Textes', en: 'Rich text' } },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      label: { fr: 'Contenu', en: 'Content' },
    },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'narrow',
      label: { fr: 'Largeur', en: 'Width' },
      options: [
        { label: { fr: 'Étroite', en: 'Narrow' }, value: 'narrow' },
        { label: { fr: 'Pleine', en: 'Full' }, value: 'full' },
      ],
    },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  labels: {
    singular: { fr: 'Chiffres clés', en: 'Stats' },
    plural: { fr: 'Chiffres clés', en: 'Stats' },
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 4,
      label: { fr: 'Chiffres', en: 'Stats' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              label: { fr: 'Valeur', en: 'Value' },
              admin: { width: '40%', description: { fr: 'Ex. +10 000', en: 'e.g. +10,000' } },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: { fr: 'Libellé', en: 'Label' },
              admin: { width: '60%' },
            },
          ],
        },
      ],
    },
  ],
}

export const TimelineBlock: Block = {
  slug: 'timeline',
  labels: {
    singular: { fr: 'Chronologie', en: 'Timeline' },
    plural: { fr: 'Chronologies', en: 'Timelines' },
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: { fr: 'Titre', en: 'Heading' },
    },
    {
      name: 'entries',
      type: 'array',
      label: { fr: 'Étapes', en: 'Entries' },
      fields: [
        {
          name: 'year',
          type: 'text',
          required: true,
          label: { fr: 'Année', en: 'Year' },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: { fr: 'Titre', en: 'Title' },
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          label: { fr: 'Description', en: 'Body' },
        },
      ],
    },
  ],
}

export const ValueGridBlock: Block = {
  slug: 'valueGrid',
  labels: {
    singular: { fr: 'Grille de valeurs', en: 'Value grid' },
    plural: { fr: 'Grilles de valeurs', en: 'Value grids' },
  },
  fields: [
    { name: 'heading', type: 'text', localized: true, label: { fr: 'Titre', en: 'Heading' } },
    {
      name: 'items',
      type: 'array',
      label: { fr: 'Éléments', en: 'Items' },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: { fr: 'Titre', en: 'Title' },
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          label: { fr: 'Description', en: 'Body' },
        },
        { name: 'icon', type: 'text', label: { fr: 'Icône', en: 'Icon' } },
      ],
    },
  ],
}

export const ServiceSplitBlock: Block = {
  slug: 'serviceSplit',
  labels: {
    singular: { fr: 'Service (image + texte)', en: 'Service split' },
    plural: { fr: 'Services', en: 'Service splits' },
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Titre', en: 'Heading' },
    },
    { name: 'body', type: 'richText', localized: true, label: { fr: 'Texte', en: 'Body' } },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Image', en: 'Image' },
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'start',
      label: { fr: 'Position de l’image', en: 'Image position' },
      options: [
        { label: { fr: 'Début', en: 'Start' }, value: 'start' },
        { label: { fr: 'Fin', en: 'End' }, value: 'end' },
      ],
    },
    { name: 'cta', type: 'group', label: { fr: 'Bouton', en: 'Button' }, fields: linkFields },
  ],
}

export const PropertyListBlock: Block = {
  slug: 'propertyList',
  labels: {
    singular: { fr: 'Liste de biens', en: 'Property list' },
    plural: { fr: 'Listes de biens', en: 'Property lists' },
  },
  fields: [
    { name: 'heading', type: 'text', localized: true, label: { fr: 'Titre', en: 'Heading' } },
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'filter',
      label: { fr: 'Sélection', en: 'Selection' },
      options: [
        { label: { fr: 'Par filtre', en: 'By filter' }, value: 'filter' },
        { label: { fr: 'Manuelle', en: 'Manual' }, value: 'manual' },
      ],
    },
    {
      name: 'productLine',
      type: 'select',
      label: { fr: 'Ligne de métier', en: 'Product line' },
      options: [
        { label: { fr: 'Promotion foncière', en: 'Land development' }, value: 'foncier' },
        { label: { fr: 'Promotion immobilière', en: 'Property development' }, value: 'immobilier' },
      ],
      admin: { condition: (_, sibling) => sibling?.mode === 'filter' },
    },
    {
      name: 'availability',
      type: 'select',
      label: { fr: 'Statut', en: 'Status' },
      options: [
        { label: { fr: 'Disponible', en: 'Available' }, value: 'disponible' },
        { label: { fr: 'En cours', en: 'Ongoing' }, value: 'en-cours' },
        { label: { fr: 'Réalisé', en: 'Completed' }, value: 'realise' },
      ],
      admin: { condition: (_, sibling) => sibling?.mode === 'filter' },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 24,
      label: { fr: 'Nombre de biens', en: 'Number of properties' },
      admin: { condition: (_, sibling) => sibling?.mode === 'filter' },
    },
    {
      name: 'properties',
      type: 'relationship',
      relationTo: 'properties',
      hasMany: true,
      label: { fr: 'Biens', en: 'Properties' },
      admin: { condition: (_, sibling) => sibling?.mode === 'manual' },
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: { fr: 'Galerie', en: 'Gallery' }, plural: { fr: 'Galeries', en: 'Galleries' } },
  fields: [
    { name: 'heading', type: 'text', localized: true, label: { fr: 'Titre', en: 'Heading' } },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      label: { fr: 'Images', en: 'Images' },
    },
  ],
}

export const TestimonialsBlock: Block = {
  slug: 'testimonialsBlock',
  labels: {
    singular: { fr: 'Témoignages', en: 'Testimonials' },
    plural: { fr: 'Témoignages', en: 'Testimonials' },
  },
  fields: [
    { name: 'heading', type: 'text', localized: true, label: { fr: 'Titre', en: 'Heading' } },
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
      label: { fr: 'Témoignages', en: 'Testimonials' },
      admin: {
        description: {
          fr: 'Vide = les témoignages mis en avant. Aucun témoignage réel ? Un bloc provisoire clairement identifié est affiché.',
          en: 'Empty = featured testimonials. No real testimonials? A clearly-marked placeholder is shown.',
        },
      },
    },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: { fr: 'FAQ', en: 'FAQ' }, plural: { fr: 'FAQ', en: 'FAQs' } },
  fields: [
    { name: 'heading', type: 'text', localized: true, label: { fr: 'Titre', en: 'Heading' } },
    {
      name: 'items',
      type: 'array',
      label: { fr: 'Questions', en: 'Questions' },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          localized: true,
          label: { fr: 'Question', en: 'Question' },
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
          localized: true,
          label: { fr: 'Réponse', en: 'Answer' },
        },
      ],
    },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  labels: {
    singular: { fr: 'Appel à l’action', en: 'Call to action' },
    plural: { fr: 'Appels à l’action', en: 'Calls to action' },
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Titre', en: 'Heading' },
    },
    { name: 'body', type: 'textarea', localized: true, label: { fr: 'Texte', en: 'Body' } },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Image de fond', en: 'Background image' },
    },
    { name: 'cta', type: 'group', label: { fr: 'Bouton', en: 'Button' }, fields: linkFields },
  ],
}

export const ContactFormBlock: Block = {
  slug: 'contactForm',
  labels: {
    singular: { fr: 'Formulaire', en: 'Form' },
    plural: { fr: 'Formulaires', en: 'Forms' },
  },
  fields: [
    { name: 'heading', type: 'text', localized: true, label: { fr: 'Titre', en: 'Heading' } },
    { name: 'body', type: 'textarea', localized: true, label: { fr: 'Texte', en: 'Body' } },
    {
      name: 'subject',
      type: 'text',
      label: { fr: 'Objet interne', en: 'Internal subject' },
      admin: {
        description: {
          fr: 'Identifie la provenance de la demande dans l’admin (ex. « Projet clés en main »).',
          en: 'Identifies where the enquiry came from in the admin (e.g. "Turnkey project").',
        },
      },
    },
  ],
}

export const pageBlocks = [
  HeroBlock,
  RichTextBlock,
  StatsBlock,
  TimelineBlock,
  ValueGridBlock,
  ServiceSplitBlock,
  PropertyListBlock,
  GalleryBlock,
  TestimonialsBlock,
  FaqBlock,
  CtaBlock,
  ContactFormBlock,
]
