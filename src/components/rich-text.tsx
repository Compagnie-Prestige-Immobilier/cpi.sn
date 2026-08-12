import {
  RichText as PayloadRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { CmsLink } from '@/components/ui/cms-link'

/**
 * Lexical → React.
 *
 * Typography lives here rather than in a global stylesheet: the migrated bodies
 * are the only rich text on the site, and keeping the rules scoped stops them
 * leaking into component markup.
 *
 * Links go through `CmsLink` so an editor's `/terrains` resolves to `/en/land`
 * for English visitors instead of dropping them on the French URL.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const url = node.fields?.url ?? ''
    return (
      <CmsLink href={url} className="text-brand underline underline-offset-2 hover:text-brand-hover">
        {children}
      </CmsLink>
    )
  },
})

export function RichText({
  data,
  className = '',
}: {
  data?: SerializedEditorState | null
  className?: string
}) {
  if (!data) return null

  return (
    <div
      className={[
        // Base rhythm
        'max-w-none text-base/7 text-foreground-muted',
        '[&>*+*]:mt-5',
        // Headings inherit the serif face used everywhere else
        '[&_h2]:mt-12 [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:leading-tight [&_h2]:text-foreground',
        '[&_h3]:mt-10 [&_h3]:font-heading [&_h3]:text-2xl [&_h3]:text-foreground',
        '[&_h4]:mt-8 [&_h4]:font-heading [&_h4]:text-xl [&_h4]:text-foreground',
        '[&_strong]:font-semibold [&_strong]:text-foreground',
        // Logical padding so an RTL locale stays cheap to add
        '[&_ul]:list-disc [&_ul]:ps-6 [&_ol]:list-decimal [&_ol]:ps-6',
        '[&_li]:mt-2 [&_li]:marker:text-brand',
        '[&_blockquote]:border-s-2 [&_blockquote]:border-brand-border [&_blockquote]:ps-5 [&_blockquote]:italic',
        '[&_hr]:my-10 [&_hr]:border-subtle',
        '[&_img]:rounded-lg',
        className,
      ].join(' ')}
    >
      <PayloadRichText data={data} converters={converters} />
    </div>
  )
}
