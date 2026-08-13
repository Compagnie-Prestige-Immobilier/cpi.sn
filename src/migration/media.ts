import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import type { Payload } from 'payload'

/**
 * Imports images from the live WordPress install into Payload.
 *
 * Two layers of caching, both load-bearing on a ~500-image import:
 *   1. On disk — a re-run does not re-download. Migrations get run more than
 *      once in practice (mapping tweaks, schema fixes).
 *   2. In memory — the same URL referenced by ten listings uploads once.
 *
 * WordPress derivative suffixes (`-300x200`, `-scaled`) are stripped so we pull
 * the original and let Payload/sharp generate its own sizes.
 */

const CACHE_DIR = path.resolve(process.cwd(), '.migration-cache/media')
const urlToId = new Map<string, number>()

let downloaded = 0
let cacheHits = 0
let failures = 0

export function mediaStats() {
  return { downloaded, cacheHits, failures, unique: urlToId.size }
}

/** Prefer the original over WordPress' resized derivatives. */
export function normalizeUrl(raw: string): string {
  let url = raw.split('?')[0].trim()
  url = url.replace(/-\d{2,4}x\d{2,4}(?=\.[a-z]{3,4}$)/i, '')
  // Jetpack CDN mirrors: i0.wp.com/cpi.sn/... → cpi.sn/...
  url = url.replace(/^https?:\/\/i\d\.wp\.com\//i, 'https://')
  if (url.startsWith('//')) url = `https:${url}`
  return url
}

async function fetchToCache(url: string): Promise<string | null> {
  await mkdir(CACHE_DIR, { recursive: true })

  const ext = (path.extname(new URL(url).pathname) || '.jpg').slice(0, 5)
  const file = path.join(CACHE_DIR, createHash('sha1').update(url).digest('hex') + ext)

  if (existsSync(file)) {
    cacheHits++
    return file
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 cpi-migration' },
        signal: AbortSignal.timeout(45_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 100) throw new Error('suspiciously small response')
      await writeFile(file, buf)
      downloaded++
      return file
    } catch (error) {
      if (attempt === 2) {
        failures++
        console.warn(`    ⚠ media failed: ${url} — ${(error as Error).message}`)
        return null
      }
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  return null
}

/**
 * Import one image and return its Payload media ID.
 * Returns null when the download fails — callers must tolerate a missing image
 * rather than aborting the whole migration for one dead URL.
 */
export async function importImage(
  payload: Payload,
  rawUrl: string,
  alt: string,
): Promise<number | null> {
  if (!rawUrl) return null
  const url = normalizeUrl(rawUrl)

  const cached = urlToId.get(url)
  if (cached) return cached

  const file = await fetchToCache(url)
  if (!file) return null

  try {
    /**
     * Upload with a filename derived from the ORIGINAL URL, not the hashed
     * cache path. Passing `filePath` would name every file after its sha1,
     * which is unreadable in the admin and worthless for image SEO —
     * `terrain-ngolfagnick.jpg` beats `d3ce2e77….jpg` in Google Images.
     */
    const doc = await payload.create({
      collection: 'media',
      data: {
        alt: alt || path.basename(url, path.extname(url)).replace(/[-_]/g, ' '),
        // Dedupe key across re-runs, and useful provenance afterwards.
        sourceUrl: url,
      },
      file: {
        data: await readFile(file),
        name: friendlyName(url),
        mimetype: mimeFor(url),
        size: (await stat(file)).size,
      },
      overrideAccess: true,
    })
    urlToId.set(url, doc.id as number)
    return doc.id as number
  } catch (error) {
    failures++
    console.warn(`    ⚠ media upload failed: ${url} — ${(error as Error).message}`)
    return null
  }
}

/**
 * Import a file from disk (not from the legacy site).
 *
 * Used for assets CPI supplies directly — e.g. the founder's portrait. Deduped
 * on `sourceUrl` like everything else, using a `file://` key so a re-run
 * updates rather than piling up copies.
 */
export async function importLocalFile(
  payload: Payload,
  filePath: string,
  alt: string,
): Promise<number | null> {
  const key = `file://${path.basename(filePath)}`

  const cached = urlToId.get(key)
  if (cached) return cached

  const existing = await payload.find({
    collection: 'media',
    where: { sourceUrl: { equals: key } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    urlToId.set(key, existing.docs[0].id as number)
    return existing.docs[0].id as number
  }

  try {
    const ext = path.extname(filePath).toLowerCase()
    const doc = await payload.create({
      collection: 'media',
      data: { alt, sourceUrl: key },
      file: {
        data: await readFile(filePath),
        name: path.basename(filePath),
        mimetype: MIME[ext] ?? 'image/jpeg',
        size: (await stat(filePath)).size,
      },
      overrideAccess: true,
    })
    urlToId.set(key, doc.id as number)
    return doc.id as number
  } catch (error) {
    failures++
    console.warn(`    ⚠ local upload failed: ${filePath} — ${(error as Error).message}`)
    return null
  }
}

/** Seed the in-memory cache from media already in the database (idempotent re-runs). */
export async function primeMediaCache(payload: Payload) {
  const existing = await payload.find({ collection: 'media', limit: 2000, overrideAccess: true })
  for (const doc of existing.docs) {
    const source = (doc as { sourceUrl?: string }).sourceUrl
    if (source) urlToId.set(source, doc.id as number)
  }
}

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
}

function mimeFor(url: string): string {
  return MIME[path.extname(new URL(url).pathname).toLowerCase()] ?? 'image/jpeg'
}

/** Readable, URL-safe filename from the source URL. */
function friendlyName(url: string): string {
  const base = path.basename(new URL(url).pathname)
  const ext = path.extname(base) || '.jpg'
  const stem = decodeURIComponent(path.basename(base, ext))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 70)
  return `${stem || 'image'}${ext.toLowerCase()}`
}
