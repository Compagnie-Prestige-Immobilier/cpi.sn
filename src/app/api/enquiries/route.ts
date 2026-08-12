import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { defaultLocale, isLocale } from '@/i18n/locales'

export const dynamic = 'force-dynamic'

/**
 * Public endpoint for contact forms and cart enquiries.
 *
 * Lives at /api/enquiries, NOT /api/leads. A static route at /api/leads would
 * shadow Payload's own `/api/[...slug]` REST handler for the `leads`
 * collection — Next resolves the more specific path first — and the admin's
 * Demandes list, which reads that endpoint, would 405.
 *
 * The `leads` collection itself stays closed to anonymous writes — this handler
 * uses the Local API with `overrideAccess`, so the REST endpoint is never open
 * to drive-by spam while the site's own forms still work
 * (see src/collections/Leads.ts).
 *
 * Returns the created reference so the caller can put it in the WhatsApp
 * message. The lead is persisted BEFORE the client opens WhatsApp — if the
 * visitor abandons the conversation, CPI still has the enquiry. That ordering
 * is the commercial point of the feature; do not "optimise" it away.
 */

type Body = {
  type?: 'form' | 'cart'
  name?: string
  phone?: string
  email?: string
  message?: string
  items?: number[]
  source?: string
  locale?: string
  /** Honeypot — must stay empty. */
  company?: string
}

/**
 * Naive per-IP throttle. Enough to stop a script hammering the endpoint;
 * genuine abuse protection belongs at the proxy. In-memory, so it resets on
 * redeploy — acceptable for a single-replica deployment (CLAUDE.md → Deployment).
 */
const RATE_LIMIT = { windowMs: 60_000, max: 5 }
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
  recent.push(now)
  hits.set(ip, recent)

  // Keep the map from growing without bound on a long-lived process.
  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < RATE_LIMIT.windowMs)) hits.delete(key)
    }
  }
  return recent.length > RATE_LIMIT.max
}

export async function POST(request: NextRequest) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // Silently accept the honeypot: telling a bot it failed just teaches it.
  if (body.company) {
    return NextResponse.json({ ok: true, reference: null })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const name = body.name?.trim()
  const phone = body.phone?.trim()

  if (!name || !phone) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }
  if (name.length > 200 || (body.message?.length ?? 0) > 5_000) {
    return NextResponse.json({ error: 'too_long' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config })

    const lead = await payload.create({
      collection: 'leads',
      data: {
        type: body.type === 'cart' ? 'cart' : 'form',
        status: 'nouveau',
        name,
        phone,
        email: body.email?.trim() || undefined,
        message: body.message?.trim() || undefined,
        items: Array.isArray(body.items) ? body.items.slice(0, 50) : undefined,
        source: body.source?.slice(0, 200),
        locale: isLocale(body.locale ?? '') ? body.locale : defaultLocale,
      },
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true, reference: lead.reference })
  } catch (error) {
    console.error('[leads] create failed:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
