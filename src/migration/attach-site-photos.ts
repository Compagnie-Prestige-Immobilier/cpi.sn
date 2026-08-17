/**
 * Attaches the clean site photographs CPI supplied.
 *
 *   npx tsx src/migration/attach-site-photos.ts
 *
 * Replaces the marketing artwork that had the place name burned across it.
 * Updates both collections, because the two show the same sites: `shop-items`
 * drives the Boutique catalogue, `properties` drives /terrains and the header
 * menu.
 *
 * NOTE — `tassete.webp` is byte-identical to `thieo.webp` (same MD5). CPI could
 * not find a Tassette photograph and supplied the Thiéo one as a stand-in, so
 * those two cards show the same image by instruction, not by accident.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { importLocalFile } from './media'

const PHOTOS = [
  { file: 'sangalkam.webp', shop: 'Sangalkam', property: /sangalkam/i, alt: 'Site de Sangalkam, Rufisque' },
  { file: 'thieo.webp', shop: 'Thiéo', property: /thi[ée]o/i, alt: 'Site de Thiéo, Thiès' },
  { file: 'tassete.webp', shop: 'Tassette', property: /tassette/i, alt: 'Site de Tassette, Thiès' },
]

async function main() {
  const payload = await getPayload({ config })

  for (const photo of PHOTOS) {
    const filePath = path.resolve(process.cwd(), photo.file)
    if (!existsSync(filePath)) {
      console.warn(`⚠ ${photo.file} not found at the project root — skipped`)
      continue
    }

    const mediaId = await importLocalFile(payload, filePath, photo.alt)
    if (!mediaId) {
      console.warn(`⚠ ${photo.file} did not import — skipped`)
      continue
    }

    const shop = await payload.find({
      collection: 'shop-items',
      where: { title: { equals: photo.shop } },
      limit: 1,
      locale: 'fr',
      overrideAccess: true,
    })
    if (shop.docs[0]) {
      await payload.update({
        collection: 'shop-items',
        id: shop.docs[0].id,
        data: { image: mediaId },
        locale: 'fr',
        overrideAccess: true,
      })
    }

    // The matching listing, so /terrains and the header menu agree with the shop.
    const props = await payload.find({
      collection: 'properties',
      where: { productLine: { equals: 'foncier' } },
      limit: 100,
      locale: 'fr',
      overrideAccess: true,
    })
    const match = props.docs.find((p) => photo.property.test(p.title ?? ''))
    if (match) {
      await payload.update({
        collection: 'properties',
        id: match.id,
        data: { featuredImage: mediaId },
        locale: 'fr',
        overrideAccess: true,
      })
    }

    console.log(
      `✓ ${photo.file} → media ${mediaId} · shop:${shop.docs[0] ? '✓' : '—'} · listing:${match ? '✓' : '—'}`,
    )
  }

  process.exit(0)
}

main().catch((error) => {
  console.error('✗ attach failed:', error)
  process.exit(1)
})
