#!/usr/bin/env bash
#
# Regenerates seed/cpi-seed.sql.gz from the local database.
#
#   npm run seed:dump
#
# This used to be a one-line pg_dump piped straight into the tracked file. That
# is a loaded gun: `>` truncates the destination *before* pg_dump runs, so any
# failure — most easily a missing DATABASE_URI, since npm does not load .env —
# leaves a 20-byte gzip header where the seed used to be. It then restores
# nothing, and the symptom only shows up on a fresh deploy as an empty site.
#
# So: load .env, dump to a temp file, refuse to publish a dump that does not
# look like the real thing, and only then move it into place.
set -euo pipefail

cd "$(dirname "$0")/.."

# npm run does not source .env; pg_dump needs DATABASE_URI from it.
if [ -z "${DATABASE_URI:-}" ] && [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [ -z "${DATABASE_URI:-}" ]; then
  echo "✗ DATABASE_URI is not set and .env does not define it." >&2
  exit 1
fi

OUT=seed/cpi-seed.sql.gz
TMP=$(mktemp -t cpi-seed.XXXXXX.sql.gz)
trap 'rm -f "$TMP"' EXIT

# Excluded: the admin users and their sessions (each install makes its own),
# Payload's own bookkeeping tables, and leads — real enquiries are the client's
# data, not seed content, and must never travel in the repo.
pg_dump "$DATABASE_URI" \
  --data-only --no-owner --no-privileges \
  --exclude-table=users \
  --exclude-table=users_sessions \
  --exclude-table=payload_preferences \
  --exclude-table=payload_preferences_rels \
  --exclude-table=payload_locked_documents \
  --exclude-table=payload_locked_documents_rels \
  --exclude-table=leads \
  --exclude-table=leads_rels \
  --exclude-table=payload_migrations \
  --exclude-table=payload_kv \
  | gzip -9 > "$TMP"

# Same pre-flight the restore side runs. A dump with almost no COPY blocks is a
# dump of an empty or wrong database — publishing it would overwrite the good one.
COPIES=$(gzip -dc "$TMP" | grep -c '^COPY ' || true)
if [ "$COPIES" -lt 10 ]; then
  echo "✗ refusing to publish: only $COPIES COPY statement(s) — is \$DATABASE_URI pointing at the right database?" >&2
  exit 1
fi

mv "$TMP" "$OUT"
chmod 644 "$OUT" # mktemp makes 0600; the seed is public repo content
trap - EXIT
echo "✓ $OUT — $COPIES tables, $(du -h "$OUT" | cut -f1)"
