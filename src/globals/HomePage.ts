import type { GlobalConfig } from 'payload'
import { isPublic, isStaff } from '@/access'

/**
 * Editorial control of the homepage hero.
 *
 * Deliberately NOT derived from the first property listing. CPI's featured
 * images are promotional banners with the site name burned into the artwork
 * ("NDAYANE — Le luxe au Cœur de la Sérénité Naturelle"), so using one
 * full-bleed puts baked-in text directly behind the hero headline. A hero image
 * has to be chosen for it — clean photography, room for type.
 *
 * With no image set the hero renders on a solid brand ground, which looks
 * intentional rather than broken. That is the correct default until CPI
 * supplies a proper photograph.
 */
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: { fr: "Page d'accueil", en: 'Home page' },
  admin: { group: { fr: 'Configuration', en: 'Configuration' } },
  access: { read: isPublic, update: isStaff },
  fields: [
    {
      name: 'heroEyebrow',
      type: 'text',
      localized: true,
      label: { fr: 'Sur-titre', en: 'Eyebrow' },
    },
    {
      name: 'heroTitle',
      type: 'text',
      localized: true,
      label: { fr: 'Titre principal', en: 'Main heading' },
    },
    {
      name: 'heroSubtitle',
      type: 'textarea',
      localized: true,
      label: { fr: 'Sous-titre', en: 'Subheading' },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Image du hero', en: 'Hero image' },
      admin: {
        description: {
          fr: "Photographie plein écran. Évitez les visuels comportant déjà du texte : le titre du site s'affiche par-dessus.",
          en: 'Full-bleed photograph. Avoid artwork that already contains text — the site heading sits on top of it.',
        },
      },
    },
    {
      name: 'heroVideoUrl',
      type: 'text',
      label: { fr: 'Vidéo de présentation (YouTube)', en: 'Intro video (YouTube)' },
      admin: {
        description: {
          fr: "S'ouvre dans une fenêtre modale au clic — jamais de redirection vers YouTube.",
          en: 'Opens in a modal on click — never a redirect to YouTube.',
        },
      },
    },
    {
      name: 'featuredProperties',
      type: 'relationship',
      relationTo: 'properties',
      hasMany: true,
      maxRows: 6,
      label: { fr: 'Biens mis en avant', en: 'Featured properties' },
      admin: {
        description: {
          fr: 'Vide = les terrains disponibles les plus récents.',
          en: 'Empty = the most recent available land.',
        },
      },
    },

    {
      name: 'stats',
      type: 'array',
      maxRows: 4,
      label: { fr: 'Chiffres clés', en: 'Key figures' },
      admin: {
        description: {
          fr: 'Repris de la page À propos. Les vraies valeurs, pas des compteurs à zéro.',
          en: 'Mirrors the À propos page. Real values, not counters stuck at zero.',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              label: { fr: 'Valeur', en: 'Value' },
              admin: { width: '35%' },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: { fr: 'Libellé', en: 'Label' },
              admin: { width: '65%' },
            },
          ],
        },
      ],
    },

    /**
     * The founder.
     *
     * Aminata Sall SY's record — the 1979 Cour suprême case that carries her
     * name, the Trade Point Sénégal and Gaindé 2000 years — is the strongest
     * trust signal CPI has in a market where buyers are rightly wary about land
     * title. It was buried on the old site; it belongs on the homepage.
     */
    {
      name: 'founder',
      type: 'group',
      label: { fr: 'Fondatrice', en: 'Founder' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: { fr: 'Nom', en: 'Name' },
              admin: { width: '50%' },
            },
            {
              name: 'role',
              type: 'text',
              localized: true,
              label: { fr: 'Fonction', en: 'Role' },
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'portrait',
          type: 'upload',
          relationTo: 'media',
          label: { fr: 'Portrait', en: 'Portrait' },
          admin: {
            description: {
              fr: "Photographie réelle de la fondatrice uniquement. Sans portrait, une silhouette neutre clairement identifiée s'affiche — ne jamais utiliser une image d'illustration à la place d'une personne réelle.",
              en: 'A real photograph of the founder only. With none, a clearly-marked neutral silhouette is shown — never stand in a stock image for a named person.',
            },
          },
        },
        {
          name: 'bio',
          type: 'richText',
          localized: true,
          label: { fr: 'Parcours', en: 'Biography' },
        },
        {
          name: 'highlights',
          type: 'array',
          maxRows: 4,
          label: { fr: 'Faits marquants', en: 'Highlights' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'year',
                  type: 'text',
                  label: { fr: 'Année', en: 'Year' },
                  admin: { width: '25%' },
                },
                {
                  name: 'text',
                  type: 'text',
                  localized: true,
                  label: { fr: 'Fait', en: 'Fact' },
                  admin: { width: '75%' },
                },
              ],
            },
          ],
        },
      ],
    },

    {
      name: 'valueProps',
      type: 'array',
      maxRows: 6,
      label: { fr: 'Nos engagements', en: 'Our commitments' },
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
      ],
    },
  ],
}
