/**
 * Moves "Promotion immobilière" out of Nos services and into Terrains disponibles.
 *
 *   set -a && . ./.env && set +a && npx tsx src/migration/reorganise-nav.ts
 *
 * (the env has to be sourced by hand — tsx does not read .env, and
 * payload.config.ts throws on a missing PAYLOAD_SECRET)
 *
 * The same change is in `import.ts`, so a fresh import already produces this
 * shape. This script exists for databases that were seeded before it — it
 * rewrites the live `navigation` global in place rather than requiring a
 * re-import, which would touch every page.
 *
 * Idempotent: if the item is already under Terrains, it reports and exits.
 *
 * Note the Terrains menu had no children at all until now — its panel is built
 * from live inventory in `site-header.tsx`. That component renders the CMS
 * children underneath the generated list, so this move is all that is needed.
 */
import { getPayload } from 'payload'
import config from '../../payload.config'

const MOVED = 'promotion-immobiliere'
const SERVICES = '/nos-services'
const LAND = '/terrains'

async function main() {
  const payload = await getPayload({ config })
  const nav = await payload.findGlobal({ slug: 'navigation', locale: 'fr', overrideAccess: true })

  const header = nav.header ?? []
  const services = header.find((i) => i.href === SERVICES)
  const landItem = header.find((i) => i.href === LAND)

  if (!services || !landItem) {
    console.error('✗ could not find both "Nos services" and "Terrains disponibles" in the header')
    process.exit(1)
  }

  const moved = (services.children ?? []).find((c) => (c.href ?? '').includes(MOVED))
  if (!moved) {
    const already = (landItem.children ?? []).some((c) => (c.href ?? '').includes(MOVED))
    console.log(already ? '✓ already moved — nothing to do' : `✗ no ${MOVED} child under Nos services`)
    process.exit(already ? 0 : 1)
  }

  // Rebuilt rather than mutated: Payload rewrites the whole array on save, and
  // carrying the old row ids across a reparent leaves orphans in the join table.
  const next = header.map((item) => {
    if (item.href === SERVICES) {
      return {
        ...item,
        children: (item.children ?? []).filter((c) => !(c.href ?? '').includes(MOVED)),
      }
    }
    if (item.href === LAND) {
      return {
        ...item,
        children: [...(item.children ?? []), { label: moved.label, href: moved.href }],
      }
    }
    return item
  })

  await payload.updateGlobal({
    slug: 'navigation',
    data: { header: next },
    locale: 'fr',
    overrideAccess: true,
  })

  console.log(`✓ "${moved.label}" moved from Nos services to Terrains disponibles`)
  process.exit(0)
}

main().catch((error) => {
  console.error('✗ reorganise-nav failed:', error)
  process.exit(1)
})
