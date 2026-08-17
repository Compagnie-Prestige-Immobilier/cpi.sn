/**
 * Swaps in the portrait of the Administratrice Générale that CPI supplied.
 *
 *   npx tsx src/migration/set-ag-portrait.ts
 *
 * Replaces the earlier `founder.webp`, which was a still lifted from the video.
 * The `founder` group on the `home-page` global is the single record behind
 * both the homepage video block and the À propos introduction, so this one
 * change lands on both.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { importLocalFile } from './media'

async function main() {
  const payload = await getPayload({ config })

  const file = path.resolve(process.cwd(), 'AG.png')
  if (!existsSync(file)) {
    console.error('✗ AG.png not found at the project root')
    process.exit(1)
  }

  const id = await importLocalFile(payload, file, 'Aminata Sall SY, Fondatrice & Administratrice Générale de CPI')
  if (!id) {
    console.error('✗ import returned nothing')
    process.exit(1)
  }

  const home = await payload.findGlobal({ slug: 'home-page', locale: 'fr' })
  await payload.updateGlobal({
    slug: 'home-page',
    locale: 'fr',
    overrideAccess: true,
    data: { founder: { ...home.founder, portrait: id } },
  })
  console.log(`✓ AG.png imported as media ${id} and set as the founder portrait`)
  process.exit(0)
}

main().catch((e) => { console.error('✗', e); process.exit(1) })
