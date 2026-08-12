import type { CollectionConfig } from 'payload'

/**
 * Admin users only.
 *
 * There is deliberately NO public-facing account system — the Houzez dashboard,
 * favourites, saved searches and cart were dropped. Visitors never authenticate;
 * the cart is client-side and hands off to WhatsApp. See CLAUDE.md → Cart.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Administration',
  },
  access: {
    // Only signed-in staff can touch user records.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: { fr: 'Nom', en: 'Name' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      label: { fr: 'Rôle', en: 'Role' },
      options: [
        { label: { fr: 'Administrateur', en: 'Administrator' }, value: 'admin' },
        { label: { fr: 'Éditeur', en: 'Editor' }, value: 'editor' },
      ],
    },
  ],
}
