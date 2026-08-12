import type { GlobalConfig } from 'payload'
import { isPublic, isStaff } from '@/access'

/**
 * Header and footer menus.
 *
 * Two levels deep, on purpose. The old WordPress menu nested four levels
 * ("PROJETS → PROJETS RÉALISÉS → PROGRAMMES FONCIERS → …") where every leaf was
 * just a filter over the same collection. Filtering belongs on the listing
 * page; a third level here would rebuild the maze we are migrating away from.
 */

const linkGroup = (name: string, label: { fr: string; en: string }) => ({
  name,
  type: 'array' as const,
  label,
  fields: [
    {
      type: 'row' as const,
      fields: [
        {
          name: 'label',
          type: 'text' as const,
          required: true,
          localized: true,
          label: { fr: 'Libellé', en: 'Label' },
          admin: { width: '50%' },
        },
        {
          name: 'href',
          type: 'text' as const,
          label: { fr: 'Lien', en: 'Link' },
          admin: {
            width: '50%',
            description: {
              fr: 'Chemin interne (ex. /terrains) ou URL complète.',
              en: 'Internal path (e.g. /terrains) or a full URL.',
            },
          },
        },
      ],
    },
  ],
})

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: { fr: 'Navigation', en: 'Navigation' },
  admin: { group: { fr: 'Configuration', en: 'Configuration' } },
  access: { read: isPublic, update: isStaff },
  fields: [
    {
      name: 'header',
      type: 'array',
      label: { fr: 'Menu principal', en: 'Main menu' },
      admin: {
        description: {
          fr: 'Deux niveaux maximum. Pour filtrer des biens, pointez vers la page de liste avec un filtre.',
          en: 'Two levels maximum. To filter properties, link to the listing page with a filter.',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: { fr: 'Libellé', en: 'Label' },
              admin: { width: '50%' },
            },
            {
              name: 'href',
              type: 'text',
              label: { fr: 'Lien', en: 'Link' },
              admin: {
                width: '50%',
                description: {
                  fr: 'Laisser vide pour un simple libellé de sous-menu.',
                  en: 'Leave blank for a submenu label with no link of its own.',
                },
              },
            },
          ],
        },
        linkGroup('children', { fr: 'Sous-menu', en: 'Submenu' }),
      ],
    },
    {
      name: 'footerColumns',
      type: 'array',
      maxRows: 3,
      label: { fr: 'Colonnes du pied de page', en: 'Footer columns' },
      fields: [
        {
          name: 'heading',
          type: 'text',
          localized: true,
          label: { fr: 'Titre', en: 'Heading' },
        },
        linkGroup('links', { fr: 'Liens', en: 'Links' }),
      ],
    },
    linkGroup('legal', { fr: 'Liens légaux', en: 'Legal links' }),
  ],
}
