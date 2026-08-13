#!/bin/sh
# Copy the bundled media seed onto the uploads volume.
#
#   docker exec <container> /app/scripts/seed-media.sh
#   docker exec <container> /app/scripts/seed-media.sh --force
#
# The image carries the 441 migrated images at /opt/cpi-seed/media, already
# unpacked. They are staged there rather than at /app/media because that path is
# the mounted volume: relying on Docker's populate-an-empty-volume behaviour
# would work only when the volume happens to be empty, and silently do nothing
# otherwise. An explicit copy behaves the same way every time.
#
# Refuses to overwrite a volume that already holds files: it is the ONLY copy of
# anything CPI has uploaded since launch.

set -eu

TARGET="${MEDIA_DIR:-/app/media}"
SOURCE="${SEED_MEDIA_DIR:-/opt/cpi-seed/media}"
FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

if [ ! -d "$SOURCE" ]; then
  echo "ERROR: no media seed at $SOURCE" >&2
  exit 1
fi

mkdir -p "$TARGET"
EXISTING=$(find "$TARGET" -type f 2>/dev/null | wc -l | tr -d '[:space:]')

if [ "$EXISTING" -gt 0 ] && [ "$FORCE" -eq 0 ]; then
  cat >&2 <<EOF

  $TARGET already holds $EXISTING files.

  These may include uploads CPI has added since launch, and this volume is their
  only copy. Re-run with --force only if you are certain:

      docker exec <container> /app/scripts/seed-media.sh --force

EOF
  exit 1
fi

echo "→ Copying media seed into $TARGET"
cp -R "$SOURCE"/. "$TARGET"/

echo "✓ $(find "$TARGET" -type f | wc -l) files in $TARGET"
