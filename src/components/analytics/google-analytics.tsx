import Script from 'next/script'

/**
 * Google Analytics 4 (gtag.js).
 *
 * Renders **nothing** until `GA_MEASUREMENT_ID` is set, so the site ships with
 * no third-party request and no cookie banner obligation until CPI actually has
 * a measurement ID. Set it in Dokploy and redeploy — there is no code change.
 *
 *     GA_MEASUREMENT_ID=G-XXXXXXXXXX
 *
 * Three deliberate choices:
 *
 *   - **`strategy="afterInteractive"`**, not `beforeInteractive`. gtag is ~90 KB
 *     over two requests and CPI's visitors are overwhelmingly on Senegalese
 *     mobile connections; blocking first paint on an analytics script would
 *     cost more real traffic than the measurement is worth.
 *   - **Read at runtime, not `NEXT_PUBLIC_`.** A measurement ID is not a secret
 *     — it ends up in the page source either way — but `NEXT_PUBLIC_*` is
 *     inlined at build time, and this image is built without it. Under that
 *     name CPI could paste the ID into Dokploy and never see a single hit.
 *     This component is a Server Component, so it puts the ID into the HTML
 *     itself; nothing needs it in the client bundle.
 *   - **The ID is validated** against the `G-…` shape. A pasted GTM container
 *     (`GTM-…`) or a Universal Analytics property (`UA-…`) silently measures
 *     nothing through this snippet, and "analytics is installed but empty" is a
 *     failure that takes weeks to notice.
 *
 * Client-side navigation is covered by GA4's Enhanced Measurement, which fires
 * `page_view` on History API changes and is on by default — so App Router route
 * changes are counted without a router listener here. If CPI ever turns that
 * setting off in the GA console, page views will flatten to first-load only and
 * this component needs a `usePathname` effect.
 *
 * If CPI later wants Tag Manager instead, that is a different snippet — do not
 * put a `GTM-` id in this variable and expect it to work.
 */
/** GA4 measurement IDs are `G-` followed by an alphanumeric property code. */
const IS_GA4 = (id: string) => /^G-[A-Z0-9]+$/i.test(id)

export function GoogleAnalytics() {
  // Read per render rather than at module scope, so the value is whatever the
  // running container has — not whatever existed when the module first loaded.
  const GA_ID = process.env.GA_MEASUREMENT_ID?.trim()
  if (!GA_ID) return null

  if (!IS_GA4(GA_ID)) {
    // Loud in the server log, silent on the page: a wrong id should be fixed,
    // not rendered.
    console.warn(
      `[analytics] GA_MEASUREMENT_ID="${GA_ID}" is not a GA4 measurement ID (expected G-XXXXXXXXXX). Analytics is disabled.`,
    )
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  )
}
