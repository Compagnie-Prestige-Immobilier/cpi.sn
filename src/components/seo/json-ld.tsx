/**
 * Renders a schema.org graph into the document.
 *
 * `<` is escaped to `<` before it reaches the DOM. JSON-LD sits inside a
 * `<script>` element whose contents are *not* HTML-parsed, so a `</script>`
 * sequence appearing inside any CMS string — a page title, a property
 * description — would close the tag early and inject the remainder as markup.
 * `JSON.stringify` does not escape it, and this is the one place where CMS text
 * reaches a raw `dangerouslySetInnerHTML`.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
