/**
 * Builds the prefilled WhatsApp message for a cart handoff.
 *
 * `wa.me` URLs truncate silently somewhere past ~2 000 characters — the
 * message just arrives cut in half, with no error. So a long selection sends a
 * summary plus the lead reference, which resolves to the full list in the
 * admin. See CLAUDE.md → Cart.
 */

/** Conservative: real-world clients start mangling links well before 2 048. */
const MAX_URL_LENGTH = 1800

export type CartLine = {
  title: string
  details: string
}

export function buildWhatsAppMessage({
  intro,
  lines,
  referenceLabel,
  truncatedLabel,
  contactLine,
}: {
  intro: string
  lines: CartLine[]
  referenceLabel: string
  /** Called with the number of lines that had to be dropped. */
  truncatedLabel: (count: number) => string
  contactLine?: string
}): string {
  const render = (visible: CartLine[], dropped: number) =>
    [
      intro,
      ...visible.map((l) => `• ${l.title}${l.details ? ` — ${l.details}` : ''}`),
      dropped > 0 ? truncatedLabel(dropped) : null,
      contactLine || null,
      referenceLabel,
    ]
      .filter(Boolean)
      .join('\n')

  // Drop lines from the end until the encoded URL fits.
  for (let visible = lines.length; visible >= 0; visible--) {
    const message = render(lines.slice(0, visible), lines.length - visible)
    if (encodeURIComponent(message).length <= MAX_URL_LENGTH) return message
  }

  // Even the header alone is too long — should be impossible, but never emit a
  // truncated-mid-word message.
  return [intro, referenceLabel].join('\n')
}

export function whatsAppUrl(phone: string, message: string): string {
  // Digits only: wa.me rejects '+', spaces and dashes.
  const number = phone.replace(/\D/g, '')
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
