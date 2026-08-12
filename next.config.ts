import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Required for the Docker runtime image: ships only traced dependencies
  // (~200 MB instead of ~1.2 GB). See CLAUDE.md → Deployment.
  output: 'standalone',

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
