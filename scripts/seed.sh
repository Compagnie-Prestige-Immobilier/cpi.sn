#!/bin/sh
# Populate a fresh deployment: content + images, in one command.
#
#   docker exec <container> /app/scripts/seed.sh
#   docker exec <container> /app/scripts/seed.sh --force
#
# Both halves are needed and neither is sufficient alone: the database holds
# rows pointing at files, the volume holds the files. Restore only the database
# and every image on the site 404s.
#
# Each step refuses to overwrite existing data without --force.

set -eu
DIR=$(dirname "$0")

"$DIR/seed-db.sh" "$@"
echo
"$DIR/seed-media.sh" "$@"

# Integrity check. The database and the media volume are seeded from two
# separate artefacts, and they drift: regenerating one without the other leaves
# rows pointing at files that were never shipped, which surfaces as 500s on
# every image rather than anything obvious.
MISSING=0
if command -v psql >/dev/null 2>&1 && [ -n "${DATABASE_URI:-}" ]; then
  for f in $(psql "$DATABASE_URI" -tAc \
      'SELECT filename FROM media WHERE filename IS NOT NULL' 2>/dev/null); do
    [ -f "${MEDIA_DIR:-/app/media}/$f" ] || MISSING=$((MISSING + 1))
  done
fi

if [ "$MISSING" -gt 0 ]; then
  cat >&2 <<EOF

  ⚠ $MISSING media row(s) have no file on the volume — those images will 500.

  The media seed is older than the database seed. Regenerate both together and
  redeploy:

      npm run seed:dump && npm run seed:media

EOF
else
  echo
  echo "✓ Every media row has its file on the volume."
fi

cat <<'MSG'

Next: create your admin account at /admin — the seed contains no user accounts.
MSG
