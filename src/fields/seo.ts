import type { Field } from 'payload'

/**
 * Per-document SEO overrides, localized.
 *
 * All optional: when empty the page falls back to the document's own title and
 * excerpt. Yoast on the old site left most of these blank, so the fallback path
 * is the common case, not the exception — see content-audit/.
 */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: { fr: 'Référencement (SEO)', en: 'SEO' },
  admin: {
    description: {
      fr: 'Laisser vide pour utiliser le titre et le résumé de la page.',
      en: "Leave blank to fall back to the page's own title and excerpt.",
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: { fr: 'Titre SEO', en: 'SEO title' },
      admin: {
        description: {
          fr: 'Idéalement 50–60 caractères.',
          en: 'Ideally 50–60 characters.',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { fr: 'Méta description', en: 'Meta description' },
      maxLength: 200,
      admin: {
        description: {
          fr: 'Idéalement 150–160 caractères.',
          en: 'Ideally 150–160 characters.',
        },
      },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Image de partage', en: 'Share image' },
      admin: {
        description: {
          fr: 'Affichée sur WhatsApp, Facebook et LinkedIn. 1200×630 recommandé.',
          en: 'Shown on WhatsApp, Facebook and LinkedIn. 1200×630 recommended.',
        },
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      defaultValue: false,
      label: { fr: 'Exclure des moteurs de recherche', en: 'Hide from search engines' },
    },
  ],
}
