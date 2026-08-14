# CPI.sn — Project Conventions

Rebuild of `cpi.sn` (Compagnie Prestige Immobilier, Senegalese real-estate developer)
from WordPress/Houzez to **Next.js 16 (App Router) + Tailwind v4 + Payload 3**.

- Full rebuild plan: [`plan.md`](plan.md)
- Extracted content of the old site: [`content-audit/`](content-audit/)
- Base design template: [`ombarahtml-10/HTML/`](ombarahtml-10/HTML/) (Ombara luxury hotel theme)

---

## How the Ombara template is used

**The template is a skeleton — structure, layout rhythm and section composition only.**
It is a luxury *hotel* theme; CPI is a *property developer*. Take the bones, not the skin.

1. **Deviate whenever it fits CPI better.** The template is a starting point, not a spec. If a
   section works better reordered, merged, dropped or replaced for a real-estate audience, do that
   and note why. Fidelity to Ombara is never a goal in itself.
2. **None of the template's color scheme is inherited.** CPI already has a palette (below).
   Ombara's navy `#0b2d4b` and sand-gold `#c5a880` do not appear anywhere in the build.
3. **Anywhere the template uses gold, use CPI primary `#65000D`.** See the theming rules for the
   one mechanical exception (accents sitting on dark grounds, which take a lighter ramp step).
4. **`css/dark.css` is reference only — never ported.** See the note at the end of the theming
   section for why.
5. **Its markup is jQuery + Bootstrap.** Everything is rewritten as React + Tailwind; the template
   files are read for structure, never copied wholesale.

---

## Internationalization

**Locked decision: all UI strings live in JSON message catalogs. Never hardcode user-facing text in components.**

Launch locales are **French (default)** and **English**. Wolof and Hausa are planned. The whole
i18n layer is therefore built so that *adding a language is a data change, not a code change*.

### Rules

1. **One locale registry, single source of truth** — `src/i18n/locales.ts`. It drives the
   `next-intl` config, the `<html lang>`/`dir` attributes, the language switcher, the sitemap
   `hreflang` tags, **and** Payload's `localization.locales`. Adding a language means adding one
   entry here plus one JSON file. Nothing else.

2. **UI strings → JSON, CMS content → Payload.** Two different systems, don't mix them:
   - Chrome, labels, buttons, form validation, error states, empty states → `src/messages/<locale>.json`
   - Page copy, blog posts, property descriptions → Payload localized fields
   Rule of thumb: if a translator would need to see the site to translate it, it belongs in Payload.

3. **Namespaced, nested JSON keys** mirroring feature structure — `nav.*`, `home.hero.*`,
   `property.specs.*`, `forms.contact.*`, `common.*`. Never flat dot-strings as literal keys.
   `fr.json` is the reference catalog; every other locale mirrors its shape.

4. **ICU MessageFormat** for plurals, gender and interpolation. Do not concatenate translated
   fragments — word order differs across languages. Wolof and Hausa in particular do not follow
   French clause order.

5. **URL strategy: `localePrefix: 'as-needed'`.** French is unprefixed (`/a-propos`), every other
   locale is prefixed (`/en/about`). This is deliberate — it preserves the 301 redirect map in
   `plan.md` §5 and the existing French Google ranking. Do not change it to always-prefix.

6. **Localized route segments.** Pathnames are translated via next-intl's `pathnames` map, so
   English gets `/en/about` rather than `/en/a-propos`. Slugs for CMS content are localized fields.

7. **Fallback chain is `wo → fr` and `ha → fr`, not `→ en`.** Senegalese and regional users read
   French as their second language, not English. Configure fallbacks explicitly per locale;
   never rely on a global fallback to English.

8. **Formatting always goes through `next-intl`** (`useFormatter`) — dates, numbers, currency.
   Prices are **XOF (franc CFA)**, which has *no minor unit*: never render decimals. Senegalese
   convention is space-separated thousands (`25 000 000 FCFA`).

9. **Never ship a partially translated catalog silently.** CI checks that every locale's key set
   matches `fr.json`; missing keys fail the build rather than rendering a raw key to a user.

### Adding a locale later (Wolof / Hausa)

```
1. src/i18n/locales.ts   → add { code: 'wo', label: 'Wolof', dir: 'ltr', fallback: 'fr' }
2. src/messages/wo.json  → copy fr.json, translate
3. payload.config.ts     → picks it up automatically from the registry
4. Translate CMS content in the Payload admin's locale switcher
```

No component, route or config changes. If that is ever not true, the abstraction has leaked — fix it.

**Script note:** Hausa is written in Latin script (Boko) online, so `dir: 'ltr'`. Ajami
(Arabic script) exists but is rare digitally. The registry carries a `dir` field regardless, so
an RTL locale can be added without reworking layout — use logical CSS properties
(`ms-*`/`me-*`, `ps-*`/`pe-*`) rather than `ml-*`/`mr-*` everywhere.

---

## Theming — dark / light mode

**Locked decision: every surface, component and page must work in both themes.** Light is the
default.

**The toggle is two-state — light / dark. There is no "system".** It was a three-way cycle
(light → dark → system) and that is exactly what made it feel broken: a fresh visitor's stored value
was `system`, so the first click only moved to `light`, which usually looked identical to what was
already on screen, and reaching dark took two clicks. `ThemeProvider` therefore sets
`defaultTheme="light"` with `enableSystem={false}`, which makes the switch a plain boolean. The cost
— "follow my OS setting" no longer exists — is a deliberate product decision, not an oversight. Do
not "restore" system detection without raising it first.

### Rules

1. **Semantic tokens only. Never reference a brand hex directly in a component.**
   Components use `bg-surface`, `text-foreground`, `border-subtle`, `text-brand`,
   `bg-brand-solid`, `text-accent` — never `bg-[#65000d]` or `text-burgundy-700`.

2. **CPI's brand is a single hue: burgundy, plus neutrals. There is no gold.**
   The brand token is **`#65000D`** (with `#5a0f11` as its dark step) — the value used throughout
   the current site's CSS. The master logo artwork is a slightly different `#5d1615`; that
   difference is known and accepted, so don't "fix" either to match the other. Do not introduce a
   secondary brand hue.

   Colors that look like brand but are **not** — do not use them as tokens:
   `#D4AF37` (gold) is a decorative inline SVG icon; `#004274`, `#cc232a`, `#00aeff` are
   social-share button backgrounds from a WordPress plugin.

3. **One hue means dark mode must come from the ramp, not from a second color.** `#65000d` scores
   12.91:1 on light but **1.31:1 on dark** — unusable. There's no second brand color to fall back
   on, so burgundy is expanded into a 50–950 ramp and the semantic token resolves to a different
   step per theme:

   | Token | Light mode | Dark mode |
   |---|---|---|
   | `text-brand` | `burgundy-800` `#66000e` — 12.81:1 ✅ | `burgundy-400` `#d45e6e` — 4.97:1 ✅ |
   | `bg-brand-solid` | `burgundy-800` (white text) | `burgundy-700`/`800` (white text) |
   | `border-brand` | `burgundy-600` | `burgundy-400` |

   Full ramp (hue 352): `50 #f9f6f6 · 100 #f3eced · 200 #e8d4d7 · 300 #db9fa7 · 400 #d45e6e ·
   500 #c52036 · 600 #970c1f · 700 #7a0010 · 800 #66000e · 900 #52000b · 950 #330007`

4. **Every Ombara gold accent becomes CPI primary `#65000D`.** The template uses
   `--color-secondary: #c5a880` for accent text, decorative left-borders (`.border-left-gold`),
   hero/gallery progress bars and active pagination dots. All of them take burgundy instead.

   The one mechanical exception: accents that sit **on dark grounds** — the hero eyebrow over
   photography, anything on a dark section — take `--accent-on-dark`, which resolves to
   **`burgundy-200`**. `#65000D` on dark imagery is invisible, and `burgundy-300` measured only
   **4.26:1** over the scrimmed hero photo — short of AA for small uppercase type. The 200 step
   gives 6.63:1 there and 10.88:1 on the plain burgundy ground. Same brand hue, tonally adjusted
   where the ground demands it. Never substitute a different hue.

5. **The dark surface is warm (`#171214`), not Ombara's cool navy (`#121921`).** A warm burgundy
   brand on a cool blue-grey ground reads as a mismatch. Neutrals derive from the logo's greys
   (`#282828`, `#403838`, `#515151`, `#a1a7a8`, `#dce0e0`).

6. **Tailwind v4, class-based dark mode.** `@custom-variant dark (&:where(.dark, .dark *))`, class
   on `<html>`. Tokens are declared as CSS custom properties under `:root` and `.dark` in the
   `@theme` layer.

7. **`next-themes` with an inline pre-hydration script.** No flash of wrong theme, no hydration
   mismatch. Theme-dependent UI must render a stable placeholder until mounted.

8. **Target WCAG AA** — 4.5:1 body text, 3:1 large text and UI boundaries, **in both themes**.
   Check contrast when introducing any new token; a color that passes on light frequently fails
   on dark, as the table above shows.

9. **Images and media need theme handling too.** Both logo variants exist in [`brand/`](brand/):
   `logo-dark.png` (burgundy, for light backgrounds) and `logo-light.png` (white, for dark).
   Swap via CSS, not JS, and **never CSS-invert the burgundy logo** — it turns cyan. Photographic
   content keeps a slight brightness reduction in dark mode; never invert photos.

   Note: the master artwork's burgundy is `#5d1615` while the brand token is `#65000D`. This is
   known and intentional — do not "fix" either to match the other.

10. **Respect `prefers-reduced-motion`** on the ported Ombara reveal/parallax animations.

11. **The theme switch keeps its own palette, and that is the one sanctioned exception.**
    `src/styles/sky-toggle.css` is a day/night illustration — sky blue, night navy, a gold sun. Rule
    2 bans gold *as a brand accent*; a burgundy sun would read as a bug. Every selector is scoped
    under `.sky-toggle`, so nothing leaks. It is ported CSS, not styled-components: runtime CSS-in-JS
    needs an App Router registry, ships ~15 KB, and would sit as a second styling system beside the
    token layer.

### On the template's `dark.css`

`ombarahtml-10/HTML/css/dark.css` is **reference only — do not port it.** It redefines just three
variables and patches everything else with `body[data-bs-theme="dark"] … !important`, and it
reuses `--color-primary` as a text color, which is exactly why it can't survive a real brand
palette. Rebuild the token layer properly instead.

---

## Querying localized content

**Slugs are localized, but content currently exists only in French.** Payload falls back when
*reading* a field, not when *querying* one: a `where: { slug: { equals: … } }` in `en` matches the
English column, which is empty, so every English route 404s.

Always resolve documents through **`findBySlugWithFallback`** (`src/lib/payload.ts`). It matches the
slug in the requested locale, and on a miss matches it in the default locale and re-reads that
document in the requested locale — so translated fields still win wherever they exist. Never write
a bare slug `where` clause in a route.

---

## Rendering: the public site is dynamic, on purpose

`src/app/(site)/[locale]/layout.tsx` sets **`export const dynamic = 'force-dynamic'`**. Do not
remove it, and do not add `generateStaticParams`-driven prerendering to a route that reads Payload.

Two reasons, the first being the one that matters:

1. **It's a CMS.** Every page reads Payload — the layout alone loads the `navigation` and
   `site-settings` globals. Prerendered, an edit CPI makes in the admin would not appear until
   someone rebuilt and redeployed. That defeats the point of giving them a CMS.
2. **It decouples the build from the database.** Otherwise `next build` needs a reachable Postgres
   to prerender every page, which fails in CI and in `docker build`, where no database exists.
   Symptom: `ERROR: cannot connect to Postgres` during "Generating static pages".

SSR is cheap here — Payload's Local API runs in the same process, so there is no HTTP round trip.
If traffic ever justifies caching, add **on-demand revalidation from Payload hooks**; do not go
back to build-time prerendering.

---

## API routes

**Never create a static route at `/api/<collection-slug>`.** Next resolves the more specific path
before Payload's `/api/[...slug]` catch-all, so the handler shadows Payload's REST endpoint for that
collection and the admin's list view 405s. Public form submission lives at **`/api/enquiries`**, not
`/api/leads`, for exactly this reason.

Public writes go through a route handler using the Local API with `overrideAccess`, never by opening
the collection to anonymous `create`. That keeps the REST endpoint closed to drive-by spam while the
site's own forms still work.

---

## The homepage is a faithful Ombara `index.html` port

`/` is a deliberate, close reproduction of the template's `index.html`, built at the designer's
request after he judged the first homepage too far from what he supplied. **This one route is the
exception to "take the bones, not the skin" — everywhere else the rule still stands.**

What is reproduced: the nine-section order, the geometry, and all of the motion — the hero's
scroll-driven `clip-path` mask, the crossfade slider and its title wipe, the `data-reveal`
choreography with the template's delay ladder, the shared image-wipe on media, the sticky
scroll-driven feature gallery, and Lenis smooth scroll.

What is **not** reproduced: the palette. Ombara's navy and sand-gold are dropped exactly as
everywhere else — every colour resolves through a CPI semantic token, so dark mode works even
though the template only ever had a light theme. The content is CPI's, in French, from the message
catalogs.

1. **The port lives in [`src/styles/home-template.css`](src/styles/home-template.css), scoped under
   `.tpl`.** Structural CSS is ported rather than re-expressed in Tailwind because the fidelity
   being asked for is in the exact timing functions and clip-path polygons. Nothing leaks: every
   selector is under `.tpl`, and the rest of the site is untouched Tailwind.
2. **Section ids are a review contract, not decoration.** Sections are `s1`…`s9`; addressable blocks
   inside them are `s2-a`, `s2-b`, … The designer refers to "section 3.b" and it resolves
   unambiguously. Badges render them on screen and `?ids=off` hides the badges while keeping the
   ids. **If you re-order or remove a section, the numbering the designer is working against
   changes** — say so rather than silently renumbering.
3. **`prefers-reduced-motion` must neutralise the *pre-reveal state*, not just the transitions.**
   The template ships a blanket `transition: none`, which here would freeze every `.tpl-reveal` at
   `opacity: 0` and render a blank page. The stylesheet resets the hidden state and
   `TemplateMotion` marks everything visible on mount.
4. **Two grounds are pinned dark with `--stone-950`, not `--surface-inverse`** — the feature gallery
   and the room cards. Their overlay type is white in both themes, and `--surface-inverse` flips to
   a *light* value in dark mode.
5. **Large image slots draw from `gallery`, never `featuredImage`** — and skip any gallery entry
   that duplicates the featured image, because several listings attach the same banner twice. See
   the note below on why banners are unusable at size.
6. **The previous homepage is preserved at `/accueil-v1`** (`/en/home-v1`), `noindex`, unlisted in
   the nav, so the two can be compared.

Known content gap: CPI's library is mostly marketing artwork with the site name burned in, so a few
slots still show text-in-image. The fix is CPI uploading photographs — `heroSlides` on the
`home-page` global exists for exactly this.

---

## Component conventions

1. **Hero CTAs must use `tone="onDark"`.** The hero ground is dark in every state — a photo under
   a scrim, or the burgundy fallback. The default burgundy fill measures **1.14:1** against that
   ground and is effectively invisible. Use `ButtonLink`; never hand-roll a hero button.
2. **Hero art comes from the `home-page` global, never from a listing.** CPI's featured images are
   promotional banners with the site name burned into the artwork, so a scavenged one puts baked-in
   text behind the headline. No image set → solid brand ground, which reads as intentional.
3. **`CmsLink` for any href stored in the CMS.** Editors type French paths (`/terrains`); a plain
   `<a>` would send English visitors to the French URL and drop the locale. `CmsLink` maps the path
   back to its routing key so next-intl emits `/en/land`. Dynamic routes are excluded — they need
   params.
4. **`Reveal` fires once and honours `prefers-reduced-motion`** (content renders visible
   immediately for those users, never hidden behind an animation they declined).

   **It also keeps a `transform` on its wrapper permanently** (`translate-x-0` once shown). A
   transform makes an element the containing block for any `position: fixed` descendant, so an
   overlay rendered inside a `Reveal` is sized to *that element*, not the viewport — it appears
   part-way off screen, and a body scroll lock then makes it unreachable. **Anything overlaying the
   page — modals, drawers, toasts — must be portalled to `document.body`.** `VideoModal` does.
5. **Sold / completed listings are desaturated with a muted badge.** They stay visible as proof of
   delivery but must not read as available inventory.

---

## Deployment — self-hosted VPS via Dokploy

**Not Vercel.** Two Docker containers: `web` (Next.js + Payload in one process) and `db`
(`postgres:17-alpine`). Dokploy provides reverse proxy, TLS and redeploys.

1. **`output: 'standalone'`** in `next.config.ts`. Without it the runtime image carries the whole
   `node_modules` tree — ~1.2 GB instead of ~200 MB.
2. **`sharp` must be installed in the runner stage.** Vercel provides it; Docker does not, and
   without it Next.js image optimization silently degrades.
3. **Uploads go to a mounted volume** (`media:/app/media`), never the container filesystem —
   anything written into the container is destroyed on redeploy. This is the most common way a
   self-hosted Payload install loses client uploads. The volume belongs in the backup set next to
   `pgdata`.
4. **Migrations apply themselves in production** via `prodMigrations` in `payload.config.ts` —
   Payload runs any pending ones as it initialises. The runner image has no Payload CLI (only the
   Next standalone bundle), so `payload migrate` cannot be shelled out to there; importing the
   migrations into the config also makes Next's tracer ship them with the app. In development they
   are applied explicitly with `npm run migrate`. Deploy runbook: [`DEPLOY.md`](DEPLOY.md).
5. **ISR cache is per-container.** Correct at one replica. Scaling to two requires moving the cache
   to Redis or shared storage — don't add a replica without doing that first.
6. **Secrets come from Dokploy env management** (`DATABASE_URI`, `PAYLOAD_SECRET`, mail
   credentials). Never committed, never baked into the image.
7. **`/api/health`** must stay working — Dokploy's healthcheck depends on it.

---

## Cart → WhatsApp

There are **no user accounts, no auth and no payment gateway.** The Houzez account system is gone;
a client-side cart hands off to WhatsApp instead.

1. **Persist the lead to Payload BEFORE opening WhatsApp, never after.** If the handoff were the
   only record, every abandoned conversation would be invisible to CPI. This ordering is the
   commercial point of the feature — do not "optimize" it away.
2. **Cart state is client-side only** (localStorage + a small store). No DB writes until checkout.
3. **The WhatsApp message is built from an i18n template**, not string concatenation — it is
   user-facing text and lives in `messages/<locale>.json` like everything else.
4. **`wa.me` URLs truncate past ~2 000 characters.** Long carts send a summary plus a reference
   number (`CPI-2026-0413`) that resolves to the saved lead in the admin.
5. **The WhatsApp number is a Payload global**, never a hardcoded constant.
6. **Most listings have no price** — the message must read correctly with "Prix sur demande"
   rather than emitting `0 FCFA`.

---

## Media and placeholders

1. **Video opens in an in-page modal — never a redirect to YouTube.** Sending a visitor to YouTube
   hands them a page of competitors' recommendations.
2. **Use `youtube-nocookie.com`, loaded only on click** — a facade (poster + play button), not an
   iframe at page load. An eager YouTube iframe costs ~1 MB and significant main-thread time on the
   mobile connections most CPI visitors use.
3. **Placeholders must look like placeholders.** Testimonials and team portraits ship as neutral
   silhouettes with generic labels (`Client CPI`, `Membre de l'équipe`). **Never invent quotes or
   attribute fabricated statements to plausible-sounding names** — on a site whose whole
   proposition is trust, a fake testimonial that reaches production is a serious problem. Real
   content arrives via the CMS, no deploy needed.

---

## General conventions

- **TypeScript strict.** No `any` in application code.
- **Server Components by default.** `'use client'` only where interaction genuinely requires it
  (theme toggle, sliders, forms, filters).
- **No jQuery, no Bootstrap** in the final bundle. The Ombara template uses both; the port
  rewrites them to React + Tailwind. Swiper and Lenis are kept (both have React-friendly builds).
- **Logical CSS properties** for spacing/alignment, to keep an RTL locale cheap to add later.
- **French is the content language.** Code, comments, commit messages, branches, and Payload
  field *names* are English; Payload field **labels** shown to editors are French.
- **Currency is XOF / FCFA**, integer only, never decimals.
- **No auth, no accounts, no payment gateway** anywhere in the app.
- Prices are frequently absent by design — default display is “Prix sur demande”.

### Never run `npm run build` while a dev server is up

Both write to `.next`, and the production build overwrites the import map Turbopack's dev server is
holding open. Dev then fails to resolve its own internals — the reported symptom was:

```text
Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
  [next]/internal/font/google/cormorant_garamond_*.module.css
```

which reads like a `next/font` or a network problem and is neither: the fonts fetch fine and the
source is untouched. **Fix: stop the dev server, `rm -rf .next`, start it again.** Nothing in the
app needs changing.

Next 16 refuses to start a second dev server on the same directory, so verifying a change against
`next dev` means stopping the running one first — check for it rather than assuming the port is
free.

---

## Independence from the legacy WordPress site

**cpi.sn becomes THIS app at cutover.** CPI has no WordPress admin, no source and no backups —
only the domain. Anything still pointing at the old install is a permanently broken link or a lost
image, with no way to recover the original.

1. **`npm run check:legacy` fails the build** on any `cpi.sn` / `wp-content` / `houzez.co`
   reference in application source. It runs as part of `npm run check`. Only `src/migration/**` is
   exempt — that code is *meant* to talk to the old site.
2. **`next.config.ts` declares no `remotePatterns`, deliberately.** Adding the old host back would
   let a remote reference slip in unnoticed.
3. **`serverURL` is NOT set in `payload.config.ts`.** Payload derives upload URLs from it, so
   setting it bakes an absolute origin into every media reference
   (`http://localhost:3000/api/media/file/x.webp`) — which breaks on any other host, and which
   next/image rejects outright given there are no `remotePatterns`. Unset, Payload emits relative
   URLs that work everywhere. Absolute URLs for metadata/sitemap/email read
   `NEXT_PUBLIC_SERVER_URL` directly instead.
4. **`legacy-archive/`** holds a one-time mirror of all 777 WordPress uploads (1.3 GB), captured
   while the old site was still reachable. Gitignored — **back it up separately**. It is the only
   remaining copy of anything the migration did not import.

---

## Payload schema gotchas

Learned the hard way while building phase 2 — all three cost real debugging time.

1. **Never name a field `status` on a collection with drafts enabled.** Payload's drafts feature
   owns the `_status` column and generates `enum_<collection>_status` for it. A custom field called
   `status` generates the *same* enum name, so both columns end up sharing one type containing only
   `('draft','published')` — the admin offers your options and Postgres rejects them on save. The
   properties collection uses `availability` for this reason. Same trap applies to any name Payload
   reserves internally.
2. **`defaultSort` is a top-level collection property, not `admin.defaultSort`.**
3. **Autosave creates a document the moment the "New" form opens.** Every abandoned click leaves an
   empty draft in the list. Content collections use `drafts: true` (explicit save) rather than
   `drafts: { autosave: … }`. Versions still record each save.

4. **`push` is `false` in the DB adapter, in every environment.** With push enabled the CLI diffs
   the schema and *prompts* to confirm — in a non-interactive shell that hangs forever and looks
   exactly like a stuck migration. Worse, when it does run it applies the diff directly and writes a
   single `dev` row into `payload_migrations`, so the real migration file is never marked applied
   and dev silently drifts from what production will execute. Symptom to recognise: a `dev` row in
   `payload_migrations` alongside tables that no migration created.

Always run `npm run migrate` against a real database after a schema change — `generate:types` and
`tsc` both pass happily on a schema Postgres will reject. Redirect stdin (`< /dev/null`) in scripts
so a prompt fails fast instead of hanging.

---

## Running the content migration

`npm run import` — idempotent, matches on slug and updates rather than duplicating.
`-- --fresh` wipes imported collections first; `-- --no-media` skips downloads for a fast check.

- **Body HTML comes from the live WordPress REST API, cached in `.migration-cache/html/`.**
  Never import from `content-audit/**.md` — those are turndown *markdown*, and feeding markdown to
  an HTML converter leaves literal `**asterisks**` in the body text.
- **Images cache in `.migration-cache/media/`** keyed by URL hash, and upload with a filename
  derived from the original URL. Passing Payload the cache path would name every file after its
  sha1 — unreadable in the admin and worthless for image SEO.
- **`media.sourceUrl` is the dedupe key** across re-runs. Don't remove it.
- **Slug lookups must run through `slugify()`** — the field hook normalises on write, so looking up
  by a raw source slug never matches and the re-run tries to create a duplicate. WordPress
  percent-encoded `m²` as `%c2%b2`, so this affects real listings.

### Elementor artefacts to watch for

- **Animated counters render empty.** `<span data-to-value="20">` has no text content — the number
  is written by JS as it counts up. Imported naively, "20 ans d'expérience" becomes
  **"0 Années d'expérience"**, which advertises the opposite of the truth. `cleanHTML` now recovers
  `data-to-value` before conversion. Check any newly imported page for stray zeros.
- **Featured images are marketing banners**, not photographs — the site name and a burgundy frame
  are baked into the artwork. That is why the hero image is an editorial field rather than a
  scavenged listing image, and why cards show coloured bars at their edges.

### Known source-data gaps (faithful, not bugs)

- 4 properties have **no city** — the field was empty in WordPress.
- Several city assignments are simply **wrong in the source** (Ndayanne → Popenguine, Sangalkam →
  Rufisque). Imported as-is rather than guessed at; CPI should correct them in the admin.

---

## Content gotchas carried over from WordPress

These are documented in `content-audit/INVENTORY.md` and must not be re-imported:

- **19 of 61 properties are Houzez demo content** (Chicago / Miami / NY / LA addresses, USD prices).
- Several published duplicate pages (`-copy`, `-copy-2`, `-2` suffixes).
- The Houzez account system (dashboard, favourites, saved searches, cart) is **dropped**.
- 17 overlapping property types collapse to `productLine` (2) × `kind` (6) × `status` (4).
- All 4 existing testimonials are empty placeholders — real quotes still need collecting.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
