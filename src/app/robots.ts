import type { MetadataRoute } from 'next'

import { absoluteUrl, IS_PLACEHOLDER_ORIGIN, SITE_ORIGIN } from '@/lib/seo'

/**
 * robots.txt.
 *
 * The disallow list is the set of URLs that are real but worthless to a
 * crawler — not a security boundary. Anything genuinely private is protected by
 * Payload's access control; robots.txt is a public file and listing a secret in
 * it advertises the secret.
 *
 * `IS_PLACEHOLDER_ORIGIN` blocks everything when `SITE_URL` has
 * not been set. Without that guard a preview deploy that inherits the default
 * happily invites Google to index a staging copy under a localhost sitemap —
 * duplicate content against cpi.sn, which is the one thing this rebuild cannot
 * afford given the French ranking it is trying to preserve.
 *
 * **`force-dynamic` below is load-bearing, not boilerplate.** `docker build`
 * runs with no `SITE_URL` — the Dockerfile passes only placeholder secrets and
 * never reaches the database. Prerendered, this file would be frozen at build
 * time with the localhost fallback, i.e. the `Disallow: /` branch: the
 * production container would then serve a robots.txt banning every crawler,
 * permanently, no matter what Dokploy sets at runtime, and nothing else about
 * the site would look wrong.
 *
 * Next reports this route as `ƒ` in the build output. If it ever shows as `○`
 * (Static), that regression is back.
 */
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  if (IS_PLACEHOLDER_ORIGIN) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin', // Payload
          '/api/', // REST + the enquiry endpoint
          '/ma-selection', // client-side basket: empty for every crawler
          '/en/my-selection',
          '/es/mi-seleccion',
          // Archived homepages. They are already `noindex`, but a crawler has
          // to fetch a page to learn that, and these two are heavy.
          '/accueil-v1',
          '/accueil-v2',
          '/en/home-v1',
          '/en/home-v2',
          '/es/inicio-v1',
          '/es/inicio-v2',
          '/*?ids=', // the designer's section-id toggle — same page, new URL
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_ORIGIN,
  }
}
