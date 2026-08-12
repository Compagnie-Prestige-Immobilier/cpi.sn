#!/usr/bin/env node
/**
 * Fails the build when a message catalog drifts from the French reference.
 *
 * CLAUDE.md rule 9: never ship a partially translated catalog silently. A
 * missing key must be a build error, not a raw `nav.about` rendered to a
 * visitor. Also catches the reverse — orphan keys left behind after a rename.
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const messagesDir = join(root, 'src', 'messages')

// Read the registry without importing TypeScript: pull the codes out of the
// `locales` array literal. Keeps this script dependency-free.
const registry = readFileSync(join(root, 'src', 'i18n', 'locales.ts'), 'utf8')
const activeBlock = registry
  .split('] as const satisfies')[0]
  .split('export const locales = [')[1]

const codes = [...activeBlock.matchAll(/^\s*\{\s*code:\s*'([^']+)'/gm)].map((m) => m[1])
const REFERENCE = 'fr'

if (!codes.includes(REFERENCE)) {
  fail(`Reference locale "${REFERENCE}" is not in the registry.`)
}

/** Flatten to dotted leaf paths so nesting differences surface too. */
function leafKeys(obj, prefix = '') {
  const out = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out.push(...leafKeys(value, path))
    } else {
      out.push(path)
    }
  }
  return out
}

function load(code) {
  const file = join(messagesDir, `${code}.json`)
  if (!existsSync(file)) {
    fail(`Locale "${code}" is in the registry but src/messages/${code}.json does not exist.`)
  }
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    fail(`src/messages/${code}.json is not valid JSON — ${error.message}`)
  }
}

function fail(message) {
  console.error(`\n  ✗ ${message}\n`)
  process.exit(1)
}

const reference = new Set(leafKeys(load(REFERENCE)))
let failed = false

for (const code of codes) {
  if (code === REFERENCE) continue

  const keys = new Set(leafKeys(load(code)))
  const missing = [...reference].filter((k) => !keys.has(k))
  const orphaned = [...keys].filter((k) => !reference.has(k))

  if (missing.length || orphaned.length) {
    failed = true
    console.error(`\n  ✗ ${code}.json is out of sync with ${REFERENCE}.json`)
    if (missing.length) {
      console.error(`\n    Missing ${missing.length} key(s):`)
      missing.forEach((k) => console.error(`      - ${k}`))
    }
    if (orphaned.length) {
      console.error(`\n    Orphaned ${orphaned.length} key(s) (not in ${REFERENCE}.json):`)
      orphaned.forEach((k) => console.error(`      + ${k}`))
    }
  } else {
    console.log(`  ✓ ${code}.json — ${keys.size} keys, in sync`)
  }
}

if (failed) {
  console.error('\n  Message catalogs must match fr.json exactly. See CLAUDE.md rule 9.\n')
  process.exit(1)
}

console.log(`\n  All ${codes.length} catalog(s) in sync (${reference.size} keys).\n`)
