import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

/**
 * Original rendered HTML from the live WordPress REST API, cached on disk.
 *
 * The markdown in content-audit/ is turndown output — good for humans to
 * review, wrong as an import source: feeding it to an HTML→Lexical converter
 * turns `**bold**` into literal asterisks in the body text. The REST API still
 * has the real HTML, so we take it from there and cache it so the import stays
 * reproducible (and re-runnable offline).
 */

const CACHE_DIR = path.resolve(process.cwd(), '.migration-cache/html')
const REST = 'https://cpi.sn/wp-json/wp/v2'

const ENDPOINT: Record<string, string> = {
  property: 'properties',
  post: 'posts',
  page: 'pages',
}

export async function rawHtml(type: keyof typeof ENDPOINT, id: number): Promise<string> {
  await mkdir(CACHE_DIR, { recursive: true })
  const file = path.join(CACHE_DIR, `${type}-${id}.html`)

  if (existsSync(file)) return readFile(file, 'utf8')

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${REST}/${ENDPOINT[type]}/${id}?_fields=content`, {
        headers: { 'User-Agent': 'Mozilla/5.0 cpi-migration' },
        signal: AbortSignal.timeout(45_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as { content?: { rendered?: string } }
      const html = json.content?.rendered ?? ''
      await writeFile(file, html)
      return html
    } catch (error) {
      if (attempt === 2) {
        console.warn(`    ⚠ raw HTML failed for ${type} ${id}: ${(error as Error).message}`)
        return ''
      }
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  return ''
}

/** Every image URL referenced inside a body — used to import inline media. */
export function imageUrls(html: string): string[] {
  const urls = new Set<string>()
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) urls.add(m[1])
  return [...urls].filter((u) => !u.startsWith('data:'))
}
