/**
 * Restructures the À propos page and fills the Team collection.
 *
 *   npm run seed:about
 *
 * The phase-3 import put the whole Elementor page into a single rich-text
 * block, which preserved the words and lost every bit of structure: the
 * timeline became prose, the six service cards collapsed into
 * "Services Promotion Foncière Plus de détails Services Intermédiation …", and
 * sixteen stock photographs were appended as a gallery.
 *
 * This rebuilds it from the same source into real blocks. Nothing is invented —
 * every string below is CPI's own copy, with only obvious typos corrected.
 */
import { getPayload } from 'payload'
import config from '../../payload.config'

const STATS = [
  { value: '+20', label: "Années d'expérience" },
  { value: '+10 000', label: 'Familles propriétaires' },
  { value: '+15', label: 'Sites stratégiques' },
  { value: '98 %', label: 'Satisfaction clients' },
]

const TIMELINE = [
  {
    year: '2003',
    title: 'Création de CPI Immobilier',
    body: "Fondée par Mme Aminata Sall SY, juriste de formation et spécialiste du droit foncier et domanial, avec pour mission de rendre la propriété foncière accessible aux familles sénégalaises en garantissant une sécurité juridique absolue.",
  },
  {
    year: '2005',
    title: 'Lancement de notre premier projet',
    body: "ZAC de Mbao, un lotissement de 25 parcelles à côté du péage — le projet qui a validé notre modèle : accompagnement juridique rigoureux et suivi personnalisé.",
  },
  {
    year: '2007',
    title: 'Site Keur Massar 1',
    body: "2,5 hectares et 93 parcelles. Le projet a confirmé notre capacité à gérer des opérations d'envergure sans transiger sur la qualité juridique.",
  },
  {
    year: '2010',
    title: 'Consolidation et premiers résultats',
    body: "Plusieurs sites régularisés et les premiers clients accompagnés jusqu'à l'obtention de leurs titres fonciers définitifs. Plus de 3 500 familles devenues propriétaires.",
  },
  {
    year: '2013',
    title: 'Cabinet Conseil et nouvelle direction',
    body: "Création d'un Cabinet Conseil spécialisé en droit foncier et domanial. La même année, Mr Abdoulaye Ndiogou Samb prend la direction générale, préservant l'excellence juridique héritée tout en ouvrant CPI vers de nouveaux marchés, notamment la diaspora.",
  },
  {
    year: '2014–2020',
    title: 'Croissance et innovation',
    body: "Plus de 15 sites stratégiques développés autour de Dakar, et des facilités de paiement allant jusqu'à 3 ans — une mission d'inclusion autant qu'un outil commercial, pour des familles sans accès au financement bancaire classique.",
  },
  {
    year: '2021–2025',
    title: 'Transformation digitale',
    body: "Suivi de projet digitalisé, outils de gestion modernes et présence en ligne renforcée, pour plus de transparence et de réactivité.",
  },
  {
    year: "Aujourd'hui",
    title: 'Plus de 10 000 clients accompagnés',
    body: "8 zones stratégiques en développement simultané. 60 % de nos ventes proviennent de recommandations — ce qui n'a pas changé depuis 2003, c'est l'engagement pour la sécurité juridique.",
  },
]

const VALUES = [
  {
    title: 'Confiance',
    body: "Des relations durables fondées sur la confiance mutuelle. Chaque client est accompagné avec transparence.",
  },
  {
    title: 'Intégrité',
    body: "Tous nos terrains sont juridiquement sécurisés. Notre cabinet conseil garantit la légalité de chaque transaction.",
  },
  {
    title: 'Excellence',
    body: "Plus de 20 ans d'expertise au service de la qualité. Nous sélectionnons rigoureusement nos sites et nos partenaires.",
  },
  {
    title: 'Innovation',
    body: "Facilités de paiement adaptées, accompagnement digital, solutions personnalisées.",
  },
  {
    title: 'Accessibilité',
    body: "Permettre à chaque famille sénégalaise de devenir propriétaire, quels que soient ses moyens.",
  },
  {
    title: 'Service client',
    body: "Une équipe dédiée et réactive, à chaque étape du projet.",
  },
]

const EXPERTISE = [
  {
    title: 'Cabinet Conseil Juridique intégré',
    body: "Expertise avérée en droit foncier et domanial. Gestion complète des formalités administratives.",
  },
  {
    title: 'Réseau de professionnels',
    body: "Géomètres, architectes, ingénieurs BTP, bureaux d'études et de contrôle.",
  },
  {
    title: 'Équipe commerciale performante',
    body: "Expertise en vente de produits immobiliers propres et tiers.",
  },
  {
    title: 'Gestion de litiges',
    body: "Accompagnement complet pour résoudre tout problème foncier ou domanial.",
  },
]

/**
 * Leadership team. Roles as written on the old site; "Assistate" corrected to
 * "Assistante". No photographs: the source page carries none that can be
 * matched to a person, and attaching an unverified face to a named individual
 * is a misattribution. The front end shows a marked placeholder instead.
 */
const TEAM = [
  {
    name: 'Aminata Sall SY',
    role: 'Fondatrice & Administratrice Générale',
    bio: "Juriste de formation, après plus de 35 ans au service de l'État. Depuis 2003 elle dirige CPI avec une exigence constante de zéro contentieux et 100 % de conformité, totalisant plus de 50 opérations immobilières et 3 000 parcelles commercialisées. Lauréate du Prix des Nations Unies 2009 et Chevalier de l'Ordre National du Mérite.",
    order: 1,
  },
  {
    name: 'Abdoulaye Ndiogou Samb',
    role: 'Directeur Général',
    bio: "Spécialiste en marketing et communication, lauréat du Prix d'Excellence HEC 2015. Dirige CPI Immobilier depuis 2013, alliant continuité des valeurs fondatrices et innovation pour démocratiser l'accès à la propriété.",
    order: 2,
  },
  { name: 'Yaye Cissé Ndoye', role: 'Directrice Commerciale', order: 3 },
  { name: 'Sydi Moutakhtar Faye', role: 'Responsable juridique', order: 4 },
  { name: 'Mbaye Ndiaye', role: 'Responsable foncier', order: 5 },
  { name: 'Pape Diop', role: 'Responsable construction', order: 6 },
  {
    name: 'Malick Fall',
    role: 'Responsable financier',
    bio: "Assure une gestion rigoureuse et transparente, soutient les décisions stratégiques et veille à la performance de l'entreprise.",
    order: 7,
  },
  { name: 'Mamadou Gueye', role: 'Digital Manager', order: 8 },
  { name: 'Khady Gaye', role: 'Assistante administrative', order: 9 },
]

async function main() {
  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'a-propos' } },
    limit: 1,
    locale: 'fr',
    overrideAccess: true,
  })
  const page = found.docs[0]
  if (!page) throw new Error('The à-propos page is missing. Run `npm run import` first.')

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'fr',
    overrideAccess: true,
    data: {
      blocks: [
        {
          blockType: 'richText',
          width: 'narrow',
          content: await richText(
            payload,
            "<p>Plus de 20 ans d'expérience au service de votre rêve de propriété. De 2003 à aujourd'hui, une histoire de confiance et d'expertise.</p>",
          ),
        },
        { blockType: 'stats', items: STATS },
        { blockType: 'timeline', heading: 'Notre parcours', entries: TIMELINE },
        { blockType: 'valueGrid', heading: 'Nos valeurs', items: VALUES },
        { blockType: 'valueGrid', heading: 'Notre expertise', items: EXPERTISE },
        {
          blockType: 'cta',
          heading: 'Rejoignez les +10 000 familles qui nous font confiance',
          body: 'Concrétisez votre rêve de propriété avec un partenaire expérimenté.',
          cta: { label: 'Discuter avec notre équipe', href: '/contact' },
        },
        // The 16-image gallery is deliberately not carried over: it was generic
        // stock photography (handshakes, VR headsets) scraped off the Elementor
        // page, not CPI's own work.
      ],
      _status: 'published',
    },
  })
  console.log('✓ à-propos restructured into blocks')

  for (const member of TEAM) {
    const existing = await payload.find({
      collection: 'team',
      where: { name: { equals: member.name } },
      limit: 1,
      overrideAccess: true,
    })
    const data = { name: member.name, role: member.role, bio: member.bio, order: member.order }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'team',
        id: existing.docs[0].id,
        data,
        locale: 'fr',
        overrideAccess: true,
      })
    } else {
      await payload.create({ collection: 'team', data, locale: 'fr', overrideAccess: true })
    }
  }
  console.log(`✓ ${TEAM.length} team members seeded`)
  process.exit(0)
}

async function richText(payload: Awaited<ReturnType<typeof getPayload>>, html: string) {
  const { htmlToLexical } = await import('./lexical')
  return htmlToLexical(payload, html)
}

main().catch((error) => {
  console.error('✗ seed:about failed:', error)
  process.exit(1)
})
