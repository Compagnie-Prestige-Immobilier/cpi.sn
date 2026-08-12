import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Required for the Docker runtime image: ships only traced dependencies
  // (~200 MB instead of ~1.2 GB). See CLAUDE.md → Deployment.
  output: 'standalone',

  /**
   * Explicitly false. This is Next's default, but it is also the first switch
   * people reach for when a deploy is blocked — and flipping it lets a type
   * error reach production silently. Stated here so turning it on is a visible,
   * deliberate change in review rather than an invisible default.
   *
   * (Next 16 removed the `eslint` config key along with built-in `next lint`;
   * linting runs separately.)
   */
  typescript: { ignoreBuildErrors: false },

  images: {
    formats: ['image/avif', 'image/webp'],
    // No remotePatterns, deliberately. Every image is served from Payload's
    // own media volume. The legacy WordPress install disappears at cutover —
    // cpi.sn will be THIS app — so any remote reference to it would be a dead
    // image with no way to recover the original. Allowing the old host here
    // would let such a reference slip in unnoticed.
  },

  // The purchased HTML template and the content audit are reference material,
  // not application code — keep them out of the build graph.
  outputFileTracingExcludes: {
    '*': ['./ombarahtml-10/**', './content-audit/**'],
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
