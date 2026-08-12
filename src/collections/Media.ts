import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CollectionConfig } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Uploads.
 *
 * `staticDir` MUST resolve to the mounted Docker volume (MEDIA_DIR=/app/media
 * in production). Anything written into the container filesystem is destroyed
 * on the next redeploy — this is the single most common way a self-hosted
 * Payload install loses client uploads. The volume belongs in Dokploy's backup
 * set alongside pgdata. See CLAUDE.md → Deployment rule 3.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Contenu',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  upload: {
    staticDir: process.env.MEDIA_DIR ?? path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*', 'application/pdf'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 576, position: 'centre' },
      { name: 'wide', width: 1600, position: 'centre' },
    ],
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Texte alternatif', en: 'Alt text' },
      admin: {
        description: {
          fr: "Décrit l'image pour les lecteurs d'écran et le référencement.",
          en: 'Describes the image for screen readers and SEO.',
        },
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      label: { fr: 'Légende', en: 'Caption' },
    },
  ],
}
