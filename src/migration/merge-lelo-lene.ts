/**
 * Merges the two Lène entries in the Boutique into one.
 *
 *   npx tsx src/migration/merge-lelo-lene.ts
 *
 * "Léne" and "Lélo Sérère" are the same site listed twice, so they become
 * "Lélo Lène". One-off: once it has run, `seed-shop.ts` carries the merged
 * entry and this file is only a record of what happened.
 *
 * The photograph CPI supplied (`lene-22.webp`) replaces the old one because it
 * has no text burned into it — an aerial of the parcelled site itself. Most of
 * CPI's imagery is marketing artwork with the site name set across it, which is
 * exactly what these cards must not show.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { importLocalFile } from './media'

const KEEP = 'Léne'
const DROP = 'Lélo Sérère'
const MERGED = 'Lélo Lène'

async function main() {
  const payload = await getPayload({ config })

  const imagePath = path.resolve(process.cwd(), 'lene-22.webp')
  let imageId: number | null = null
  if (existsSync(imagePath)) {
    imageId = await importLocalFile(payload, imagePath, `Site de ${MERGED}, Thiès`)
    console.log(imageId ? `✓ imported lene-22.webp (media ${imageId})` : '⚠ image import returned nothing')
  } else {
    console.warn('⚠ lene-22.webp not found at the project root — keeping the existing photo')
  }

  const find = async (title: string) =>
    (
      await payload.find({
        collection: 'shop-items',
        where: { title: { equals: title } },
        limit: 1,
        locale: 'fr',
        overrideAccess: true,
      })
    ).docs[0]

  const keep = await find(KEEP)
  if (!keep) {
    console.error(`✗ "${KEEP}" not found — nothing to merge into.`)
    process.exit(1)
  }

  await payload.update({
    collection: 'shop-items',
    id: keep.id,
    locale: 'fr',
    overrideAccess: true,
    data: {
      title: MERGED,
      place: `${MERGED}, Thiès`,
      ...(imageId ? { image: imageId } : {}),
    },
  })
  console.log(`✓ "${KEEP}" renamed to "${MERGED}"`)

  const drop = await find(DROP)
  if (drop) {
    await payload.delete({ collection: 'shop-items', id: drop.id, overrideAccess: true })
    console.log(`✓ "${DROP}" removed (merged in)`)
  } else {
    console.log(`· "${DROP}" already gone`)
  }

  const remaining = await payload.find({
    collection: 'shop-items',
    where: { kind: { equals: 'terrain' } },
    limit: 100,
    locale: 'fr',
    overrideAccess: true,
  })
  console.log(`✓ ${remaining.totalDocs} land items remain`)
  process.exit(0)
}

main().catch((error) => {
  console.error('✗ merge failed:', error)
  process.exit(1)
})
