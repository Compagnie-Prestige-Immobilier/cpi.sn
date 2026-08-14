/**
 * Seeds the Boutique catalogue.
 *
 *   npm run seed:shop
 *
 * Moves what was hardcoded in `src/components/boutique/plots.ts` into the
 * `shop-items` collection so CPI can edit it. Idempotent: matches on title and
 * updates rather than duplicating, so re-running after an edit in the admin
 * only restores the fields this script owns.
 *
 * Photographs are resolved from the media library by filename, the same way the
 * page used to do it at render time — and left empty rather than guessed when
 * there is no match, because a wrong photo on a named site is worse than none.
 */
import { getPayload } from 'payload'
import config from '../../payload.config'

const DEPOSIT = 250_000

type Seed = {
  title: string
  kind: 'terrain' | 'service'
  place?: string
  region?: string
  surface?: string
  tags?: string[]
  description?: string
  price?: number
  priceCaption?: string
  imageHint?: string
  featured?: boolean
  action?: 'basket' | 'portal'
}

const ITEMS: Seed[] = [
  // ── Land, as the designer listed it in the header menu ──
  { title: 'Ngolfagnick', kind: 'terrain', place: 'Notto Gouye Diama', region: 'Thiès', imageHint: 'ngolfagnick', tags: ['Viabilisé', 'Titre foncier'], featured: true },
  { title: 'Léne', kind: 'terrain', place: 'Lène, Thiès', region: 'Thiès', imageHint: 'lene', tags: ['Viabilisé', 'Bornage réalisé'] },
  { title: 'Sangalkam', kind: 'terrain', place: 'Sangalkam, Rufisque', region: 'Rufisque', imageHint: 'sangalkam', tags: ['Viabilisé', 'Titre foncier'], featured: true },
  { title: 'Noflaye', kind: 'terrain', place: 'Noflaye, Rufisque', region: 'Rufisque', tags: ['Viabilisé', 'Accès bitumé'] },
  { title: 'Sébikhotane', kind: 'terrain', place: 'Sébikhotane, Rufisque', region: 'Rufisque', imageHint: 'sebikhotane', tags: ['Viabilisé', 'Titre foncier'] },
  { title: 'Kounoune', kind: 'terrain', place: 'Kounoune, Rufisque', region: 'Rufisque', tags: ['Viabilisé', 'Bornage réalisé'] },
  { title: 'Bambilor Extension', kind: 'terrain', place: 'Bambilor, Rufisque', region: 'Rufisque', tags: ['Viabilisé', 'Accès bitumé'] },
  { title: 'Tassette', kind: 'terrain', place: 'Tassette, Thiès', region: 'Thiès', imageHint: 'tassette', tags: ['Viabilisé', 'Titre foncier'] },
  { title: 'Lélo Sérère', kind: 'terrain', place: 'Lélo Sérère, Thiès', region: 'Thiès', tags: ['Viabilisé', 'Bornage réalisé'] },
  { title: 'Ndayanne', kind: 'terrain', place: 'Ndayane, Popenguine', region: 'Mbour', imageHint: 'ndayane', tags: ['Viabilisé', 'Proche mer'], featured: true },
  { title: 'Thiéo', kind: 'terrain', place: 'Thiéo, Thiès', region: 'Thiès', imageHint: 'thieo', tags: ['Viabilisé', 'Proche AIBD'] },

  // ── Fixed-price services ──
  {
    title: 'Dossiers & documents',
    kind: 'service',
    description:
      'Titre foncier, plan de bornage, attestation de propriété — commandés et délivrés en version numérique.',
    price: 15_000,
    priceCaption: 'dès',
  },
  {
    title: 'Prestations conseil',
    kind: 'service',
    description:
      'Étude juridique, analyse foncière, assistance notariale — réservez un créneau avec notre cabinet.',
    price: 50_000,
    priceCaption: 'dès',
  },
  {
    title: 'Goodies CPI',
    kind: 'service',
    description: 'Produits dérivés : carnets, casquettes, polos — livrés à Dakar.',
    price: 5_000,
    priceCaption: 'dès',
  },
  {
    title: 'Payer une échéance',
    kind: 'service',
    description: 'Réglez votre mensualité et suivez votre échéancier depuis votre espace client.',
    action: 'portal',
  },
  {
    title: 'Espace client',
    kind: 'service',
    description:
      'Contrats, échéancier, reçus et avancement du chantier — réservé aux clients CPI.',
    action: 'portal',
  },
]

async function main() {
  const payload = await getPayload({ config })

  // Gallery photographs only. A featured image is a marketing banner with the
  // site name burned across it — the exact thing these cards must not show.
  const media = await payload.find({ collection: 'media', limit: 500, overrideAccess: true })

  let created = 0
  let updated = 0
  let withoutPhoto = 0

  for (const [i, item] of ITEMS.entries()) {
    const photo = item.imageHint
      ? media.docs.find((m) => (m.filename ?? '').toLowerCase().includes(item.imageHint!))
      : undefined
    if (item.kind === 'terrain' && !photo) withoutPhoto++

    const data = {
      title: item.title,
      kind: item.kind,
      order: i,
      featured: item.featured ?? false,
      place: item.place,
      region: item.region,
      surface: item.kind === 'terrain' ? (item.surface ?? '150–300 m²') : undefined,
      tags: item.tags?.map((label) => ({ label })),
      description: item.description,
      // Land carries the reservation deposit the designer published; services
      // carry their own fixed price. Nothing here is invented beyond that.
      price: item.price ?? (item.kind === 'terrain' ? DEPOSIT : undefined),
      priceCaption:
        item.priceCaption ?? (item.kind === 'terrain' ? 'Acompte de réservation' : undefined),
      action: item.action ?? 'basket',
      image: photo?.id,
    }

    const existing = await payload.find({
      collection: 'shop-items',
      where: { title: { equals: item.title } },
      limit: 1,
      locale: 'fr',
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      await payload.update({
        collection: 'shop-items',
        id: existing.docs[0].id,
        data,
        locale: 'fr',
        overrideAccess: true,
      })
      updated++
    } else {
      await payload.create({ collection: 'shop-items', data, locale: 'fr', overrideAccess: true })
      created++
    }
  }

  console.log(`✓ shop-items — ${created} created, ${updated} updated`)
  if (withoutPhoto) {
    console.log(
      `  ⚠ ${withoutPhoto} land item(s) have no photograph yet — CPI can attach one in the admin.`,
    )
  }
  process.exit(0)
}

main().catch((error) => {
  console.error('✗ seed:shop failed:', error)
  process.exit(1)
})
