import Image from 'next/image'
import { Allura } from 'next/font/google'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/routing'
import { TemplateHero, type HeroSlide } from '@/components/home-template/hero'
import { TemplateMotion } from '@/components/home-template/motion'
import { MetiersTabs } from '@/components/home-template/metiers-tabs'
import { FeatureGallery, type FeatureSlide } from '@/components/home-template/feature-gallery'
import { VideoShowcase } from '@/components/home-template/video-showcase'
import { TemplateRegisterForm } from '@/components/home-template/register-form'
import { SectionMarker } from '@/components/home-template/section-marker'
import { getHomePage, getProperties } from '@/lib/payload'
import type { Locale } from '@/i18n/locales'
import type { City, Media, Property } from '@/payload-types'

import '@/styles/home-template.css'

/**
 * The template's `.accent-text` is set in Allura, a script face. That is a
 * design decision rather than a colour one, so it is kept — recoloured to CPI
 * burgundy. Declared here rather than in the layout so only this route pays for
 * it.
 */
const allura = Allura({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-allura',
  display: 'swap',
})

type Shot = {
  src: string
  alt: string
  title: string
  city: string | null
  excerpt: string | null
}

/**
 * Every gallery photograph across a set of properties.
 *
 * `featuredImage` is deliberately NOT used for the large slots on this page.
 * CPI's featured images are marketing banners with the site name set in huge
 * type across the artwork ("NDAYANE — Le luxe au Cœur de la Sérénité
 * Naturelle"); at half-viewport width that reads as a broken advert rather than
 * a photograph. It is the same reason the hero has its own editorial field.
 *
 * The `gallery` field holds actual photographs of the sites, so the page draws
 * from there and only falls back to a banner if a section would otherwise have
 * no image at all.
 */
function photosFrom(properties: Property[]): Shot[] {
  return properties.flatMap((p) => {
    const city = typeof p.city === 'object' ? (p.city as City | null) : null
    const featured = (p.featuredImage as Media | null)?.url ?? null
    return (p.gallery ?? [])
      .filter((m): m is Media => typeof m === 'object' && Boolean(m?.url))
      // A gallery entry that *is* the featured image is the banner again —
      // several listings attach the same artwork twice, which was putting
      // "NDAYANE — Le luxe au Cœur de la Sérénité Naturelle" straight back into
      // the slots this function exists to keep clean.
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

/** Banner fallback, used only when no photograph is available. */
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
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ ids?: string }>
}) {
  const { locale } = await params
  const { ids } = await searchParams
  setRequestLocale(locale)

  // Badges are on unless explicitly switched off, so the designer gets the
  // reference grid without having to know the URL parameter exists.
  const showIds = ids !== 'off'

  const t = await getTranslations('homeTemplate')
  const tSite = await getTranslations('site')

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
    // Widest net, for imagery only. The two queries above are editorially
    // meaningful (what is for sale, what has been delivered) but between them
    // hold barely ten gallery photographs — the page needs seventeen, and the
    // shortfall was being padded with marketing banners from the register
    // section onwards.
    getProperties({ locale: locale as Locale, limit: 60 }),
  ])

  // Photographs first, banners only to pad a section that would otherwise be
  // empty. Deduplicated: the same file is attached to more than one listing.
  const photos = [
    ...photosFrom(realised),
    ...photosFrom(available),
    ...photosFrom(everything),
  ]
  const banners = [...bannersFrom(realised), ...bannersFrom(available)]
  const seen = new Set<string>()
  const pool = [...photos, ...banners].filter((s) => {
    if (seen.has(s.src)) return false
    seen.add(s.src)
    return true
  })

  // Each slot claims images that nothing else has taken, so no photograph
  // appears twice on the way down the page. `take` draws from a preferred
  // subset first and falls back to the full pool, which is what lets the two
  // range cards stay on-topic — a stairwell interior is a poor advert for a
  // building plot.
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

  // Hero art is editorial only — never scavenged from a listing, whose featured
  // images carry burned-in marketing text (CLAUDE.md → Component conventions).
  const heroImage = home.heroImage as Media | null
  const heroSlides: HeroSlide[] = (home.heroSlides ?? [])
    .map((slide) => {
      const media = slide.image as Media | null
      if (!media?.url) return null
      return {
        src: media.url,
        alt: media.alt ?? '',
        title: slide.label ?? t('hero.slideFallback'),
      }
    })
    .filter((s): s is HeroSlide => s !== null)

  if (!heroSlides.length && heroImage?.url) {
    heroSlides.push({
      src: heroImage.url,
      alt: heroImage.alt ?? '',
      title: home.heroTitle ?? t('hero.slideFallback'),
    })
  }

  const approach = ['one', 'two', 'three'] as const
  const uspKeys = [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
  ] as const
  const uspDelays = [
    '',
    'tpl-delay-06',
    'tpl-delay-12',
    'tpl-delay-18',
    'tpl-delay-24',
    'tpl-delay-3',
    'tpl-delay-36',
    'tpl-delay-42',
    'tpl-delay-48',
  ]

  const metierTabs = (['foncier', 'immobilier', 'juridique'] as const).map((key) => ({
    label: t(`metiers.tabs.${key}.label`),
    title: t(`metiers.tabs.${key}.title`),
    body: t(`metiers.tabs.${key}.body`),
    image: null,
  }))

  // Allocation order follows the page order, so the eye never meets the same
  // photograph twice on the way down.
  const approachShots = take(3)
  const metierImage = take(1)[0] ?? null
  const landShot = take(1, landPhotos)[0] ?? null
  const homeShot = take(1, homePhotos)[0] ?? null
  const galleryCards = take(4, homePhotos)
  const registerImage = take(1)[0] ?? null
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
  const showcaseImage = videoPoster?.url ?? pool[0]?.src ?? null

  return (
    <div className={`tpl ${allura.variable}`}>
      <TemplateMotion />

      {/* ── 1 · Hero ─────────────────────────────────────────────── */}
      {heroSlides.length ? (
        <TemplateHero slides={heroSlides}>
          <SectionMarker id="s1" show={showIds} />
          <div className="tpl-hero-topbar">
            <nav className="tpl-hero-menu" aria-label={t('hero.navLabel')}>
              <a className="tpl-hero-menu-link" href="#s2">
                {t('hero.menu.approach')}
              </a>
              <span className="tpl-hero-menu-divider" />
              <a className="tpl-hero-menu-link" href="#s4">
                {t('hero.menu.metiers')}
              </a>
              <span className="tpl-hero-menu-divider" />
              <a className="tpl-hero-menu-link" href="#s6">
                {t('hero.menu.gallery')}
              </a>
            </nav>
            <div className="tpl-hero-menu-actions">
              <Link className="tpl-hero-action tpl-hero-action-pill" href="/contact">
                {t('hero.cta')}
              </Link>
            </div>
          </div>

          <div id="s1-a" className="tpl-hero-center-content">
            <SectionMarker id="s1-a" show={showIds} sub />
            <div className="tpl-hero-logo-wrapper tpl-reveal" data-reveal="fade-up">
              <h1 className="font-heading text-5xl text-white lg:text-6xl">
                {home.heroTitle ?? tSite('fullName')}
              </h1>
            </div>
            <p className="tpl-hero-main-subtitle tpl-reveal tpl-delay-1" data-reveal="fade-up">
              {home.heroSubtitle ?? t('hero.subtitle')}
            </p>
            <div className="tpl-hero-badge tpl-reveal tpl-delay-2" data-reveal="fade-up">
              <span className="tpl-hero-badge-item">{t('hero.badges.one')}</span>
              <span className="tpl-hero-badge-item">{t('hero.badges.two')}</span>
              <span className="tpl-hero-badge-item">{t('hero.badges.three')}</span>
            </div>
          </div>
        </TemplateHero>
      ) : null}

      {/* ── 2 · Approach ─────────────────────────────────────────── */}
      <section id="s2" className="tpl-about tpl-section-padding relative">
        <SectionMarker id="s2" show={showIds} />
        <div className="tpl-container">
          <div id="s2-a" className="relative mb-12 text-center tpl-reveal" data-reveal="fade-up">
            <SectionMarker id="s2-a" show={showIds} sub />
            <span className="tpl-accent-text">{t('approach.eyebrow')}</span>
            <h2 className="tpl-section-title">{t('approach.title')}</h2>
            <p className="tpl-section-subtitle">{t('approach.subtitle')}</p>
          </div>

          <div className="tpl-about-grid">
            {approach.map((key, i) => {
              const img = approachShots[i]
              const subId = `s2-${'bcd'[i]}`
              return (
                <div
                  key={key}
                  id={subId}
                  className={`tpl-about-item tpl-reveal ${i ? `tpl-delay-${i * 2}` : ''}`}
                  data-reveal="fade-up"
                >
                  <div className="tpl-about-img-wrapper tpl-reveal-media">
                    <SectionMarker id={subId} show={showIds} sub />
                    {img ? (
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(min-width: 992px) 33vw, 100vw"
                        className="tpl-about-img"
                        data-speed="1.06"
                      />
                    ) : null}
                  </div>
                  <div className="tpl-about-text">
                    <h3>{t(`approach.items.${key}.title`)}</h3>
                    <p>{t(`approach.items.${key}.body`)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 3 · Why CPI ──────────────────────────────────────────── */}
      <section id="s3" className="tpl-usp tpl-section-padding relative">
        <SectionMarker id="s3" show={showIds} />
        <div className="tpl-container">
          <div id="s3-a" className="tpl-usp-head relative tpl-reveal" data-reveal="fade-up">
            <SectionMarker id="s3-a" show={showIds} sub />
            <span className="tpl-accent-text">{t('usp.eyebrow')}</span>
            <h2 className="tpl-section-title">{t('usp.title')}</h2>
          </div>

          <div id="s3-b" className="tpl-usp-grid relative">
            <SectionMarker id="s3-b" show={showIds} sub />
            {uspKeys.map((key, i) => (
              <div
                key={key}
                className={`tpl-usp-item tpl-reveal ${uspDelays[i]}`}
                data-reveal="fade-up"
              >
                <span className="tpl-usp-icon" aria-hidden>
                  <UspIcon index={i} />
                </span>
                <p>{t(`usp.items.${key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 · What we do ───────────────────────────────────────── */}
      <section id="s4" className="tpl-facilities relative">
        <SectionMarker id="s4" show={showIds} />
        <div className="tpl-facilities-split">
          <div
            id="s4-a"
            className="tpl-facilities-image-pane tpl-reveal-media tpl-reveal"
            data-reveal="fade-right"
          >
            <SectionMarker id="s4-a" show={showIds} sub />
            {metierImage ? (
              <Image
                src={metierImage.src}
                alt={metierImage.alt}
                fill
                sizes="(min-width: 992px) 50vw, 100vw"
                className="tpl-facilities-img"
                data-speed="1.05"
              />
            ) : null}
          </div>

          <div className="tpl-facilities-content-pane">
            <div id="s4-b" className="tpl-facilities-inner relative tpl-reveal" data-reveal="fade-up">
              <SectionMarker id="s4-b" show={showIds} sub />
              <span className="tpl-accent-text">{t('metiers.eyebrow')}</span>
              <h2 className="tpl-section-title mb-8">{t('metiers.title')}</h2>
              <MetiersTabs tabs={metierTabs} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5 · Ranges ───────────────────────────────────────────── */}
      <section id="s5" className="tpl-rooms tpl-section-padding relative">
        <SectionMarker id="s5" show={showIds} />
        <div className="tpl-container">
          <div className="mb-12 text-center tpl-reveal" data-reveal="fade-up">
            <span className="tpl-accent-text">{t('lines.eyebrow')}</span>
            <h2 className="tpl-section-title">{t('lines.title')}</h2>
            <p className="tpl-section-subtitle">{t('lines.subtitle')}</p>
          </div>

          <div className="tpl-rooms-grid">
            {(
              [
                { key: 'land', href: '/terrains', img: landShot, id: 's5-a' },
                { key: 'homes', href: '/appartements', img: homeShot, id: 's5-b' },
              ] as const
            ).map((card, i) => (
              <div
                key={card.key}
                id={card.id}
                className={`tpl-reveal tpl-reveal-media relative ${i ? 'tpl-delay-2' : ''}`}
                data-reveal="fade-up"
              >
                <SectionMarker id={card.id} show={showIds} sub />
                <Link href={card.href} className="tpl-room-card">
                  {card.img ? (
                    <Image
                      src={card.img.src}
                      alt={card.img.alt}
                      fill
                      sizes="(min-width: 992px) 50vw, 100vw"
                      className="tpl-room-img"
                      data-speed="1.06"
                    />
                  ) : null}
                  <div className="tpl-room-info">
                    <h3>{t(`lines.${card.key}.title`)}</h3>
                    <p>{t(`lines.${card.key}.body`)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6 · Gallery ──────────────────────────────────────────── */}
      {galleryCards.length ? (
        <section id="s6" className="tpl-gallery-scroll tpl-section-padding relative">
          <SectionMarker id="s6" show={showIds} />
          <div className="tpl-container">
            <div className="tpl-gallery-shell">
              <div
                id="s6-a"
                className="tpl-gallery-intro relative tpl-reveal"
                data-reveal="fade-right"
              >
                <SectionMarker id="s6-a" show={showIds} sub />
                <span className="tpl-accent-text">{t('gallery.eyebrow')}</span>
                <h2 className="tpl-section-title">{t('gallery.title')}</h2>
                <p className="tpl-section-subtitle">{t('gallery.subtitle')}</p>
                <div className="tpl-gallery-copy">
                  <p>{t('gallery.copy.one')}</p>
                  <p>{t('gallery.copy.two')}</p>
                </div>
              </div>

              <div id="s6-b" className="tpl-gallery-track relative">
                <SectionMarker id="s6-b" show={showIds} sub />
                {galleryCards.map((card, i) => (
                  <article
                    key={card.src + i}
                    className={`tpl-gallery-card tpl-reveal ${i ? `tpl-delay-${['08', '16', '24'][i - 1]}` : ''}`}
                    data-reveal="fade-up"
                  >
                    <div className="tpl-gallery-media">
                      <Image
                        src={card.src}
                        alt={card.alt}
                        fill
                        sizes="(min-width: 992px) 60vw, 100vw"
                        className="tpl-gallery-image"
                        data-speed="1.05"
                      />
                    </div>
                    <div className="tpl-gallery-content">
                      <span className="tpl-gallery-kicker">
                        {String(i + 1).padStart(2, '0')} / {card.city ?? t('gallery.eyebrow')}
                      </span>
                      <h3 className="tpl-gallery-title">{card.title}</h3>
                      {card.excerpt ? (
                        <p className="tpl-gallery-text">{card.excerpt}</p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 7 · Feature gallery (scroll-driven) ──────────────────── */}
      {featureSlides.length ? (
        <FeatureGallery
          slides={featureSlides}
          labels={{ prev: t('feature.prev'), next: t('feature.next'), skip: t('feature.skip') }}
          cardMarker={<SectionMarker id="s7-a" show={showIds} sub />}
        >
          <SectionMarker id="s7" show={showIds} />
        </FeatureGallery>
      ) : null}

      {/* ── 8 · Video ────────────────────────────────────────────── */}
      {founder?.videoUrl ? (
        <section id="s8" className="tpl-showcase-section tpl-section-padding relative">
          <SectionMarker id="s8" show={showIds} />
          <div className="tpl-container">
            <div className="tpl-showcase-wrap">
              <div className="tpl-showcase">
                <div id="s8-a" className="relative w-full">
                  <SectionMarker id="s8-a" show={showIds} sub />
                  <VideoShowcase
                    url={founder.videoUrl}
                    poster={showcaseImage}
                    posterAlt={videoPoster?.alt ?? ''}
                    playLabel={t('showcase.play')}
                  />
                </div>

                <div
                  id="s8-b"
                  className="tpl-showcase-panel tpl-reveal"
                  data-reveal="fade-right"
                >
                  <SectionMarker id="s8-b" show={showIds} sub />
                  <span className="tpl-showcase-kicker">{t('showcase.kicker')}</span>
                  <h2 className="tpl-showcase-title">{founder.videoLabel ?? founder.name}</h2>
                  <p className="tpl-showcase-text">
                    {[founder.name, founder.role].filter(Boolean).join(' — ')}
                  </p>
                  <div className="tpl-showcase-specs">
                    <span className="tpl-showcase-spec">{t('showcase.specs.one')}</span>
                    <span className="tpl-showcase-spec">{t('showcase.specs.two')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 9 · Register ─────────────────────────────────────────── */}
      <section id="s9" className="tpl-register relative">
        <SectionMarker id="s9" show={showIds} />
        <div className="tpl-register-split">
          <div
            id="s9-a"
            className="tpl-register-image-pane tpl-reveal-media tpl-reveal"
            data-reveal="fade-right"
          >
            <SectionMarker id="s9-a" show={showIds} sub />
            {registerImage ? (
              <Image
                src={registerImage.src}
                alt={registerImage.alt}
                fill
                sizes="(min-width: 992px) 50vw, 100vw"
                className="tpl-register-img"
                data-speed="1.05"
              />
            ) : null}
          </div>

          <div className="tpl-register-form-pane">
            <div id="s9-b" className="tpl-register-inner relative tpl-reveal" data-reveal="fade-up">
              <SectionMarker id="s9-b" show={showIds} sub />
              <h2 className="tpl-section-title">{t('register.title')}</h2>
              <p className="tpl-register-desc">{t('register.desc')}</p>
              <TemplateRegisterForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * The template pulls these from Font Awesome, which is not in the bundle.
 * Inline strokes instead — nine glyphs is far cheaper than an icon font, and
 * they inherit `currentColor` so the brand token applies without a filter.
 */
function UspIcon({ index }: { index: number }) {
  const paths = [
    'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6', // serviced plots
    'M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h4', // verified deeds
    'M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7z', // legal practice
    'M3 7h18v12H3zM3 11h18M7 15h4', // instalments
    'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18', // diaspora
    'M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11zM12 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3', // sites
    'M4 20l6-6M14 4l6 6M9 4H4v5M20 15v5h-5', // surveyors
    'M7 3h10v18H7zM10 6h4M10 18h4', // digital tracking
    'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0', // families
  ]
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-8"
      aria-hidden
    >
      <path d={paths[index] ?? paths[0]} />
    </svg>
  )
}
