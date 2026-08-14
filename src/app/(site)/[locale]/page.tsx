import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/routing'
import { MetiersTabs } from '@/components/home-redesign/metiers-tabs'
import { FeatureGallery, type FeatureSlide } from '@/components/home-redesign/feature-gallery'
import { VideoShowcase } from '@/components/home-redesign/video-showcase'
import { ContactSection } from '@/components/home-redesign/contact-section'
import { ShopGrid } from '@/components/home-redesign/shop-grid'
import { Eyebrow, SectionHead } from '@/components/home-redesign/section-head'
import { getHomePage, getProperties } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import type { City, Media, Property } from '@/payload-types'

type Shot = { src: string; alt: string; title: string; city: string | null; excerpt: string | null }

/**
 * Gallery photographs across a set of listings.
 *
 * `featuredImage` is deliberately avoided for large slots: CPI's featured
 * images are marketing banners with the site name set across the artwork, which
 * at half-viewport width reads as a broken advert. Gallery entries that merely
 * duplicate the featured image are dropped for the same reason — several
 * listings attach the same banner twice.
 */
function photosFrom(properties: Property[]): Shot[] {
  return properties.flatMap((p) => {
    const city = typeof p.city === 'object' ? (p.city as City | null) : null
    const featured = (p.featuredImage as Media | null)?.url ?? null
    return (p.gallery ?? [])
      .filter((m): m is Media => typeof m === 'object' && Boolean(m?.url))
      .filter((m) => m.url !== featured)
      .map((m) => ({
        src: m.url as string,
        alt: m.alt ?? p.title,
        title: p.title,
        city: city?.name ?? null,
        excerpt: p.excerpt ?? null,
      }))
  })
}

function bannersFrom(properties: Property[]): Shot[] {
  return properties
    .map((p) => {
      const media = p.featuredImage as Media | null
      if (!media?.url) return null
      const city = typeof p.city === 'object' ? (p.city as City | null) : null
      return {
        src: media.url,
        alt: media.alt ?? p.title,
        title: p.title,
        city: city?.name ?? null,
        excerpt: p.excerpt ?? null,
      }
    })
    .filter((x): x is Shot => x !== null)
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const home = await getHomePage(locale as Locale)

  const [available, realised, everything] = await Promise.all([
    getProperties({
      locale: locale as Locale,
      productLine: 'foncier',
      availability: ['disponible', 'en-cours'],
      limit: 8,
    }),
    getProperties({
      locale: locale as Locale,
      productLine: 'immobilier',
      availability: ['realise', 'vendu'],
      limit: 10,
    }),
    getProperties({ locale: locale as Locale, limit: 60 }),
  ])

  const photos = [...photosFrom(realised), ...photosFrom(available), ...photosFrom(everything)]
  const banners = [...bannersFrom(realised), ...bannersFrom(available)]
  const seen = new Set<string>()
  const pool = [...photos, ...banners].filter((s) => {
    if (seen.has(s.src)) return false
    seen.add(s.src)
    return true
  })

  // Each slot claims images nothing else has taken, so no photograph appears
  // twice down the page. `preferred` keeps the range cards on-topic.
  const claimed = new Set<string>()
  const take = (n: number, preferred?: Shot[]): Shot[] => {
    const out: Shot[] = []
    for (const list of [preferred ?? [], pool]) {
      for (const shot of list) {
        if (out.length === n) break
        if (claimed.has(shot.src)) continue
        claimed.add(shot.src)
        out.push(shot)
      }
    }
    return out
  }

  const landPhotos = photosFrom(available)
  const homePhotos = photosFrom(realised)

  // Hero art is editorial only, never scavenged from a listing.
  const heroImage = home.heroImage as Media | null
  const heroSlide = (home.heroSlides ?? [])
    .map((s) => s.image as Media | null)
    .find((m): m is Media => Boolean(m?.url))
  const heroSrc = heroSlide?.url ?? heroImage?.url ?? null

  const approachShots = take(3)
  const metierImage = take(1)[0] ?? null
  const landShot = take(1, landPhotos)[0] ?? null
  const homeShot = take(1, homePhotos)[0] ?? null
  const projectCards = take(3, homePhotos)
  const featureShots = take(6)

  const featureSlides: FeatureSlide[] = featureShots.map((img) => ({
    src: img.src,
    alt: img.alt,
    eyebrow: img.city ?? t('feature.eyebrowFallback'),
    title: img.title,
    text: img.excerpt ?? img.city ?? '',
  }))

  const founder = home.founder
  const videoPoster = founder?.videoPoster as Media | null

  const approachKeys = ['one', 'two', 'three'] as const
  const uspKeys = ['one','two','three','four','five','six','seven','eight','nine'] as const

  const metierTabs = (['foncier', 'immobilier', 'juridique'] as const).map((key) => ({
    label: t(`metiers.tabs.${key}.label`),
    body: t(`metiers.tabs.${key}.body`),
  }))

  return (
    <>
      {/* ── 1 · Hero ─────────────────────────────────────────────── */}
      <section id="top" className="relative flex min-h-[88vh] items-end overflow-hidden">
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt={heroImage?.alt ?? ''}
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
        ) : null}
        {/* The type sits at the foot of the frame, so the scrim is weighted
            there rather than spread evenly. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(13_23_18/0.45)_0%,rgb(13_23_18/0.35)_35%,rgb(13_23_18/0.92)_100%)]"
        />

        <div className="mx-auto w-full max-w-[1400px] px-6 pt-40 pb-16">
          <p className="text-[11px] tracking-[0.28em] text-[var(--gold-300)] uppercase">
            {t('hero.eyebrow')}
          </p>
          <h1 className="mt-5 max-w-4xl font-heading text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] font-bold text-white uppercase">
            {t('hero.titleLead')}{' '}
            <span className="text-[var(--gold-300)]">{t('hero.titleAccent')}</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/80">
            {t('hero.subtitle')}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="bg-brand-solid px-6 py-3.5 text-[13px] font-semibold tracking-[0.03em] text-brand-solid-foreground transition-colors hover:bg-brand-solid-hover"
            >
              {t('hero.ctaContact')}
            </Link>
            <a
              href="#shop"
              className="border border-white/30 px-6 py-3.5 text-[13px] font-semibold tracking-[0.03em] text-white transition-colors hover:border-[var(--gold-300)] hover:text-[var(--gold-300)]"
            >
              {t('hero.ctaShop')}
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/15 pt-7">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {(['one', 'two', 'three'] as const).map((k) => (
                <li
                  key={k}
                  className="flex items-center gap-2 text-[11px] tracking-[0.2em] text-white/70 uppercase"
                >
                  <span aria-hidden className="size-1 bg-[var(--gold-300)]" />
                  {t(`hero.badges.${k}`)}
                </li>
              ))}
            </ul>
            <dl className="ms-auto flex items-end gap-8">
              <div>
                <dt className="sr-only">{t('hero.statFamilies')}</dt>
                <dd className="font-heading text-4xl leading-none font-bold text-white">10 000+</dd>
                <p className="mt-1 text-[11px] tracking-[0.14em] text-white/60 uppercase">
                  {t('hero.statFamilies')}
                </p>
              </div>
              <div>
                <dt className="sr-only">{t('hero.statSites')}</dt>
                <dd className="font-heading text-4xl leading-none font-bold text-white">15+</dd>
                <p className="mt-1 text-[11px] tracking-[0.14em] text-white/60 uppercase">
                  {t('hero.statSites')}
                </p>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── 2 · Approach ─────────────────────────────────────────── */}
      <section id="s2" className="mx-auto max-w-[1400px] px-6 pt-[110px]">
        <SectionHead
          eyebrow={t('approach.eyebrow')}
          title={t('approach.title')}
          subtitle={t('approach.subtitle')}
        />
        <div className="mt-14 grid gap-px bg-subtle sm:grid-cols-3">
          {approachKeys.map((key, i) => (
            <article key={key} className="bg-surface p-8">
              {approachShots[i] ? (
                <div className="relative mb-7 aspect-[4/3] overflow-hidden">
                  <Image
                    src={approachShots[i].src}
                    alt={approachShots[i].alt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ) : null}
              <h3 className="font-heading text-3xl font-semibold text-foreground uppercase">
                {t(`approach.items.${key}.title`)}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
                {t(`approach.items.${key}.body`)}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── 3 · Why CPI ──────────────────────────────────────────── */}
      <section id="s3" className="mx-auto max-w-[1400px] px-6 pt-[110px]">
        <SectionHead eyebrow={t('usp.eyebrow')} title={t('usp.title')} />
        <ul className="mt-14 grid gap-px bg-subtle sm:grid-cols-2 lg:grid-cols-3">
          {uspKeys.map((key, i) => (
            <li key={key} className="flex items-start gap-4 bg-surface p-7">
              <span className="mt-0.5 font-heading text-lg leading-none font-bold text-brand tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-[15px] leading-relaxed text-foreground">{t(`usp.items.${key}`)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 4 · What we do ───────────────────────────────────────── */}
      <section id="s4" className="mx-auto max-w-[1400px] px-6 pt-[110px]">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[520px]">
            {metierImage ? (
              <Image
                src={metierImage.src}
                alt={metierImage.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-col justify-center">
            <Eyebrow>{t('metiers.eyebrow')}</Eyebrow>
            <h2 className="mt-4 font-heading text-[clamp(2.25rem,4vw,3.5rem)] leading-[0.95] font-bold text-foreground uppercase">
              {t('metiers.title')}
            </h2>
            <div className="mt-9">
              <MetiersTabs tabs={metierTabs} />
            </div>
            <Link
              href="/nos-services"
              className="mt-9 inline-flex w-max items-center gap-2 border-b border-brand-border pb-1 text-[13px] font-semibold tracking-[0.03em] text-brand transition-colors hover:text-brand-hover"
            >
              {t('metiers.all')}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5 · Ranges ───────────────────────────────────────────── */}
      <section id="s5" className="mx-auto max-w-[1400px] px-6 pt-[110px]">
        <SectionHead
          eyebrow={t('lines.eyebrow')}
          title={t('lines.title')}
          subtitle={t('lines.subtitle')}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {(
            [
              { key: 'land', href: '/terrains', shot: landShot },
              { key: 'homes', href: '/appartements', shot: homeShot },
            ] as const
          ).map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="group relative flex min-h-[440px] flex-col justify-end overflow-hidden p-8"
            >
              {card.shot ? (
                <Image
                  src={card.shot.src}
                  alt={card.shot.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : null}
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(13_23_18/0.15)_0%,rgb(13_23_18/0.85)_100%)]"
              />
              {card.shot?.city ? (
                <p className="mb-auto w-max border border-white/30 px-3 py-1 text-[11px] tracking-[0.18em] text-white uppercase">
                  {card.shot.city}
                </p>
              ) : null}
              <h3 className="font-heading text-4xl leading-none font-bold text-white uppercase">
                {t(`lines.${card.key}.title`)}
              </h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/75">
                {t(`lines.${card.key}.body`)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 6 · Projects ─────────────────────────────────────────── */}
      <section id="s6" className="mx-auto max-w-[1400px] px-6 pt-[110px]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <Eyebrow>{t('projects.eyebrow')}</Eyebrow>
            <h2 className="mt-4 font-heading text-[clamp(2.25rem,4vw,3.5rem)] leading-[0.95] font-bold text-foreground uppercase">
              {t('projects.title')}
            </h2>
          </div>
          <div className="flex flex-col justify-end gap-5">
            <p className="text-[15px] leading-relaxed text-foreground-muted">{t('projects.body')}</p>
            <p className="border-s-2 border-brand-border ps-4 text-[15px] leading-relaxed text-foreground">
              {t('projects.referral')}
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {projectCards.map((card, i) => (
            <article key={card.src} className="group">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="mt-5 text-[11px] tracking-[0.2em] text-brand uppercase">
                {String(i + 1).padStart(2, '0')} / {card.city ?? t('projects.eyebrow')}
              </p>
              <h3 className="mt-2 font-heading text-2xl leading-tight font-semibold text-foreground uppercase">
                {card.title}
              </h3>
              {card.excerpt ? (
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{card.excerpt}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {/* ── 7 · Feature gallery ──────────────────────────────────── */}
      {featureSlides.length ? (
        <FeatureGallery
          slides={featureSlides}
          labels={{ prev: t('feature.prev'), next: t('feature.next'), skip: t('feature.skip') }}
        />
      ) : null}

      {/* ── Shop ─────────────────────────────────────────────────── */}
      <ShopGrid />

      {/* ── 8 · Video ────────────────────────────────────────────── */}
      {founder?.videoUrl ? (
        <section id="s8" className="mx-auto mt-[110px] max-w-[1400px] px-6">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            <VideoShowcase
              url={founder.videoUrl}
              poster={videoPoster?.url ?? null}
              posterAlt={videoPoster?.alt ?? ''}
              playLabel={t('video.play')}
            />
            <div className="flex flex-col justify-center">
              <Eyebrow>{t('video.kicker')}</Eyebrow>
              <h2 className="mt-4 font-heading text-[clamp(1.85rem,3vw,2.75rem)] leading-[1.02] font-bold text-foreground uppercase">
                {founder.videoLabel ?? founder.name}
              </h2>
              <p className="mt-4 text-[15px] text-foreground-muted">
                {[founder.name, founder.role].filter(Boolean).join(' — ')}
              </p>
              <dl className="mt-8 flex gap-10 border-t border-subtle pt-6">
                <div>
                  <dd className="font-heading text-3xl leading-none font-bold text-brand">20 ans</dd>
                  <dt className="mt-1 text-[11px] tracking-[0.14em] text-foreground-muted uppercase">
                    {t('video.years')}
                  </dt>
                </div>
                <div>
                  <dd className="font-heading text-3xl leading-none font-bold text-brand">10 000+</dd>
                  <dt className="mt-1 text-[11px] tracking-[0.14em] text-foreground-muted uppercase">
                    {t('video.families')}
                  </dt>
                </div>
              </dl>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 9 · Contact ──────────────────────────────────────────── */}
      <ContactSection />
    </>
  )
}
