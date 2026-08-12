# CPI.sn — Rebuild Plan
### WordPress/Houzez → Next.js + Tailwind + Payload CMS

**Date:** 12 August 2026
**Status:** Phases 1–3 complete and verified — see §10. Phase 4 (Components) is next.
**Companion documents:**
- [`content-audit/INVENTORY.md`](content-audit/INVENTORY.md) — the full extracted content of the current site
- [`CLAUDE.md`](CLAUDE.md) — binding engineering conventions (i18n + theming rules)

---

## 1. Where we are today

`cpi.sn` is **Compagnie Prestige Immobilier**, a Senegalese real-estate developer with 20+ years of history. The current site runs WordPress + Elementor + the **Houzez** real-estate theme on Hostinger.

I extracted the whole site into `content-audit/`. Headline numbers:

| Content type | On the live site | Genuinely CPI's | Notes |
|---|---|---|---|
| Pages | 55 | ~24 | The rest are duplicates, orphans, or Houzez system pages |
| Blog posts | 12 | 12 | All real, all French, all well-written |
| Properties / programmes | 61 | **42** | 19 are untouched Houzez demo listings (Chicago, Miami, NY, LA) |
| Agents | 1 | 1 | Generic "CPI Immobilier" record |
| Testimonials | 4 | 0 usable | All four are empty placeholders |
| Property types | 17 terms | ~8 needed | Overlapping and inconsistent |
| Cities / areas | 40 / 41 | ~12 | Mostly empty Houzez demo taxonomy |

### What this tells us

The site's **content is good** — the blog is genuinely useful, the programme descriptions are detailed, the company history is rich. The **structure is the problem**:

1. **Demo content is still live.** Nineteen fake American listings with fake dollar prices are publicly reachable and in the sitemap. Google is indexing them.
2. **Duplicate pages.** Multiple `-copy`, `-copy-2`, `-2` pages are published, e.g. four near-identical variants of the Sangalkam F3B apartment sheet.
3. **The same thing is modelled three different ways.** Apartments exist as pages *and* as properties. "Projets réalisés" exists as a page, a property type, *and* a menu section.
4. **A whole user-account system nobody appears to use** — dashboard, favourites, saved searches, "create a listing", a shopping cart. This is Houzez boilerplate, not CPI's business.
5. **Taxonomy drift.** `Programme Immobilier – Réalisé`, `Programme Immobilier - En cours`, `Projets déjà réalisés`, `Nos Realisations`, `Projets en cours` all coexist and overlap.

The rebuild is the moment to fix all five.

---

## 2. What CPI actually sells

Stripping away the theme, the business has **four product lines** — and the site should say so plainly:

| Line | What it is | Current content |
|---|---|---|
| **Promotion foncière** | Serviced land plots (lotissements) sold to individuals | 11 sites: Ngolfagnick, Sangalkam, Sébikhotane, Bambilor, Lélo Sérère, Thiéo, Ndayanne, Léne, Noflaye… |
| **Promotion immobilière** | Buildings CPI develops — R+4/R+5 blocks, villas, apartments | ~16 realised, ~8 in progress |
| **Intermédiation** | Brokerage: buy / sell / rent on behalf of clients | Service page + forms |
| **Construction** | Turnkey builds, gros œuvre, custom projects | Service page + 3 project forms |

Plus a differentiator worth foregrounding: an **in-house legal practice** (Cabinet Conseil Juridique) handling title deeds and land disputes — a real trust signal in the Senegalese market, currently buried in a submenu.

---

## 3. Target architecture

```
cpi.sn/                        ← new Next.js app (folder to be created)
├── src/
│   ├── app/
│   │   ├── (site)/[locale]/   ← public website, locale-scoped
│   │   └── (payload)/         ← Payload admin + REST/GraphQL, auto-generated
│   ├── i18n/
│   │   ├── locales.ts         ← THE locale registry — drives everything (§6)
│   │   ├── routing.ts         ← next-intl config + translated pathnames
│   │   └── request.ts
│   ├── messages/
│   │   ├── fr.json            ← reference catalog
│   │   └── en.json            ← + wo.json / ha.json later
│   ├── styles/
│   │   └── tokens.css         ← semantic light/dark token layer (§7)
│   ├── collections/           ← Payload schema
│   ├── components/            ← React components ported from Ombara
│   ├── blocks/                ← page-builder blocks (Payload ↔ React)
│   └── lib/
├── brand/                     ← logo-light.png, logo-dark.png (already extracted)
├── payload.config.ts          ← reads locales from src/i18n/locales.ts
├── Dockerfile                 ← multi-stage, output: 'standalone'
├── docker-compose.yml         ← web + db, for Dokploy
└── tailwind.config.ts
```

**Stack**

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16, App Router, TypeScript** | As specified |
| Styling | **Tailwind CSS v4** | As specified |
| i18n | **next-intl**, JSON catalogs | FR/EN now, Wolof/Hausa later — see §6 |
| Theming | **next-themes** + semantic CSS tokens | Light/dark across the whole site — see §7 |
| CMS | **Payload 3** | Runs *inside* the Next.js app — one deploy, one repo, no separate CMS server |
| Database | **PostgreSQL 17**, own container | Relational fits properties↔taxonomies↔programmes; Payload supports it first-class |
| Media | **Local volume** mounted into the web container | Simplest on a VPS; Payload storage adapters make S3 a later swap |
| Forms | **Payload Form Builder plugin** | CPI has 8+ lead forms; marketing must edit them without a developer |
| Checkout | **Cart → WhatsApp handoff** | No payment gateway, no accounts — see §4 |
| Hosting | **Self-hosted VPS via Dokploy**, Docker | As specified |
| Email | **Resend** (or SMTP) | Form notifications to `contact@cpi.sn` |

### Deployment — VPS + Dokploy

Two containers, orchestrated by `docker-compose.yml`; Dokploy handles reverse proxy, TLS and
redeploys.

| Container | Image | Notes |
|---|---|---|
| `web` | Multi-stage build of this repo | Next.js + Payload in one process |
| `db` | `postgres:17-alpine` | Named volume `pgdata` |

Things this changes versus a Vercel deploy, and how they're handled:

- **`output: 'standalone'`** in `next.config.ts` so the runtime image ships only the traced
  dependencies — the difference between a ~1.2 GB image and ~200 MB.
- **`sharp` must be installed in the runner stage.** Without it Next.js image optimization
  silently degrades; on Vercel it's provided for you, in Docker it isn't.
- **Uploads live on a mounted volume** (`media:/app/media`), not in the image. Anything written
  into the container filesystem is lost on redeploy — this is the single most common way a
  self-hosted Payload install loses client uploads. The volume must be in Dokploy's backup set
  alongside `pgdata`.
- **Migrations run on container start**, not at build time — the build has no DB access.
- **ISR cache is per-container.** Fine at one replica; if CPI ever scales to two, the cache needs
  to move to Redis or shared storage. Noted so it isn't a surprise later.
- **A `/api/health` endpoint** for Dokploy's healthcheck, so a failed boot doesn't silently serve
  a dead container.
- **Secrets** (`DATABASE_URI`, `PAYLOAD_SECRET`, mail credentials) come from Dokploy's env
  management — never committed, never baked into the image.

**Why Payload rather than headless WordPress or MDX files:** the client already edits content daily in a WordPress admin. Taking that away breaks their workflow. Payload gives them a familiar admin, but with a *clean schema we design* instead of Houzez's 40-field mess — and it lives in the same TypeScript codebase, so content types are type-safe end to end.

---

## 4. Payload schema

### Collections

**`properties`** — the core collection. Covers terrains, immeubles, villas, apartments.

```
title, slug, excerpt
productLine     → 'foncier' | 'immobilier'          (relationship: product-lines)
kind            → terrain | villa | appartement | immeuble | bureau | commerce
status          → disponible | en-cours | realise | vendu | a-louer
description     → richText
gallery         → array of media
featuredImage   → media
location { city, area, address, lat, lng }
specs { surface, surfaceUnit, plotSize, bedrooms, bathrooms, floors, year }
pricing { price, currency, priceLabel, showPrice: bool }
features        → relationship[] → amenities
titleDeed       → text  (TF number — matters commercially in Senegal)
brochure        → media (PDF)
seo { title, description, ogImage }
featured        → bool
publishedAt, _status (draft/published)
```

**`posts`** — the blog. `title, slug, excerpt, content (richText/blocks), coverImage, category, tags, author, readingTime, publishedAt, seo`.

**`pages`** — flexible marketing pages built from **blocks**, so À propos / Nos services / landing pages are editable without deploys:
`Hero`, `RichText`, `StatsCounter`, `Timeline`, `ValueGrid`, `ServiceSplit`, `PropertyCarousel`, `Gallery`, `Testimonials`, `FAQ`, `CTABanner`, `FormBlock`.

**Supporting collections:** `media`, `categories`, `amenities`, `cities`, `product-lines`, `team` (leadership — the À propos page has a real team section), `testimonials` (schema ready; content needs collecting), `users` (admin only), `leads` (form submissions, with export).

### Globals
`site-settings` (contacts, socials, logo, WhatsApp number), `navigation` (header + footer menus), `home-page`.

### Cart → WhatsApp handoff

Replaces the Houzez cart and account system. **No accounts, no auth, no payment gateway.**

```
Property page  →  "Ajouter à ma sélection"
                        ↓
Cart (client-side, localStorage)  →  /ma-selection
                        ↓
              "Finaliser ma demande"
                        ↓
      POST /api/leads  ──→  Payload `leads` (saved FIRST)
                        ↓
   window.open(wa.me/221764508374?text=…)  → WhatsApp with prefilled message
```

Design decisions worth stating, because they're where this pattern usually goes wrong:

1. **The lead is persisted before the WhatsApp redirect, not after.** If we only handed off to
   WhatsApp, every abandoned conversation would be invisible to CPI. Saving first means the sales
   team sees the enquiry even when the visitor never presses send. This is the whole commercial
   value of the feature.
2. **Cart state is client-side only** (localStorage + a small store). No DB writes until checkout,
   so no orphan rows and no session infrastructure.
3. **The message is generated from an i18n template, not concatenated.** It's user-facing text and
   lives in `messages/<locale>.json` like everything else (§6).
4. **`wa.me` URLs have a practical length limit (~2 000 chars).** With 10+ items the prefilled text
   would silently truncate, so long carts send a short summary plus a reference number
   (`CPI-2026-0413`) that resolves to the saved lead in the admin.
5. **The WhatsApp number is a Payload global**, not a constant — CPI will change it.
6. **Prices are usually absent** (§11.9), so the message must read correctly with "Prix sur
   demande" for most lines rather than showing `0 FCFA`.

Message shape, roughly:

```
Bonjour CPI, je suis intéressé(e) par :
• Ngolfagnick — Terrain 300 m² — Prix sur demande
• Sangalkam (TF 7350/R) — Appartement F3B — 50 000 000 FCFA
Référence : CPI-2026-0413
```

The `leads` collection therefore covers both form submissions and cart enquiries:
`type` (form | cart), `reference`, `items[]` (relationship → properties), `contact {name, phone, email}`,
`message`, `locale`, `status` (nouveau | contacté | converti | perdu), `createdAt`.

### Decisions baked in
- **Blog → Payload:** yes, confirmed.
- **Properties/terrains → Payload:** yes, recommended. They change often (new plots, sold-out status) and the client must edit them. Static MDX would mean a developer for every price change.
- **Taxonomy cleanup on migration:** collapse 17 property types → `kind` (6 values) + `productLine` (2) + `status` (4). This is the single biggest structural win.

---

## 5. Route map (old → new)

Every old URL gets a 301 so the existing Google ranking survives.

| New route | Source | Old URL(s) redirected |
|---|---|---|
| `/` | Home | `/` |
| `/a-propos` | Page | `/a-propos/` |
| `/nos-services` | Page + block | `/nos-services/`, `/conseil/` |
| `/nos-services/promotion-fonciere` | Page | `/promotion-fonciere/` |
| `/nos-services/promotion-immobiliere` | Page | `/promotion-immobiliere-2/` |
| `/nos-services/intermediation` | Page | `/intermediation/` |
| `/nos-services/construction` | Page | `/construction/` |
| `/nos-services/conseil-juridique` | Page | `/cabinet-conseil-juridique/`, `/besoin-dun-conseil-juridique/`, `/cabinet-client/` |
| `/terrains` | Properties, filtered | `/nos-produits/`, `/devenez-proprietaire-dun-terrain/` |
| `/terrains/[slug]` | Property | `/property/ngolfagnick/` etc. |
| `/programmes` | Properties, filtered | `/nos-programmes/`, `/list-layout-full-width/` |
| `/programmes/en-cours` | Filter view | `/projets-en-cours/`, `/programmes-immobiliers-en-cours/`, `/programmes-immobiliers-en-cours-1/` |
| `/programmes/realises` | Filter view | `/projets-deja-realises/`, `/programme-foncier-realise/`, `/programme-immobilier-realises/` |
| `/programmes/[slug]` | Property | `/property/immeuble-moderne-r5/` etc. |
| `/appartements` | Properties, `kind=appartement` | `/appartements-disponible/` + the 6 duplicate apartment pages |
| `/blog` | Posts | `/blog/` |
| `/blog/[slug]` | Post | 12 article URLs — **keep slugs unchanged** |
| `/blog/categorie/[slug]` | Category | `/category/*/` |
| `/contact` | Page + form | `/contactez-nous/` |
| `/devenir-partenaire` | Page + form | `/devenir-partenaire-cpi/` |
| `/demande/[slug]` | Form pages | the 5 `formulaire-*` + inscription pages |
| `/references` | Page | `/clients/` |
| `/politique-de-confidentialite` | Page | `/privacy/` |
| `/ma-selection` | Cart → WhatsApp (§4) | `/panier/` |
| **410 Gone** | — | 19 demo properties, all `-copy` duplicates |
| **Dropped** | — | `/my-profile/`, `/my-properties/`, `/mon-compte/`, `/tableau-de-bord/`, `/proprietes-preferees/`, `/recherche-enregistree/`, `/creer-une-annonce/`, `/informations-sur-ladhesion/` |

Navigation also gets simplified — the current menu has a four-level deep "PROJETS" branch where every leaf is a filter of the same collection:

```
À PROPOS   PROJETS ▾   TERRAINS ▾   SERVICES ▾   BLOG   CONTACT
                │           │            │
        En cours / Réalisés │       5 service pages
                        9 sites
```

---

## 6. Internationalization

**Locked: French (default) + English at launch, built so Wolof and Hausa are a data change later.**
Binding rules live in [`CLAUDE.md`](CLAUDE.md); this section is the architecture.

### Two translation systems, deliberately separate

| | UI strings | CMS content |
|---|---|---|
| Lives in | `src/messages/<locale>.json` | Payload localized fields |
| Contains | Nav, buttons, labels, form validation, empty/error states | Page copy, blog posts, property descriptions |
| Edited by | Developer / translator, in git | Client, in the Payload admin |
| Format | ICU MessageFormat, nested namespaces | Lexical rich text |

Rule of thumb: **if a translator would need to see the site to translate it, it belongs in Payload.**

### One registry drives everything

```ts
// src/i18n/locales.ts — the single source of truth
export const locales = [
  { code: 'fr', label: 'Français', dir: 'ltr', default: true },
  { code: 'en', label: 'English',  dir: 'ltr', fallback: 'fr' },
  // later: { code: 'wo', label: 'Wolof',  dir: 'ltr', fallback: 'fr' },
  // later: { code: 'ha', label: 'Hausa',  dir: 'ltr', fallback: 'fr' },
]
```

This one array feeds the `next-intl` config, `<html lang>`/`dir`, the language switcher, sitemap
`hreflang` tags, **and** Payload's `localization.locales`. Adding Wolof = add an entry + a JSON file.
No component, route or config edits. If that ever stops being true, the abstraction has leaked.

### Decisions worth flagging

- **URLs: French stays unprefixed.** `/a-propos` for French, `/en/about` for English
  (`localePrefix: 'as-needed'`). This is what preserves the entire 301 map in §5 and the existing
  French search ranking — a prefixed default (`/fr/a-propos`) would invalidate every redirect.
- **Route segments are translated too**, so English reads `/en/about`, not `/en/a-propos`.
- **Fallback is `wo → fr`, not `→ en`.** Senegalese users read French as their second language.
  Falling back to English would be actively worse than falling back to French.
- **Currency is XOF (franc CFA), which has no minor unit** — never render decimals. Senegalese
  convention is space-separated thousands: `25 000 000 FCFA`.
- **CI fails on incomplete catalogs.** Every locale's key set must match `fr.json`, so a missing
  translation is a build error rather than a raw key shown to a visitor.
- **RTL-ready without RTL work now.** Hausa online is Latin script (Boko), so all four locales are
  LTR. But the registry carries `dir`, and we use logical CSS properties (`ms-*`/`me-*`) throughout,
  so an RTL language later doesn't mean re-auditing every component.

### Content cost, stated plainly

English doubles the translation workload for **12 blog posts, ~24 pages and 42 property
descriptions**. The build supports it from day one; the *content* is a client deliverable. My
suggestion: launch English with nav, UI, service pages and property listings translated, and let
blog articles fall back to French initially rather than blocking launch on 12 article translations.

---

## 7. Theming — light / dark

**Locked: the whole site works in both themes.** Light is default; the toggle offers
light / dark / system, persisted, with no flash on load.

### The palette is CPI's existing one: burgundy + neutrals, no gold

Confirmed against both the site CSS and the logo artwork. `#65000d` appears 50 times in the
homepage CSS and `#5a0f11` 42 times; the logo is solid burgundy (`#601818`/`#5a1010` after
antialiasing) with grey roof tiles. **Single brand hue, plus neutrals.**

Colors I'd initially flagged as brand and have now ruled out — worth recording so nobody
re-introduces them:

| Color | What it actually is |
|---|---|
| `#D4AF37` gold | A decorative inline SVG icon path, repeated 6× |
| `#004274`, `#cc232a`, `#00aeff` | Social-share button backgrounds from a WordPress plugin |

### One hue makes the token layer *more* necessary, not less

`#65000d` scores **12.91:1 on light** but **1.31:1 on dark** — unusable. With no second brand
color to lean on, dark mode has to come out of the burgundy ramp itself:

| Token | Light mode | Dark mode |
|---|---|---|
| `text-brand` | `burgundy-800` `#66000e` — 12.81:1 ✅ | `burgundy-400` `#d45e6e` — 4.97:1 ✅ |
| `bg-brand-solid` | `burgundy-800`, white text | `burgundy-700`/`800`, white text |
| `border-brand` | `burgundy-600` | `burgundy-400` |

Full ramp, hue 352 — the 800 step is CPI's existing brand color, so light mode is unchanged from today:

```
50  #f9f6f6    300 #db9fa7    600 #970c1f    900 #52000b
100 #f3eced    400 #d45e6e    700 #7a0010    950 #330007
200 #e8d4d7    500 #c52036    800 #66000e  ← current brand
```

Neutrals come from the logo's greys (`#282828`, `#403838`, `#515151`, `#a1a7a8`, `#dce0e0`), and
the **dark surface is warm `#171214`, not Ombara's cool navy `#121921`** — a warm burgundy on a
cool blue-grey ground reads as a mismatch.

Components only ever reference the semantic layer:

```
bg-surface · bg-surface-raised · text-foreground · text-muted
border-subtle · text-brand · bg-brand-solid
```

Target is **WCAG AA in both themes** — 4.5:1 body, 3:1 large text and UI boundaries.

### Ombara's gold becomes CPI primary — settled

The template uses `--color-secondary: #c5a880` sand-gold in five places. All become `#65000D`:

| Template usage | Where it appears | CPI |
|---|---|---|
| `.accent-text` | Script accent headings | `burgundy-800` (and the Allura script itself is dropped) |
| `.border-left-gold` | 3px decorative left rule | `burgundy-800` |
| `.hero-nav-progress-v2` | Hero slider progress bar | `burgundy-300` — sits on photography |
| `.feature-gallery-scroll__progress-fill` | Gallery scroll progress | `burgundy-300`/`800` by ground |
| `.swiper-pagination-bullet-active` | Active carousel dot | `burgundy-800` |

The only adjustment is tonal, not chromatic: accents sitting **on dark grounds** (the hero progress
bar over photography) take a lighter step of the same ramp, because `#65000D` on a dark image is
invisible. Same brand color throughout — never a different hue.

### Logo variants — resolved, both already exist

CPI already had a white logo in its media library; no new artwork was needed. Both masters are now
extracted, trimmed and committed to [`brand/`](brand/):

| File | Source | Size | Use |
|---|---|---|---|
| `brand/logo-dark.png` | `LOGO-CPI-ROUGE-scaled.png` | 2560×1138 | Light backgrounds |
| `brand/logo-light.png` | `LOGO-BLANC-scaled-*.png` | 2349×1133 | Dark backgrounds |

Both are transparent PNGs of the full lockup (roof motif + CPI + rule + COMPAGNIE PRESTIGE
IMMOBILIER). Converted to SVG or WebP in phase 1.

⚠️ **Small discrepancy worth a decision later:** the master artwork's burgundy is **`#5d1615`**,
while the website CSS uses **`#65000D`**. They're close but not identical. Per your instruction the
brand token is `#65000D`; flagging it only so nobody later "fixes" one to match the other by
accident. Aligning the logo file to `#65000D` is a five-minute job if CPI ever wants exact parity.

### Mechanics

- Tailwind v4 `@custom-variant dark`, class on `<html>`, tokens as CSS custom properties.
- `next-themes` with an inline pre-hydration script — no flash, no hydration mismatch.
- Logo swaps light/dark variants via CSS, not JS (CPI's light variant still needed — §11).
- Photos get a slight brightness reduction in dark mode — never inverted.
- Payload's admin has its own dark mode built in; nothing to do there.

### Note on the template's `dark.css`

Ombara ships `css/dark.css`, and it is **reference only — we do not port it.** It redefines three
variables and patches the rest with `body[data-bs-theme="dark"] … !important`, and it reuses
`--color-primary` as a *text* color. That's precisely the shortcut that collapses once a real brand
palette is introduced — which is why the numbers above matter. There's also no toggle in the
template at all; the theme switcher is new work either way.

---

## 8. Design system — Ombara → CPI

**The template is a skeleton: structure, layout rhythm and section composition only.** It's a
luxury *hotel* theme and CPI is a *property developer* — we take the bones, not the skin, and
deviate wherever something fits CPI better. Fidelity to Ombara is not a goal in itself.

What that means concretely:

- **None of its color scheme is inherited** — CPI's existing palette applies throughout.
- **Sections get reordered, merged or dropped** where a real-estate audience is better served.
  A hotel leads with *experience*; a developer leads with *trust and inventory*.
- **Its markup is read for structure, never copied** — everything is rewritten React + Tailwind.

### Palette swap

Ombara ships navy + sand-gold. **CPI keeps its existing identity — burgundy + neutrals, no gold.**
The template's restraint holds up on a single hue; it just needs its secondary role rethought:

| Ombara token | Ombara | CPI |
|---|---|---|
| `--color-primary` | `#0b2d4b` navy | **`#65000d`** burgundy (unchanged from today) |
| `--color-primary-dark` | `#0e263a` | **`#5a0f11`** |
| `--color-secondary` | `#c5a880` sand-gold | **`#65000D`** — no separate accent hue (§7) |
| `--color-light` | `#fbfbf8` | `#fbfaf8` |
| Dark surface | `#121921` cool navy | **`#171214`** warm — matches a burgundy brand |

⚠️ These are the **base hues, not the tokens components use.** As shown in §7, burgundy is unusable
on a dark surface (1.31:1), so it's expanded into a 50–950 ramp and components reference semantic
tokens that resolve to different steps per theme. Ombara's flat one-variable-per-color model does
not survive dark mode.

### Typography
Keep the template's pairing — it's genuinely good and reads as premium:
- **Headings:** Cormorant Garamond (serif)
- **Body:** Inter
- **Accent/script:** Allura — use *very* sparingly, or drop it. Script fonts age fast on a corporate site.

All three are Google Fonts; load via `next/font` for zero layout shift.

**Glyph coverage check needed before adding Wolof.** Wolof orthography uses `ŋ`, `ñ`, `ë`, `à`, `ó`.
Inter covers these; Cormorant Garamond's coverage of `ŋ` (eng) needs verifying, and Allura almost
certainly lacks it. Worth confirming when we add the locale rather than discovering it in headings.

### Section → page mapping

| Ombara section | Becomes |
|---|---|
| `hero` (video/slider) | Homepage hero — CPI already has a YouTube background video |
| `about` + `usps` | "20 ans d'expertise" + the 4 stat counters (`+10.000 familles`, etc.) |
| `facilities` (tabbed split) | **Nos 4 métiers** — foncier / immobilier / intermédiation / construction |
| `rooms` (card grid) | **Terrains disponibles** — the 9 active sites |
| `gallery-scroll` | Réalisations gallery |
| `register` (parallax form) | "Devenez propriétaire" lead capture |
| `rooms.html` | `/terrains` listing |
| `blog-rooms-detail.html` | Property detail page |
| `facilities.html` | `/nos-services` |
| `offer.html` | `/programmes` |
| `journal-*` / `blog-detail-*` styles | `/blog` and article pages |

### What has to be rebuilt rather than ported
The template is jQuery + Bootstrap + Swiper. In Next.js:
- **Bootstrap → Tailwind.** Rewrite, don't ship both.
- **jQuery → React.** No jQuery in the final bundle.
- **Swiper** → keep (has a React build) for hero and galleries.
- **Lenis** smooth scroll → keep, mount in a client provider.
- **Reveal-on-scroll** → `IntersectionObserver` hook, respecting `prefers-reduced-motion`.
- **`contact-submit.php`** → Next.js route handler + Payload `leads` + Resend.

### Video and placeholder policy

- **Video plays in an in-page modal — never a redirect to YouTube.** The homepage hero video
  (`youtu.be/zaN5H9ZZ0MI`) and any play button open a lightbox. Sending a visitor to YouTube loses
  the session to a page full of competitors' recommendations.
- Embeds use **`youtube-nocookie.com`**, loaded **only on click** — a facade (poster image + play
  button) rather than an iframe on page load. An eagerly-loaded YouTube iframe costs ~1 MB and
  several hundred ms of main-thread time on the mobile connections most CPI visitors are on.
- **Testimonials and team portraits ship as clearly-marked placeholders** until CPI supplies real
  ones. Placeholders use neutral silhouettes and obviously-fake names (`Client CPI`, `Membre de
  l'équipe`) — never invented quotes or fabricated people attributed to real-sounding names, which
  would be a trust problem on a site whose entire proposition is trust. Swapping them is a CMS
  edit, no deploy.

---

## 9. Migration

1. **Content** — script reads `content-audit/_data/*.json`, writes into Payload via its Local API. Rich text converts HTML → Lexical.
2. **Media** — ~500 images under `wp-content/uploads`. Download, dedupe, import into Payload on the mounted media volume, rewrite references. Next.js `<Image>` handles resizing, so the WordPress `-300x200` derivative sprawl gets dropped.
3. **Taxonomy remap** — explicit lookup table from the 17 old types to the new `kind`/`productLine`/`status` triple. Mapping table sent for approval before the import runs.
4. **Excluded** — 19 demo properties, `-copy` duplicates, Houzez account pages.

---

## 10. Phases

| # | Phase | Output |
|---|---|---|
| 0 | ✅ **Validation** | `content-audit/` reviewed, all §11 decisions settled |
| 1 | ✅ **Foundation** | Next 16 + Tailwind v4 + Payload 3 scaffold, Dockerfile + docker-compose, locale registry, translated routing, semantic light/dark tokens, health check. Build + typecheck + catalog parity all green |
| 2 | ✅ **Schema** | 11 collections, 2 globals, 12 page blocks, 117 tables. Localized fields wired to the registry; admin verified in French. Docker image builds (478 MB) |
| 3 | ✅ **Migration** | 42 properties, 12 posts, 54 images, taxonomies and globals imported into `fr`. Blog slugs byte-identical. Taxonomy mapping in [`content-audit/MAPPING.md`](content-audit/MAPPING.md) |
| 4 | Components ← *next* | Ombara ported to React/Tailwind — header, hero, cards, gallery, footer. **Every component reviewed in both themes as it's built**, not audited at the end |
| 5 | Pages | Home, À propos, Services, Terrains, Programmes, Blog, Contact |
| 6 | Forms, cart & leads | 8 lead forms, **cart → WhatsApp handoff (§4)**, notifications, admin inbox, export |
| 7 | English locale | `en.json` catalog, translated route segments, language switcher, `hreflang`. Content translation is a client deliverable (§6) |
| 8 | SEO & polish | 301 map, sitemap, JSON-LD (`RealEstateListing`), OG images, Lighthouse, contrast audit in both themes |
| 9 | Launch | Staging review, DNS cutover, WordPress archived read-only |

---

## 11. Decisions — all settled

Everything needed to start building is confirmed. Recorded here as the reference for later.

| # | Decision | Outcome |
|---|---|---|
| 1 | **Languages** | FR (default) + EN at launch; JSON catalogs so Wolof/Hausa are a data change later (§6) |
| 2 | **Light/dark mode** | Required across the whole site (§7) |
| 3 | **Palette** | CPI's existing burgundy `#65000D` + neutrals. **No gold** — it was a decorative SVG icon |
| 4 | **Template role** | Skeleton only; deviate wherever it serves CPI better (§8) |
| 5 | **Ombara's gold accents** | All become `#65000D`; lighter ramp step only where the ground is dark (§7) |
| 6 | **Hosting** | Self-hosted VPS via **Dokploy** — `web` + `db` containers, Dockerfile + docker-compose (§3) |
| 7 | **Homepage base** | Ombara `index.html` (v1) |
| 8 | **User accounts** | **Dropped.** Replaced by cart → WhatsApp handoff, no auth (§4) |
| 9 | **Demo listings** | All 19 deleted, 410 Gone |
| 10 | **Taxonomy** | Consolidate 17 → `productLine` × `kind` × `status`; mapping table sent before import |
| 11 | **Prices** | "Prix sur demande" is the default; price optional per listing |
| 12 | **English scope** | Nav, UI, service pages and listings translated for launch; the 12 blog articles fall back to French |
| 13 | **Logo** | Already existed — both variants extracted to [`brand/`](brand/) (§7) |
| 14 | **Testimonials** | Marked placeholders until CPI supplies real quotes; video opens in a modal, never a YouTube redirect (§8) |
| 15 | **Team photos** | Placeholder portraits until CPI supplies real ones (§8) |

### Two things still needed from CPI (content, not blockers)

Neither blocks development — both are CMS edits once they arrive:

- **Real client testimonials.** The highest-value missing content for a business whose entire
  proposition is trust.
- **Leadership team portraits** for the À propos page.
---

## 12. Risks

| Risk | Mitigation |
|---|---|
| SEO loss at cutover | Full 301 map (§5); keep blog slugs byte-identical; submit new sitemap on launch day |
| Media migration gaps | Automated link-checker across all migrated rich text before launch |
| Client can't edit new admin | Payload admin in French + a short handover doc and walkthrough |
| Scope creep from "while we're at it" | Product lines and routes are fixed in §2/§5; anything new goes to a v2 list |
| Elementor content loses layout | Marketing pages rebuilt as blocks, not pasted HTML — text is preserved, layout is redesigned |
| Hardcoded strings creep in, blocking Wolof later | Lint rule against literal user-facing text in JSX; CI diffs every catalog against `fr.json` |
| Dark mode degrades into per-component patches | Semantic tokens only, enforced in review; no raw brand hex in components (`CLAUDE.md`) |
| English locale ships half-translated | Missing keys fail the build rather than rendering raw keys to visitors |
| Locale prefix change breaks the 301 map | `localePrefix: 'as-needed'` with French unprefixed is a fixed decision, recorded in `CLAUDE.md` |
| **Uploads lost on redeploy** (self-hosting's classic failure) | Media on a named volume, never the container FS; volume in Dokploy's backup set beside `pgdata` |
| Cart enquiries lost when a visitor abandons WhatsApp | Lead is persisted to Payload *before* the redirect, never after (§4) |
| WhatsApp URL truncates a long cart | Carts over the ~2 000-char limit send a summary + reference number resolving to the saved lead |
| Placeholder testimonials mistaken for real ones | Neutral silhouettes and obviously-generic names — never invented quotes attributed to plausible people |

---

## Appendix — where the extracted content lives

```
content-audit/
├── INVENTORY.md          master map: triage of all 55 pages, 42 real properties, 12 posts
├── NAVIGATION.md         menu tree, header, footer, contacts, socials
├── pages/       (55)     per-page: metadata, heading outline, full text, images, links
├── posts/       (12)     per-article, with categories and tags
├── properties/  (61)     per-listing, with every Houzez field decoded
└── _data/                pages · posts · properties · taxonomies · navigation · agents · testimonials (JSON)
```
