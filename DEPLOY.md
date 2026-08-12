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

### 2. Move the content across

The local database already holds everything the migration produced: 42 properties, 12 posts,
22 pages, 128 media records and the globals. Copying it over is faster and less error-prone than
re-running the WordPress import against production.

```bash
# From the project root, against your local database
pg_dump -h 127.0.0.1 -U cpi -d cpi \
  --no-owner --no-privileges --clean --if-exists -Fc -f cpi.dump

# Restore into the production database (run where it is reachable —
# the Dokploy host, or via a tunnel; cpisn-db-udk1lq is internal)
pg_restore -d "$DATABASE_URI" --no-owner --no-privileges --clean --if-exists cpi.dump
```

`--no-owner --no-privileges` matters: local runs as `cpi`, production as `postgres`, and without
these the restore fails on every `ALTER ... OWNER TO` statement.

### 3. Copy the media files — separate from the database

**A database restore does not move uploads.** The `media` table holds rows pointing at files that
live on the mounted volume; without them every image 500s. This is verified behaviour, not a
theoretical risk — restoring the DB alone gave exactly that.

```bash
# ~129 MB, from the project root
tar czf media.tar.gz media/

# On the server, into the volume Dokploy mounts at /app/media
docker cp media.tar.gz <container>:/tmp/
docker exec <container> sh -c 'cd /app/media && tar xzf /tmp/media.tar.gz --strip-components=1'
```

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
