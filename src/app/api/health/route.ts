import { NextResponse } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

/**
 * Health check for Dokploy.
 *
 * Verifies the database is actually reachable rather than just returning 200
 * because the process is up — a container that boots but cannot reach Postgres
 * would otherwise keep serving broken pages. See CLAUDE.md → Deployment rule 7.
 */
export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.db.pool.query('SELECT 1')

    return NextResponse.json({ status: 'ok', database: 'up' })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'down',
        message: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 503 },
    )
  }
}
