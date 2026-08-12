import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

// Next 16 renamed the `middleware` file convention to `proxy`. next-intl still
// exports it under the old name — only the file name changed.
export default createMiddleware(routing)

export const config = {
  /**
   * Run on every page route, but never on:
   *   - /api      → Payload REST + our route handlers
   *   - /admin    → Payload admin UI (it has its own locale handling)
   *   - /_next    → build output
   *   - /media    → uploaded files served from the mounted volume
   *   - anything with a file extension (favicon, robots.txt, images…)
   *
   * Locale-prefixing Payload's routes would break the admin panel entirely.
   */
  matcher: '/((?!api|admin|_next|_vercel|media|.*\\..*).*)',
}
