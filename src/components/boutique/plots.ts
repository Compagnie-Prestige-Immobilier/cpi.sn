/**
 * The eleven sites CPI markets, as the designer listed them in the header menu.
 *
 * Hardcoded on purpose, at the client's request: the export drives this grid
 * from a placeholder loop with no real records behind it, and matching his page
 * exactly matters more here than sourcing it from Payload. The names, the
 * region grouping and the 250 000 FCFA reservation deposit are all his.
 *
 * What is NOT invented: no per-site price beyond the deposit he already
 * published on the homepage, and no exact plot areas — the surface shown is the
 * 150–300 m² range his hero states, which is true of the range as a whole.
 *
 * `image` is resolved at render time against the media library by filename, so
 * these entries stay in step with what CPI actually uploads. When the shop goes
 * commercial this file is the thing to replace with a Payload query.
 */
export type Plot = {
  slug: string
  name: string
  place: string
  region: string
  /** Matched against media filenames; first hit wins, else a fallback photo. */
  imageHint?: string
  tags: [string, string]
  /** Reservation deposit in XOF. Integer — the franc CFA has no minor unit. */
  deposit: number
  surface: string
  featured?: boolean
}

export const RESERVATION_DEPOSIT = 250_000

export const PLOTS: Plot[] = [
  {
    slug: 'ngolfagnick',
    name: 'Ngolfagnick',
    place: 'Notto Gouye Diama',
    region: 'Thiès',
    imageHint: 'ngolfagnick',
    tags: ['Viabilisé', 'Titre foncier'],
    deposit: RESERVATION_DEPOSIT,
    surface: '150–300 m²',
    featured: true,
  },
  {
    slug: 'lene',
    name: 'Léne',
    place: 'Lène, Thiès',
    region: 'Thiès',
    imageHint: 'lene',
    tags: ['Viabilisé', 'Bornage réalisé'],
    deposit: RESERVATION_DEPOSIT,
    surface: '150–300 m²',
  },
  {
    slug: 'sangalkam',
    name: 'Sangalkam',
    place: 'Sangalkam, Rufisque',
    region: 'Rufisque',
    imageHint: 'sangalkam',
    tags: ['Viabilisé', 'Titre foncier'],
    deposit: RESERVATION_DEPOSIT,
    surface: '150–300 m²',
    featured: true,
  },
  {
    slug: 'noflaye',
    name: 'Noflaye',
    place: 'Noflaye, Rufisque',
    region: 'Rufisque',
    tags: ['Viabilisé', 'Accès bitumé'],
    deposit: RESERVATION_DEPOSIT,
    surface: '150–300 m²',
  },
  {
    slug: 'sebikhotane',
    name: 'Sébikhotane',
    place: 'Sébikhotane, Rufisque',
    region: 'Rufisque',
    imageHint: 'sebikhotane',
    tags: ['Viabilisé', 'Titre foncier'],
    deposit: RESERVATION_DEPOSIT,
    surface: '150–300 m²',
  },
  {
    slug: 'kounoune',
    name: 'Kounoune',
    place: 'Kounoune, Rufisque',
    region: 'Rufisque',
    tags: ['Viabilisé', 'Bornage réalisé'],
    deposit: RESERVATION_DEPOSIT,
    surface: '150–300 m²',
  },
  {
    slug: 'bambilor-extension',
    name: 'Bambilor Extension',
    place: 'Bambilor, Rufisque',
    region: 'Rufisque',
    tags: ['Viabilisé', 'Accès bitumé'],
    deposit: RESERVATION_DEPOSIT,
    surface: '150–300 m²',
  },
  {
    slug: 'tassette',
    name: 'Tassette',
    place: 'Tassette, Thiès',
    region: 'Thiès',
    imageHint: 'tassette',
    tags: ['Viabilisé', 'Titre foncier'],
    deposit: RESERVATION_DEPOSIT,
    surface: '150–300 m²',
  },
  {
    slug: 'lelo-serere',
    name: 'Lélo Sérère',
    place: 'Lélo Sérère, Thiès',
    region: 'Thiès',
    tags: ['Viabilisé', 'Bornage réalisé'],
    deposit: RESERVATION_DEPOSIT,
    surface: '150–300 m²',
  },
  {
    slug: 'ndayanne',
    name: 'Ndayanne',
    place: 'Ndayane, Popenguine',
    region: 'Mbour',
    imageHint: 'ndayane',
    tags: ['Viabilisé', 'Proche mer'],
    deposit: RESERVATION_DEPOSIT,
    surface: '150–300 m²',
    featured: true,
  },
  {
    slug: 'thieo',
    name: 'Thiéo',
    place: 'Thiéo, Thiès',
    region: 'Thiès',
    imageHint: 'thieo',
    tags: ['Viabilisé', 'Proche AIBD'],
    deposit: RESERVATION_DEPOSIT,
    surface: '150–300 m²',
  },
]

/** Region filter options, derived so a new plot never needs a second edit. */
export const REGIONS = [...new Set(PLOTS.map((p) => p.region))].sort()
