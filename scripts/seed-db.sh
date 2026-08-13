#!/bin/sh
# Restore the bundled content seed into DATABASE_URI.
#
#   docker exec <container> /app/scripts/seed-db.sh
#   docker exec <container> /app/scripts/seed-db.sh --force   # overwrite existing content
#
# Ships inside the runtime image, so seeding a fresh deployment is one command
# with nothing to copy across first.
#
# Plain SQL piped through psql, deliberately — NOT a custom-format dump.
# `pg_restore` refuses any archive produced by a newer `pg_dump`, and the client
# version inside this image is not the one that made the file. psql reading SQL
# has no such constraint.
#
# The seed contains NO user accounts: `users` and `users_sessions` are excluded,
# so production keeps whatever admin you created and no password hash is
# committed to the repository. On an empty database Payload shows its
# create-first-user screen at /admin.

set -eu

SEED="${SEED_FILE:-/app/seed/cpi-seed.sql.gz}"
FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

if [ -z "${DATABASE_URI:-}" ]; then
  echo "ERROR: DATABASE_URI is not set." >&2
  exit 1
fi

if [ ! -f "$SEED" ]; then
  echo "ERROR: seed file not found at $SEED" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql is not installed in this image." >&2
  exit 1
fi

echo "→ Checking the target database…"
if ! psql "$DATABASE_URI" -tAc 'SELECT 1' >/dev/null 2>&1; then
  echo "ERROR: cannot connect to DATABASE_URI." >&2
  exit 1
fi

# Guard: a one-command restore that silently destroys live content would be a
# very easy way to lose CPI's data. Existing rows require an explicit --force.
EXISTING=$(psql "$DATABASE_URI" -tAc \
  "SELECT COALESCE((SELECT count(*) FROM properties), 0)" 2>/dev/null || echo 0)
EXISTING=$(echo "$EXISTING" | tr -d '[:space:]')
[ -z "$EXISTING" ] && EXISTING=0

if [ "$EXISTING" -gt 0 ] && [ "$FORCE" -eq 0 ]; then
  cat >&2 <<EOF

  The target database already holds $EXISTING properties.

  Seeding would DROP and replace every table in the dump, including any edits
  CPI has made since. Re-run with --force if that is genuinely what you want:

      docker exec <container> /app/scripts/seed-db.sh --force

EOF
  exit 1
fi

echo "→ Restoring $SEED"
# ON_ERROR_STOP so a partial restore fails loudly instead of leaving the
# database half-populated and the site subtly broken.
gunzip -c "$SEED" | psql "$DATABASE_URI" \
  --quiet --no-psqlrc --set ON_ERROR_STOP=1 \
  >/dev/null

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
