# Deploying to dev.cpi.sn

Environment values live in `.env.prod` (gitignored). Paste them into Dokploy's environment
manager — never bake them into the image.

---

## Migrations run themselves

`payload.config.ts` passes `prodMigrations`, so **Payload applies any pending migrations when it
initialises in production**. Deploying against an empty database is enough; there is no migration
step to run by hand.

This is deliberate: the runner image contains only the Next standalone bundle, *not* the Payload
CLI, so `payload migrate` cannot be shelled out to inside the container. Importing the migrations
into the config also makes Next's tracer ship them with the app.

Verified against a genuinely empty database: the container created **120 tables**, recorded all
five migrations, and reported healthy — no manual step.

> If the site 500s on a fresh deploy, check the container logs before assuming migrations. A
> missing `DATABASE_URI` or an unreachable host fails the same way.

---

## First deploy — the two things migrations do *not* give you

A migrated database has the right **shape** and no **content**. Expect an empty site until both
steps below are done.

### 1. Create the admin user

Visit `https://dev.cpi.sn/admin`. With an empty `users` table Payload shows its
create-first-user screen. Create the account there — no seeding required.

### 2. Load content and images — one command

```bash
docker exec <container> /app/scripts/seed.sh
```

Runs both halves below. Verified from scratch: empty database + empty volume →
one command → 42 properties and 441 images, with `/api/media/file/…` serving
`image/webp` and pages rendering.

Both halves are needed and neither is sufficient: the database holds rows
pointing at files, the volume holds the files. Restore only the database and
every image on the site 404s.

Each step refuses to overwrite existing data; pass `--force` to override.

#### 2a. Content

The content seed ships **inside the image** (`seed/cpi-seed.sql.gz`, ~930 KB), so there is nothing
to copy across first:

```bash
docker exec <container> /app/scripts/seed-db.sh
```

Restores 42 properties, 12 posts, 22 pages, 128 media records and the globals.

Notes on how the seed is built, because both details bite if changed:

- **Plain SQL piped through `psql`, not a custom-format dump.** `pg_restore` refuses any archive
  produced by a newer `pg_dump`, and the client version inside the image is not the one that made
  the file. `psql` reading SQL has no such constraint.
- **No user accounts, and no leads.** `users`, `users_sessions`, the per-user `payload_preferences*`
  and `payload_locked_documents*` tables are excluded — so no password hash is committed, and
  production keeps whatever admin you created. Excluding `users` *without* also excluding
  `payload_preferences_rels` fails on a foreign key, which is why the list is that long.

#### 2b. Images

```bash
docker exec <container> /app/scripts/seed-media.sh
```

The 441 migrated images ship **inside the image**, unpacked at `/opt/cpi-seed/media`.

They are staged there rather than at `/app/media` deliberately: that path is the mounted volume, and
relying on Docker's populate-an-empty-volume behaviour would work only when the volume happens to be
empty and silently do nothing otherwise. An explicit copy behaves the same way in every state.

In the repository they live as four ~40 MB parts under `seed/uploads/`, reassembled during the
Docker build. That split exists solely because GitHub caps a **single file** at 100 MB (and warns
past 50 MB) — the parts never reach the runtime image.

#### Refreshing the seed

```bash
npm run seed:dump       # database → seed/cpi-seed.sql.gz  (reads DATABASE_URI from .env)
npm run seed:media      # media/    → seed/uploads/media.tar.gz.part-*
```

#### Cost

Carrying the images makes the runtime image ~834 MB instead of ~700 MB. That is the price of a
self-contained deploy. Once production has been seeded once and CPI's uploads live safely on the
volume, `seed/uploads/` can be deleted from the repository and the image drops back.

---

## Backups

Two things must be backed up together, and a backup of one without the other is not a backup:

| What | Why |
|---|---|
| The Postgres database | All content, and the record of which migrations have run |
| The **`media` volume** | The only copy of every upload — a redeploy destroys anything written into the container filesystem itself |

`legacy-archive/` (1.3 GB, gitignored) is the one-time mirror of the old WordPress uploads, taken
while the old site was still reachable. It is not part of the running app, but it is the only
remaining copy of anything the migration did not import — keep it somewhere safe.

---

## Routine deploys

Push to `main`. CI runs checks, the build, migrations against a scratch database, and the Docker
image build. Dokploy rebuilds and restarts; pending migrations apply on boot.

If Dokploy's Postgres sits on its own Docker network, uncomment the `networks:` block at the
bottom of `docker-compose.yml` — otherwise `cpisn-db-udk1lq` will not resolve from the container.
