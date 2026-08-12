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

/** Reduce Elementor soup to the semantic subset Lexical understands. */
export function cleanHTML(html: string): string {
  if (!html?.trim()) return ''

  const dom = new JSDOM(`<body>${html}</body>`)
  const { document } = dom.window

  document
    .querySelectorAll('script, style, noscript, svg, iframe, form, button, input')
    .forEach((el) => el.remove())

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

/** Plain text from HTML — used for excerpts and SEO descriptions. */
export function htmlToText(html: string, maxLength?: number): string {
  if (!html?.trim()) return ''
  const dom = new JSDOM(`<body>${html}</body>`)
  dom.window.document.querySelectorAll('script, style').forEach((el) => el.remove())
  const text = (dom.window.document.body.textContent ?? '').replace(/\s+/g, ' ').trim()
  if (!maxLength || text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, '')}…`
}
