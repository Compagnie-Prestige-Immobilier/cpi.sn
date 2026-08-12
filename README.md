# cpi.sn

Rebuild of [cpi.sn](https://cpi.sn) — **Compagnie Prestige Immobilier**, a Senegalese property
developer — from WordPress/Houzez to Next.js + Payload.

| | |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4, CSS-variable design tokens |
| CMS | Payload 3 (in-process) on PostgreSQL |
| i18n | next-intl — FR (default) + EN, JSON catalogs |
| Deploy | Docker → Dokploy on a VPS |

**Read [`CLAUDE.md`](CLAUDE.md) before changing anything.** It records the binding decisions —
i18n, theming, deployment, cart — and the reasoning behind them. [`plan.md`](plan.md) is the full
rebuild plan; [`content-audit/`](content-audit/) holds the extracted content of the old site.

---

## Getting started

```bash
cp .env.example .env
#   → set PAYLOAD_SECRET:  openssl rand -base64 32
#   → point DATABASE_URI at your Postgres

npm install
npx payload migrate     # create the schema
npm run dev             # http://localhost:3000
```

First run: visit `/admin` to create the initial admin user.

Need a database quickly:

```bash
docker compose up -d db     # postgres:17 on 5432
```

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (`output: 'standalone'`) |
| `npm run check` | Message-catalog parity + typecheck — run before pushing |
| `npm run check:messages` | Fails if a locale catalog has drifted from `fr.json` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run generate:types` | Regenerate `src/payload-types.ts` after schema changes |
| `npm run migrate:create` | Create a migration after changing collections |
| `npm run migrate` | Apply pending migrations |

## Layout

```
src/
├── app/
│   ├── (site)/[locale]/   public website, locale-scoped
│   ├── (payload)/         Payload admin + REST/GraphQL
│   └── api/health         DB-backed healthcheck (Dokploy probes this)
├── i18n/
│   ├── locales.ts         ← THE locale registry. Start here for anything i18n.
│   ├── routing.ts         next-intl config + translated pathnames
│   └── request.ts         catalog loading + fallback merge
├── messages/              fr.json (reference) · en.json
├── styles/tokens.css      palette + semantic light/dark tokens
├── collections/           Payload schema
├── components/
└── migrations/
brand/                     logo-dark.png (light bg) · logo-light.png (dark bg)
```

## Two rules worth knowing up front

**Adding a language is a data change.** Add an entry to `src/i18n/locales.ts` and a file in
`src/messages/`. That registry drives next-intl routing, `<html lang>`/`dir`, the switcher,
`hreflang`, *and* Payload's content locales. If a new language ever needs a code change beyond
those two files, the abstraction has leaked — fix the abstraction.

**Never put a brand hex in a component.** Use semantic tokens (`bg-surface`, `text-brand`,
`border-subtle`). CPI's brand is a single hue, and `#65000D` scores 12.91:1 on the light surface
but 1.31:1 on the dark one — so `text-brand` has to resolve to a *different* step of the burgundy
ramp per theme. A hardcoded hex fails contrast in one theme, guaranteed.

## URLs

French is unprefixed; other locales are prefixed, and route segments are translated:

| | French | English |
|---|---|---|
| Home | `/` | `/en` |
| About | `/a-propos` | `/en/about` |
| Land | `/terrains` | `/en/land` |

This preserves the WordPress URLs the site already ranks for — see the 301 map in `plan.md` §5.
Locale auto-detection is **off** on purpose: `/` always serves French regardless of the visitor's
`Accept-Language`, because that URL is indexed as French. Visitors switch explicitly.

## Deployment

`docker-compose.yml` defines two containers — `web` and `db`. Dokploy supplies the reverse proxy
and TLS. Set `POSTGRES_PASSWORD`, `PAYLOAD_SECRET` and `NEXT_PUBLIC_SERVER_URL` in its environment
manager.

> **Back up the `media` volume alongside `pgdata`.** Uploads live on that volume; anything written
> into the container filesystem is destroyed on redeploy. This is the most common way a self-hosted
> Payload install loses client uploads.
