#!/usr/bin/env node
/**
 * Fails the build if anything still points at the legacy WordPress install.
 *
 * cpi.sn will BE this application after cutover — the old site, its admin and
 * its uploads are gone for good (no source, no backups, no admin access). A
 * surviving reference is a permanently broken link or image, so this is a build
 * error rather than a warning.
 *
 * Scoped to application source: the content-audit/ and .migration-cache/
 * archives are supposed to contain legacy URLs — that is their whole purpose.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOTS = ['src', 'payload.config.ts', 'next.config.ts', 'docker-compose.yml', 'Dockerfile']
const SKIP_DIRS = new Set(['node_modules', '.next', 'migrations', 'migration'])
const EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.css', '.yml', '.yaml'])

// Migration tooling is *meant* to talk to the old site.
const ALLOW_FILES = [/src[\\/]migration[\\/]/]
const PATTERN = /https?:\/\/(www\.)?(cpi\.sn|i\d\.wp\.com|[^\s"']*houzez\.co)/i

const hits = []

function walk(path) {
  const st = statSync(path, { throwIfNoEntry: false })
  if (!st) return
  if (st.isDirectory()) {
    if (SKIP_DIRS.has(path.split(/[\\/]/).pop())) return
    for (const entry of readdirSync(path)) walk(join(path, entry))
    return
  }
  if (!EXT.has(extname(path))) return
  if (ALLOW_FILES.some((re) => re.test(path))) return

  readFileSync(path, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      const m = line.match(PATTERN)
      if (m) hits.push(`  ${path}:${i + 1}  ${m[0]}`)
    })
}

ROOTS.forEach(walk)

if (hits.length) {
  console.error('\n  ✗ Legacy WordPress references found in application source:\n')
  hits.forEach((h) => console.error(h))
  console.error('\n  cpi.sn becomes THIS app at cutover — the old site will not exist.')
  console.error('  Import the asset into Payload instead of linking to it.\n')
  process.exit(1)
}

console.log('  ✓ No legacy WordPress references in application source.')
