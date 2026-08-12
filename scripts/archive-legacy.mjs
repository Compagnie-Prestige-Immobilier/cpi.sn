#!/usr/bin/env node
/**
 * Mirrors the ENTIRE legacy WordPress media library to disk.
 *
 * CPI has no WordPress admin, no source and no backups — only the domain. Once
 * cpi.sn points at this app, anything not already copied is gone permanently.
 * The site import only pulls images that are *referenced*; this grabs the rest
 * so nothing is lost if CPI later asks for a photo we never wired up.
 *
 *   node scripts/archive-legacy.mjs [--dry]
 */
import { mkdir, writeFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('legacy-archive/uploads')
const DRY = process.argv.includes('--dry')
const REST = 'https://cpi.sn/wp-json/wp/v2/media'

const items = []
for (let page = 1; page <= 20; page++) {
  const res = await fetch(`${REST}?per_page=100&page=${page}&_fields=id,source_url,mime_type,title`, {
    headers: { 'User-Agent': 'cpi-archive' },
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) break
  const batch = await res.json()
  if (!Array.isArray(batch) || !batch.length) break
  items.push(...batch)
  if (batch.length < 100) break
}
console.log(`Legacy media library: ${items.length} items`)

if (DRY) {
  const byType = items.reduce((a, i) => ((a[i.mime_type] = (a[i.mime_type] || 0) + 1), a), {})
  console.log(byType)
  process.exit(0)
}

await mkdir(OUT, { recursive: true })
let saved = 0, skipped = 0, failed = 0

for (const item of items) {
  const url = item.source_url
  if (!url) continue
  // Preserve the WordPress path so the archive mirrors the original layout.
  const rel = new URL(url).pathname.replace(/^\/wp-content\/uploads\//, '')
  const dest = path.join(OUT, rel)

  if (existsSync(dest)) { skipped++; continue }

  try {
    await mkdir(path.dirname(dest), { recursive: true })
    const res = await fetch(url, { headers: { 'User-Agent': 'cpi-archive' }, signal: AbortSignal.timeout(60_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await writeFile(dest, Buffer.from(await res.arrayBuffer()))
    saved++
    if (saved % 50 === 0) process.stdout.write(`\r  saved ${saved}…`)
  } catch (error) {
    failed++
    console.warn(`\n  ⚠ ${url} — ${error.message}`)
  }
}

await writeFile(
  path.resolve('legacy-archive/manifest.json'),
  JSON.stringify({ archivedAt: new Date().toISOString(), count: items.length, items }, null, 1),
)

const size = await stat(OUT).catch(() => null)
console.log(`\n✓ archived ${saved} new · ${skipped} already present · ${failed} failed`)
console.log(`  → legacy-archive/uploads (+ manifest.json)`)
