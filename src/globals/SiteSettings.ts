import type { GlobalConfig } from 'payload'
import { isPublic, isStaff } from '@/access'

/**
 * Contact details, socials and the WhatsApp number.
 *
 * These live here rather than as constants because CPI *will* change them —
 * the phone number appears in the header, the footer, every form and the cart
 * handoff. One edit, everywhere.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { fr: 'Paramètres du site', en: 'Site settings' },
  admin: { group: { fr: 'Configuration', en: 'Configuration' } },
  access: { read: isPublic, update: isStaff },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { fr: 'Identité', en: 'Identity' },
          fields: [
            {
              name: 'siteName',
              type: 'text',
              defaultValue: 'Compagnie Prestige Immobilier',
              label: { fr: 'Nom du site', en: 'Site name' },
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              label: { fr: 'Accroche', en: 'Tagline' },
            },
            {
              name: 'defaultSeoImage',
              type: 'upload',
              relationTo: 'media',
              label: { fr: 'Image de partage par défaut', en: 'Default share image' },
            },
          ],
        },
        {
          label: { fr: 'Contact', en: 'Contact' },
          fields: [
            {
              name: 'phones',
              type: 'array',
              label: { fr: 'Téléphones', en: 'Phone numbers' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      label: { fr: 'Libellé', en: 'Label' },
                      admin: { width: '40%' },
                    },
                    {
                      name: 'number',
                      type: 'text',
                      required: true,
                      label: { fr: 'Numéro', en: 'Number' },
                      admin: { width: '60%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'email',
              type: 'email',
              defaultValue: 'contact@cpi.sn',
              label: { fr: 'E-mail', en: 'Email' },
            },
            {
              name: 'whatsappNumber',
              type: 'text',
              required: true,
              defaultValue: '221764508374',
              label: { fr: 'Numéro WhatsApp', en: 'WhatsApp number' },
              admin: {
                description: {
                  fr: 'Format international sans « + » ni espaces (ex. 221764508374). Reçoit les sélections envoyées depuis le site.',
                  en: 'International format, no "+" or spaces (e.g. 221764508374). Receives selections sent from the site.',
                },
              },
            },
            {
              name: 'address',
              type: 'textarea',
              localized: true,
              label: { fr: 'Adresse', en: 'Address' },
            },
            {
              name: 'openingHours',
              type: 'text',
              localized: true,
              label: { fr: 'Horaires', en: 'Opening hours' },
            },
          ],
        },
        {
          label: { fr: 'Réseaux sociaux', en: 'Social' },
          fields: [
            {
              name: 'socials',
              type: 'array',
              label: { fr: 'Réseaux', en: 'Networks' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      label: { fr: 'Plateforme', en: 'Platform' },
                      admin: { width: '40%' },
                      options: [
                        'Facebook',
                        'Instagram',
                        'LinkedIn',
                        'TikTok',
                        'YouTube',
                        'X',
                      ].map((p) => ({ label: p, value: p.toLowerCase() })),
                    },
                    {
                      name: 'url',
                      type: 'text',
                      required: true,
                      label: { fr: 'Lien', en: 'URL' },
                      admin: { width: '60%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
