import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { payloadLocales, defaultLocale } from './src/i18n/locales'

import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { Cities } from './src/collections/Cities'
import { Amenities } from './src/collections/Amenities'
import { Categories } from './src/collections/Categories'
import { Properties } from './src/collections/Properties'
import { Posts } from './src/collections/Posts'
import { Pages } from './src/collections/Pages'
import { Team } from './src/collections/Team'
import { Testimonials } from './src/collections/Testimonials'
import { ShopItems } from '@/collections/ShopItems'
import { Leads } from './src/collections/Leads'

import { SiteSettings } from './src/globals/SiteSettings'
import { Navigation } from './src/globals/Navigation'
import { HomePage } from './src/globals/HomePage'

import { migrations } from './src/migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))

if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET is not set. See .env.example.')
}
if (!process.env.DATABASE_URI) {
  throw new Error('DATABASE_URI is not set. See .env.example.')
}

export default buildConfig({
  /**
   * `serverURL` is deliberately NOT set.
   *
   * Payload derives upload URLs from it, so setting it bakes an absolute origin
   * into every media reference (`http://localhost:3000/api/media/file/x.webp`).
   * That breaks the moment the host differs from the build environment, and
   * because `next.config.ts` allows no `remotePatterns`, next/image rejects the
   * foreign origin outright — every image on the site fails.
   *
   * Unset, Payload emits relative URLs (`/api/media/file/x.webp`), which are
   * same-origin in every environment and need no allowlist. Code that genuinely
   * needs an absolute URL (metadata, sitemap, email) reads
   * NEXT_PUBLIC_SERVER_URL directly.
   */

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
    },
    meta: {
      titleSuffix: ' — CPI',
    },
  },

  collections: [
    // Content
    Properties,
    Posts,
    Pages,
    Team,
    Testimonials,
    // Sales
    ShopItems,
    Leads,
    // Taxonomies
    Cities,
    Amenities,
    Categories,
    // System
    Media,
    Users,
  ],

  globals: [SiteSettings, Navigation, HomePage],

  /**
   * Content localization, derived from the SAME registry that drives the
   * front-end routing (src/i18n/locales.ts). Adding Wolof there gives editors a
   * Wolof tab in the admin automatically — no change here.
   *
   * UI strings do NOT live here; they live in src/messages/*.json.
   * See CLAUDE.md → Internationalization rule 2.
   */
  localization: {
    locales: payloadLocales,
    defaultLocale,
    fallback: true,
  },

  // Admin panel chrome in French — CPI's editors work in French.
  i18n: {
    supportedLanguages: { fr, en },
    fallbackLanguage: 'fr',
  },

  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    /**
     * `push: false` everywhere, including development.
     *
     * With push enabled the CLI diffs the schema and prompts to confirm the
     * changes — in a non-interactive shell that hangs forever, which looks
     * exactly like a stuck migration. Worse, when it does run it applies the
     * diff directly and records a single `dev` row in payload_migrations, so
     * the real migration file is never marked applied and dev drifts away from
     * what production will actually execute.
     *
     * Schema changes go through `npm run migrate:create` + `npm run migrate`.
     */
    push: false,

    /**
     * Pending migrations run automatically when Payload initialises in
     * production. This is what makes a container deploy work against an empty
     * database: the runner image contains only the Next standalone bundle, not
     * the Payload CLI, so `payload migrate` cannot be shelled out to there.
     *
     * Importing the migrations here also means Next's dependency tracer pulls
     * them into that bundle — they ship with the app rather than needing a
     * separate copy step.
     *
     * In development this does nothing; migrations are applied explicitly with
     * `npm run migrate` so a schema change is a deliberate act.
     */
    prodMigrations: migrations,
  }),

  // Required for image resizing. Must also be present in the Docker runner
  // stage; Vercel provides it implicitly, Docker does not.
  sharp,

  secret: process.env.PAYLOAD_SECRET,

  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },

  graphQL: {
    disablePlaygroundInProduction: true,
  },
})
