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
    remotePatterns: [
      // Only needed while migrating media off the old WordPress install.
      // Remove once the import in phase 3 has completed.
      { protocol: 'https', hostname: 'cpi.sn' },
      { protocol: 'https', hostname: 'i0.wp.com' },
    ],
  },

  // The purchased HTML template and the content audit are reference material,
  // not application code — keep them out of the build graph.
  outputFileTracingExcludes: {
    '*': ['./ombarahtml-10/**', './content-audit/**'],
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
