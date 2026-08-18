/**
 * Empties the contact page's imported body.
 *
 *   set -a && . ./.env && set +a && npx tsx src/migration/clean-contact-page.ts
 *
 * (the env has to be sourced by hand — tsx does not read .env, and
 * payload.config.ts throws on a missing PAYLOAD_SECRET)
 *
 * The page is now composed in `src/app/(site)/[locale]/contact/page.tsx` from
 * `site-settings`, so the WordPress body underneath it is not just redundant —
 * it renders below the new layout and contradicts it. It carried:
 *
 *   - "Contactez-nous" as an <h1>, twice, under a page already titled Contact
 *   - the office address three times, in two different spellings
 *   - the social networks as the plain sentence "Facebook Twitter Youtube …"
 *   - commercial@cpi.sn and marketing@cpi.sn, which CPI has retired in favour
 *     of contact@cpi.sn — the reason this script exists at all
 *
 * Version rows are deleted too, not just the published document. They are the
 * import's own autosaves, never CPI's edits, and leaving them would keep both
 * addresses one "restore" away — and inside the seed dump that ships to
 * production. The page's title, slug and SEO are untouched.
 *
 * Idempotent: with no blocks left it reports and exits.
 */
import { getPayload } from 'payload'
import config from '../../payload.config'

const STALE_EMAILS = ['commercial@cpi.sn', 'marketing@cpi.sn']

async function main() {
  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'contactez-nous' } },
    limit: 1,
    locale: 'fr',
    depth: 0,
    overrideAccess: true,
  })

  const page = found.docs[0]
  if (!page) {
    console.error('✗ contact page not found (slug: contactez-nous)')
    process.exit(1)
  }

  const blocks = page.blocks ?? []
  if (!blocks.length) {
    console.log('✓ already clean — no blocks on the contact page')
    process.exit(0)
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { blocks: [] },
    locale: 'fr',
    draft: false,
    overrideAccess: true,
  })

  // Payload has no API for discarding version history, so this is raw SQL. The
  // cascade on `_pages_v` clears the block and locale rows that hang off it.
  const db = payload.db.drizzle
  await db.execute(`DELETE FROM _pages_v WHERE parent_id = ${Number(page.id)}`)

  console.log(`✓ contact page emptied — ${blocks.length} imported block(s) and their versions removed`)
  console.log(`  retired: ${STALE_EMAILS.join(', ')} → contact@cpi.sn (site-settings)`)
  process.exit(0)
}

main().catch((error) => {
  console.error('✗ clean-contact-page failed:', error)
  process.exit(1)
})
