/**
 * Houzez taxonomy → CPI schema.
 *
 * The old site had 17 `property_type` terms and 4 `property_status` terms that
 * overlapped heavily: a listing could be tagged `Programme Immobilier – Réalisé`
 * AND `Projets déjà réalisés` AND `Nos Realisations`, three labels meaning the
 * same thing. Those collapse into three orthogonal axes.
 *
 * Every rule here is derived from the 42 real listings in
 * content-audit/_data/properties.json — see MAPPING.md for the audit table.
 */

export type ProductLine = 'foncier' | 'immobilier'
export type Kind = 'terrain' | 'villa' | 'appartement' | 'immeuble' | 'bureau' | 'commerce'
export type Availability = 'disponible' | 'en-cours' | 'realise' | 'vendu' | 'a-louer'

/** Old type terms that carry a *business line* signal. */
const PRODUCT_LINE_BY_TYPE: Record<string, ProductLine> = {
  'Programme Foncier – En cours': 'foncier',
  'Programme Foncier – Réalisé': 'foncier',
  'Terrain': 'foncier',
  'Programme Immobilier – Réalisé': 'immobilier',
  'Programme Immobilier - En cours': 'immobilier',
  'Appartement': 'immobilier',
  'Villa': 'immobilier',
  'Résidentiel': 'immobilier',
  'Studio': 'immobilier',
  'Bureau': 'immobilier',
  'Boutique': 'immobilier',
  'Commercial': 'immobilier',
}

/** Old type terms that carry a *physical kind* signal. */
const KIND_BY_TYPE: Record<string, Kind> = {
  'Terrain': 'terrain',
  'Programme Foncier – En cours': 'terrain',
  'Programme Foncier – Réalisé': 'terrain',
  'Villa': 'villa',
  'Appartement': 'appartement',
  'Studio': 'appartement',
  'Bureau': 'bureau',
  'Boutique': 'commerce',
  'Commercial': 'commerce',
}

/**
 * Terms that carry NO information and are dropped entirely.
 * They duplicate the lifecycle already encoded in `availability`.
 */
export const DROPPED_TYPES = [
  'Nos Realisations',
  'Projets déjà réalisés',
  'Projets en cours',
  'nos-realisation',
  'projets-deja-realises',
  'projets-en-cours',
]

const has = (types: string[], needle: string) =>
  types.some((t) => t.toLowerCase().includes(needle.toLowerCase()))

export function mapProductLine(types: string[], title: string): ProductLine {
  for (const t of types) {
    const line = PRODUCT_LINE_BY_TYPE[t]
    if (line) return line
  }
  // Fall back to the title: "lotissement" and "terrain" are unambiguous.
  if (/lotissement|terrain|foncier/i.test(title)) return 'foncier'
  return 'immobilier'
}

export function mapKind(types: string[], title: string): Kind {
  // An explicit physical type always wins over a programme label.
  for (const t of types) {
    const kind = KIND_BY_TYPE[t]
    if (kind) return kind
  }

  // Otherwise read the title — CPI names listings descriptively.
  if (/lotissement|terrain/i.test(title)) return 'terrain'
  if (/appartement|\bF[2-5][A-C]?\b|studio/i.test(title)) return 'appartement'
  if (/villa|résidence sécurisée/i.test(title)) return 'villa'
  if (/immeuble|résidence|complexe|R\+\d/i.test(title)) return 'immeuble'
  if (/bureau/i.test(title)) return 'bureau'
  if (/boutique|commerce/i.test(title)) return 'commerce'

  // `Résidentiel` with nothing else to go on.
  return 'immeuble'
}

/**
 * Lifecycle + commercial state, merged into one axis.
 *
 * Precedence, and the one judgement call:
 *
 *   sold     → vendu
 *   for_rent → a-louer
 *   for_sale → depends on the programme label AND the product line:
 *
 *     • FONCIER "En cours" → **disponible**, not `en-cours`.
 *       These are CPI's nine active land sites (Ngolfagnick, Sangalkam,
 *       Sébikhotane…). "En cours" describes the *servicing programme*, not the
 *       plots — the plots are on sale today and are the site's flagship
 *       inventory. Mapping them to `en-cours` would hide them from /terrains.
 *
 *     • IMMOBILIER "En cours" → `en-cours`. A building under construction sold
 *       off-plan genuinely is in progress, and buyers need to know.
 */
export function mapAvailability(
  types: string[],
  oldStatus: string[],
  productLine: ProductLine,
): Availability {
  if (oldStatus.includes('sold')) return 'vendu'
  if (oldStatus.includes('for_rent')) return 'a-louer'

  const ongoing = has(types, 'En cours')
  const completed = has(types, 'Réalisé') || has(types, 'realise')

  if (ongoing) return productLine === 'foncier' ? 'disponible' : 'en-cours'
  if (completed) return 'realise'
  return 'disponible'
}

export function mapProperty(input: {
  title: string
  types: string[]
  status: string[]
}): { productLine: ProductLine; kind: Kind; availability: Availability } {
  const productLine = mapProductLine(input.types, input.title)
  return {
    productLine,
    kind: mapKind(input.types, input.title),
    availability: mapAvailability(input.types, input.status, productLine),
  }
}
