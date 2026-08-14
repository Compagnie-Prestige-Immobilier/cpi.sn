import type { CollectionConfig } from 'payload'
import { isAdmin, isPublic, isStaff } from '@/access'

/**
 * Everything the Boutique sells — land sites and the fixed-price services.
 *
 * These began life hardcoded, to match the designer's page exactly. They are a
 * collection now so CPI can correct a name, swap a photograph or change a price
 * without a deploy — which matters most for the prices, since the deposit is
 * currently the only figure on a card and CPI has yet to set the rest.
 *
 * Deliberately NOT the `properties` collection: a listing is an editorial
 * record of a development, a shop item is a thing with a price and a basket
 * button. Several sites here have no listing at all, and forcing them into
 * `properties` would put half-empty records in the public listing pages.
 *
 * `price` is XOF and therefore an integer — the franc CFA has no minor unit.
 */
export const ShopItems: CollectionConfig = {
  slug: 'shop-items',
  labels: {
    singular: { fr: 'Article boutique', en: 'Shop item' },
    plural: { fr: 'Boutique', en: 'Shop' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'region', 'price', 'order'],
    group: { fr: 'Commercial', en: 'Sales' },
    description: {
      fr: 'Terrains et prestations vendus dans la boutique. Rien sur le site ne prélève de paiement : le panier envoie une demande de devis.',
      en: 'Land and services sold in the shop. Nothing on the site takes payment — the basket submits a quote request.',
    },
  },
  defaultSort: 'order',
  access: { read: isPublic, create: isStaff, update: isStaff, delete: isAdmin },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Nom', en: 'Name' },
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'terrain',
      label: { fr: 'Type', en: 'Kind' },
      options: [
        { label: { fr: 'Terrain', en: 'Land' }, value: 'terrain' },
        { label: { fr: 'Prestation', en: 'Service' }, value: 'service' },
      ],
      admin: {
        description: {
          fr: 'Les terrains apparaissent dans la grille filtrable, les prestations dans « À commander en ligne ».',
          en: 'Land shows in the filterable grid; services show under "Order online".',
        },
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: { fr: 'Ordre', en: 'Order' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: { fr: 'Mis en avant', en: 'Featured' },
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Affiche le badge « Le plus demandé » et remonte l’article dans le tri par défaut.',
          en: 'Shows the "Most requested" badge and lifts the item in the default sort.',
        },
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { fr: 'Photo', en: 'Photo' },
      admin: {
        description: {
          fr: 'Photographie du site. Évitez les visuels comportant du texte incrusté.',
          en: 'Photograph of the site. Avoid artwork with burned-in text.',
        },
      },
    },
    {
      name: 'place',
      type: 'text',
      localized: true,
      label: { fr: 'Localisation', en: 'Location' },
      admin: { condition: (data) => data?.kind === 'terrain' },
    },
    {
      name: 'region',
      type: 'text',
      label: { fr: 'Région', en: 'Region' },
      admin: {
        condition: (data) => data?.kind === 'terrain',
        description: {
          fr: 'Alimente les filtres de la boutique. Une nouvelle valeur crée automatiquement un filtre.',
          en: 'Drives the shop filters. A new value creates a new filter automatically.',
        },
      },
    },
    {
      name: 'surface',
      type: 'text',
      localized: true,
      label: { fr: 'Superficie', en: 'Surface' },
      admin: {
        condition: (data) => data?.kind === 'terrain',
        description: { fr: 'Ex. « 150–300 m² ».', en: 'e.g. "150–300 m²".' },
      },
    },
    {
      name: 'tags',
      type: 'array',
      maxRows: 3,
      label: { fr: 'Étiquettes', en: 'Tags' },
      admin: { condition: (data) => data?.kind === 'terrain' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: { fr: 'Étiquette', en: 'Label' },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { fr: 'Description', en: 'Description' },
      admin: { condition: (data) => data?.kind === 'service' },
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      label: { fr: 'Prix (FCFA)', en: 'Price (FCFA)' },
      admin: {
        step: 1000,
        description: {
          fr: 'Entier, sans décimales. Vide : « Prix sur demande ».',
          en: 'Integer, no decimals. Empty renders "Price on request".',
        },
      },
    },
    {
      name: 'priceCaption',
      type: 'text',
      localized: true,
      label: { fr: 'Légende du prix', en: 'Price caption' },
      admin: {
        description: {
          fr: 'Ex. « Acompte de réservation ». Vide pour un prix simple.',
          en: 'e.g. "Reservation deposit". Leave empty for a plain price.',
        },
      },
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      defaultValue: 'basket',
      label: { fr: 'Action', en: 'Action' },
      options: [
        { label: { fr: 'Ajouter au panier', en: 'Add to basket' }, value: 'basket' },
        { label: { fr: 'Ouvrir Mon espace', en: 'Open the client portal' }, value: 'portal' },
      ],
      admin: {
        description: {
          fr: 'Le panier envoie une demande de devis — aucun paiement n’est encaissé sur le site.',
          en: 'The basket submits a quote request — no payment is taken on the site.',
        },
      },
    },
  ],
}
