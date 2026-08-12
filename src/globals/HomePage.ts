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
  ],
}
