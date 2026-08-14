#!/bin/sh
# Restore the bundled content seed into DATABASE_URI.
#
#   docker exec <container> /app/scripts/seed-db.sh
#   docker exec <container> /app/scripts/seed-db.sh --force   # replace existing content
#
# DATA ONLY. Migrations own the schema — Payload applies them on start-up — and
# this seed owns the content. Keeping the two apart matters: a schema+data dump
# fights the migrations it lands on. Dropping `media`'s primary key fails once a
# newer migration has added `home_page.founder_portrait_id` referencing it, and
# the restore dies half-applied.
#
# Consequences of the split, both deliberate:
#   • The dump never needs to match the target schema version.
#   • `users`, `leads` and the per-user admin tables are excluded outright, so
#     re-seeding never destroys the admin account or the sales inbox.
#
# Plain SQL through psql, not a custom-format dump: `pg_restore` refuses any
# archive made by a newer `pg_dump`, and the client version in this image is not
# the one that produced the file.

set -eu

SEED="${SEED_FILE:-/app/seed/cpi-seed.sql.gz}"
FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

[ -n "${DATABASE_URI:-}" ] || { echo "ERROR: DATABASE_URI is not set." >&2; exit 1; }
[ -f "$SEED" ] || { echo "ERROR: seed file not found at $SEED" >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "ERROR: psql is not installed." >&2; exit 1; }

echo "→ Checking the target database…"
psql "$DATABASE_URI" -tAc 'SELECT 1' >/dev/null 2>&1 \
  || { echo "ERROR: cannot connect to DATABASE_URI." >&2; exit 1; }

# The schema must already exist — the app creates it via prodMigrations on boot.
if ! psql "$DATABASE_URI" -tAc "SELECT to_regclass('public.properties')" | grep -q properties; then
  cat >&2 <<'EOF'

  The target database has no `properties` table.

  Migrations have not run yet. Start the app once and let it migrate, then seed:
  they are applied automatically by Payload on start-up.

EOF
  exit 1
fi

EXISTING=$(psql "$DATABASE_URI" -tAc 'SELECT count(*) FROM properties' | tr -d '[:space:]')
[ -z "$EXISTING" ] && EXISTING=0

if [ "$EXISTING" -gt 0 ] && [ "$FORCE" -eq 0 ]; then
  cat >&2 <<EOF

  The target database already holds $EXISTING properties.

  Seeding replaces all content, including any edits CPI has made since. Re-run
  with --force if that is genuinely what you want:

      docker exec <container> /app/scripts/seed-db.sh --force

EOF
  exit 1
fi

echo "→ Clearing existing content"
# Truncate every content table, leaving accounts, leads and the migration
# ledger alone. Derived from the live schema rather than hardcoded, so a new
# collection does not silently escape the wipe and leave stale rows behind.
psql "$DATABASE_URI" --quiet --no-psqlrc --set ON_ERROR_STOP=1 >/dev/null <<'SQL'
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN (
        'users', 'users_sessions',
        'payload_migrations', 'payload_kv',
        'payload_preferences', 'payload_preferences_rels',
        'payload_locked_documents', 'payload_locked_documents_rels',
        'leads', 'leads_rels'
      )
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE', r.tablename);
  END LOOP;
END $$;
SQL

echo "→ Restoring $SEED"
# pg_dump's data-only output happens to load cleanly under normal FK checking,
# so this is belt-and-braces rather than a requirement. Deferring needs
# superuser, which the app's own database role may not have — hence the probe
# instead of assuming, or the restore would fail for a non-superuser.
SUPERUSER=$(psql "$DATABASE_URI" -tAc \
  "SELECT usesuper FROM pg_user WHERE usename = current_user" 2>/dev/null | tr -d '[:space:]')

if [ "$SUPERUSER" = "t" ]; then
  gunzip -c "$SEED" | psql "$DATABASE_URI" --quiet --no-psqlrc --set ON_ERROR_STOP=1 \
    -c 'SET session_replication_role = replica;' -f - >/dev/null
else
  gunzip -c "$SEED" | psql "$DATABASE_URI" --quiet --no-psqlrc --set ON_ERROR_STOP=1 \
    -f - >/dev/null
fi

# ── Re-sync every identity sequence ──────────────────────────────────────────
# `pg_dump --data-only` writes the rows with their original ids but emits no
# `setval`, so each sequence is left wherever it was — usually 1. The next
# INSERT then reuses an id that already exists and Payload reports it as
# "le champ suivant n'est pas valide : id", which is what broke the shop_items
# migration in production: Payload records each applied migration by INSERTing
# into payload_migrations, and that insert collided.
#
# Derived from the catalogue rather than a fixed list, so a collection added
# later is covered without touching this script.
echo "→ Re-syncing id sequences…"
RESYNCED=$(psql "$DATABASE_URI" -tAc "
DO \$\$
DECLARE r RECORD; maxid BIGINT;
BEGIN
  FOR r IN
    SELECT s.relname AS seq,
           t.relname AS tbl,
           a.attname AS col
    FROM pg_class s
    JOIN pg_depend d  ON d.objid = s.oid AND d.classid = 'pg_class'::regclass AND d.deptype = 'a'
    JOIN pg_class t   ON t.oid = d.refobjid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
    JOIN pg_namespace n ON n.oid = s.relnamespace
    WHERE s.relkind = 'S' AND n.nspname = 'public'
  LOOP
    EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM public.%I', r.col, r.tbl) INTO maxid;
    PERFORM setval(format('public.%I', r.seq), GREATEST(maxid, 1), maxid > 0);
  END LOOP;
END \$\$;
SELECT count(*) FROM pg_class WHERE relkind = 'S' AND relnamespace = 'public'::regnamespace;")
echo "  ${RESYNCED} sequence(s) re-synced"

echo "→ Verifying…"
psql "$DATABASE_URI" -tAc "
  SELECT 'properties=' || (SELECT count(*) FROM properties)
      || ' posts='     || (SELECT count(*) FROM posts)
      || ' pages='     || (SELECT count(*) FROM pages)
      || ' media='     || (SELECT count(*) FROM media)"

cat <<'EOF'

✓ Content restored. Images stay broken until the volume is seeded too —
  the database only holds rows pointing at the files:

      docker exec <container> /app/scripts/seed-media.sh

  Or do both at once with /app/scripts/seed.sh
EOF
