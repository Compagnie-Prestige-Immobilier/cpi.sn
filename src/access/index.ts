import type { Access } from 'payload'

/** Signed-in staff (admin or editor). */
export const isStaff: Access = ({ req: { user } }) => Boolean(user)

/** Administrators only. */
export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

/** Public read. Used for published marketing content. */
export const isPublic: Access = () => true

/**
 * Published content is public; drafts are visible to staff only.
 *
 * Without this, Payload's REST API would happily serve unpublished drafts to
 * anyone who guessed the endpoint — a listing CPI hasn't announced yet would
 * leak.
 */
export const isPublishedOrStaff: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    _status: { equals: 'published' },
  }
}
