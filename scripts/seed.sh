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

cat <<'MSG'

Next: create your admin account at /admin — the seed contains no user accounts.
MSG
