import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff } from '@/access'

/**
 * Enquiries — contact-form submissions and selection checkouts.
 *
 * SECURITY: this collection holds customers' names and phone numbers.
 *
 *   read   → staff only. Never public. A public read rule here would expose
 *            CPI's entire sales pipeline over the REST API.
 *   create → staff only *through the API*. Public submissions are written
 *            server-side by the route handler using Payload's Local API with
 *            `overrideAccess: true`, so the collection never has to be opened
 *            to anonymous writes. That keeps the REST endpoint closed to
 *            drive-by spam while the site's own forms still work.
 *   delete → admin only, so a lead cannot be quietly discarded.
 *
 * The selection flow writes here and stops. There is no WhatsApp handoff any
 * more: this collection IS the pipeline, and CPI works it from the admin. See
 * CLAUDE.md → Cart.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: {
    singular: { fr: 'Demande', en: 'Lead' },
    plural: { fr: 'Demandes', en: 'Leads' },
  },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'name', 'phone', 'type', 'status', 'createdAt'],
    group: { fr: 'Commercial', en: 'Sales' },
    description: {
      fr: 'Demandes reçues via les formulaires et les sélections du site.',
      en: 'Enquiries received through the site forms and selections.',
    },
  },
  defaultSort: '-createdAt',
  access: {
    read: isStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      unique: true,
      index: true,
      label: { fr: 'Référence', en: 'Reference' },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: {
          fr: 'Communiquée au client à la validation de sa demande. Sert de référence lors des échanges.',
          en: 'Shown to the client on submission. Used as the reference in any follow-up.',
        },
      },
      hooks: {
        beforeChange: [
          ({ value, operation }) => {
            if (operation !== 'create' || value) return value
            // CPI-2026-4F9K2A — year for readability, random tail to avoid a
            // race between two concurrent submissions.
            const year = new Date().getFullYear()
            const tail = Math.random().toString(36).slice(2, 8).toUpperCase()
            return `CPI-${year}-${tail}`
          },
        ],
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'form',
      label: { fr: 'Origine', en: 'Type' },
      admin: { position: 'sidebar' },
      options: [
        { label: { fr: 'Formulaire', en: 'Form' }, value: 'form' },
        // The stored value stays `cart`: it is only a label, and renaming the
        // value would need a migration and orphan every existing row.
        { label: { fr: 'Sélection', en: 'Selection' }, value: 'cart' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'nouveau',
      label: { fr: 'Statut', en: 'Status' },
      admin: { position: 'sidebar' },
      options: [
        { label: { fr: 'Nouveau', en: 'New' }, value: 'nouveau' },
        { label: { fr: 'Contacté', en: 'Contacted' }, value: 'contacte' },
        { label: { fr: 'Converti', en: 'Converted' }, value: 'converti' },
        { label: { fr: 'Perdu', en: 'Lost' }, value: 'perdu' },
      ],
    },
    {
      name: 'locale',
      type: 'text',
      label: { fr: 'Langue', en: 'Language' },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: {
          fr: 'Langue du visiteur — rappelez-le dans cette langue.',
          en: "Visitor's language — call them back in it.",
        },
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: { fr: 'Nom', en: 'Name' },
          admin: { width: '50%' },
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
          label: { fr: 'Téléphone', en: 'Phone' },
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
      label: { fr: 'E-mail', en: 'Email' },
    },
    {
      name: 'message',
      type: 'textarea',
      label: { fr: 'Message', en: 'Message' },
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'properties',
      hasMany: true,
      label: { fr: 'Biens sélectionnés', en: 'Selected properties' },
    },
    {
      name: 'source',
      type: 'text',
      label: { fr: 'Page d’origine', en: 'Source page' },
      admin: { readOnly: true },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: { fr: 'Notes internes', en: 'Internal notes' },
      admin: {
        description: {
          fr: 'Visible uniquement par l’équipe CPI.',
          en: 'Visible to CPI staff only.',
        },
      },
    },
  ],
}
