/**
 * The reference grid the designer reviews against.
 *
 * Every section carries a stable DOM id (`s1`, `s2`, …) and every addressable
 * block inside it a sub-id (`s1-a`, `s1-b`, …), so feedback can be written as
 * "section 3.b" and land unambiguously. The badge simply makes those ids
 * readable on screen instead of only in devtools.
 *
 * Visible by default; `?ids=off` hides every badge while leaving the ids in the
 * markup, so the same URL doubles as a clean preview.
 */
export function SectionMarker({
  id,
  show,
  sub = false,
}: {
  id: string
  show: boolean
  sub?: boolean
}) {
  if (!show) return null

  return (
    <span aria-hidden className={`tpl-marker${sub ? ' tpl-marker-sub' : ''}`}>
      {id.replace(/^s/, '').replace('-', '.')}
    </span>
  )
}
