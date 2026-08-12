import { JSDOM } from 'jsdom'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { Payload } from 'payload'

/**
 * WordPress/Elementor HTML → Lexical.
 *
 * The source HTML is Elementor output: hundreds of nested divs carrying
 * `elementor-*` classes with the real content buried inside. Feeding that
 * straight to the converter produces a document full of empty paragraphs, so we
 * strip the scaffolding to semantic HTML first.
 */

let cachedConfig: Awaited<ReturnType<typeof editorConfigFactory.default>> | null = null

async function getEditorConfig(payload: Payload) {
  cachedConfig ??= await editorConfigFactory.default({ config: payload.config })
  return cachedConfig
}

/** Every image URL in a body, before the images are stripped. */
export function extractImages(html: string): string[] {
  if (!html?.trim()) return []
  const dom = new JSDOM(`<body>${html}</body>`)
  const urls = new Set<string>()
  dom.window.document.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') ?? img.getAttribute('data-src')
    if (src && !src.startsWith('data:')) urls.add(src)
  })
  return [...urls]
}

/**
 * Reduce Elementor soup to the semantic subset Lexical understands.
 *
 * Also severs every tie to the legacy WordPress install: `<img>` is removed
 * (the caller imports those into Payload separately) and absolute cpi.sn links
 * are rewritten to internal paths. After cutover the old site is gone — any URL
 * pointing at it is a dead link, and any remote `<img>` is a lost image.
 */
export function cleanHTML(html: string): string {
  if (!html?.trim()) return ''

  const dom = new JSDOM(`<body>${html}</body>`)
  const { document } = dom.window

  document
    .querySelectorAll('script, style, noscript, svg, iframe, form, button, input, img, picture, source')
    .forEach((el) => el.remove())

  // Links: rewrite legacy absolutes to paths, drop anything unusable so the
  // Lexical link node validator does not reject the whole document.
  document.querySelectorAll('a').forEach((a) => {
    let href = (a.getAttribute('href') ?? '').trim()

    // Houzez demo-site links: dead before the migration, dead after. Some are
    // doubled up (`https://demo40.houzez.co/https://cpi.sn/construction/`),
    // so recover the real target where there is one.
    const doubled = href.match(/https?:\/\/[^/]*houzez\.co\/(https?:\/\/.+)$/i)
    if (doubled) href = doubled[1]
    if (/(^|\.)houzez\.co/i.test(href) || /^https?:\/\/(demo|studio)\d*\./i.test(href)) {
      a.replaceWith(...a.childNodes) // keep the text, drop the dead link
      return
    }

    const internal = href.replace(/^https?:\/\/(www\.)?cpi\.sn/i, '')
    const usable =
      internal.startsWith('/') ||
      /^https?:\/\//i.test(internal) ||
      /^(mailto|tel):/i.test(internal)

    if (!usable) {
      a.replaceWith(...a.childNodes) // keep the text, drop the broken link
      return
    }
    a.setAttribute('href', internal || '/')
  })

  // Unwrap layout containers, keeping their children.
  let guard = 0
  while (guard++ < 50) {
    const wrappers = [...document.querySelectorAll('div, section, span, article, header, footer, aside, figure')]
    if (!wrappers.length) break
    wrappers.forEach((el) => el.replaceWith(...el.childNodes))
  }

  // Drop presentational attributes — they mean nothing in Lexical.
  document.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (!['href', 'src', 'alt', 'title'].includes(attr.name)) el.removeAttribute(attr.name)
    }
  })

  // Elementor emits a lot of &nbsp;-only paragraphs.
  document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li').forEach((el) => {
    if (!el.textContent?.replace(/ |\s/g, '')) el.remove()
  })

  return document.body.innerHTML.replace(/\s{2,}/g, ' ').trim()
}

/** Convert cleaned HTML into a Lexical editor state. */
export async function htmlToLexical(payload: Payload, html: string) {
  const cleaned = cleanHTML(html)
  if (!cleaned) return emptyLexical()

  return convertHTMLToLexical({
    editorConfig: await getEditorConfig(payload),
    html: cleaned,
    JSDOM,
  })
}

/** Lexical requires a valid root even when there is no content. */
export function emptyLexical() {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [],
          direction: null,
          format: '' as const,
          indent: 0,
        },
      ],
      direction: null,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

/**
 * Real text inside a Lexical tree.
 *
 * Must walk the node graph and read `text` leaves — running a regex over
 * JSON.stringify() matches key names like "paragraph" and reports every empty
 * document as non-empty.
 */
export function lexicalText(state: unknown): string {
  const out: string[] = []
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    const n = node as { text?: unknown; children?: unknown[]; root?: unknown }
    if (typeof n.text === 'string') out.push(n.text)
    if (n.root) walk(n.root)
    if (Array.isArray(n.children)) n.children.forEach(walk)
  }
  walk(state)
  return out.join(' ').trim()
}

/** Plain text from HTML — used for excerpts and SEO descriptions. */
export function htmlToText(html: string, maxLength?: number): string {
  if (!html?.trim()) return ''
  const dom = new JSDOM(`<body>${html}</body>`)
  dom.window.document.querySelectorAll('script, style').forEach((el) => el.remove())
  const text = (dom.window.document.body.textContent ?? '').replace(/\s+/g, ' ').trim()
  if (!maxLength || text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, '')}…`
}
