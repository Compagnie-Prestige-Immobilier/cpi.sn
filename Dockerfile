# syntax=docker/dockerfile:1
#
# CPI.sn — Next.js 16 + Payload 3, for Dokploy on a VPS.
#
# Debian slim rather than Alpine: sharp needs libvips, and glibc avoids the
# musl prebuild issues that surface as silently-degraded image optimization.
# See CLAUDE.md → Deployment.

# ── deps ─────────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# ── builder ──────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Fail here, legibly, rather than in the runner stage with an opaque buildx
# "failed to calculate checksum … /app/public: not found". The usual cause is
# an unanchored .gitignore rule (a bare `brand` also matches `public/brand`),
# so the assets exist locally but were never committed and CI has no copy.
# Reassemble the media seed. Split into <50 MB parts only because GitHub caps
# a single file at 100 MB; the parts exist for git's benefit, not Docker's, so
# they are unpacked here and never reach the runtime image.
RUN mkdir -p /seed-media \
    && if ls seed/uploads/media.tar.gz.part-* >/dev/null 2>&1; then \
         cat seed/uploads/media.tar.gz.part-* | tar xzf - -C /seed-media --strip-components=1; \
         echo "reassembled $(find /seed-media -type f | wc -l) media files"; \
       else \
         echo "no media seed present — uploads will start empty"; \
       fi

RUN test -d public || { \
      echo "ERROR: public/ is missing from the build context."; \
      echo "It is probably untracked — check .gitignore anchoring (use /brand, not brand)."; \
      exit 1; \
    }

ENV NEXT_TELEMETRY_DISABLED=1

# The build never touches the database: migrations run at container start. These
# placeholders exist only so payload.config.ts can be imported during the build.
# Scoped to this RUN so they are not baked into the image as ENV layers.
RUN DATABASE_URI="postgres://build:build@localhost:5432/build" \
    PAYLOAD_SECRET="build-time-placeholder" \
    npm run build

# ── runner ───────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Must match the mounted volume in docker-compose.yml. Uploads written anywhere
# else are destroyed on redeploy.
ENV MEDIA_DIR=/app/media

# curl: healthcheck. postgresql-client: the one-command content seed
# (scripts/seed-db.sh) — psql only, no pg_restore version coupling.
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl postgresql-client \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# `output: 'standalone'` traces only the dependencies actually reached at
# runtime — ~200 MB instead of ~1.2 GB.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# sharp is a native module; the tracer does not always follow it cleanly.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@img ./node_modules/@img

# Content seed + its restore script, so a fresh deployment can be populated
# with a single `docker exec` and nothing to copy across first.
COPY --from=builder --chown=nextjs:nodejs /app/seed/cpi-seed.sql.gz ./seed/cpi-seed.sql.gz
COPY --from=builder --chown=nextjs:nodejs /app/scripts/ ./scripts/
# Staged, not mounted: /app/media is the volume, so seeding it is an explicit
# copy rather than a silent side effect of Docker populating an empty volume.
COPY --from=builder --chown=nextjs:nodejs /seed-media /opt/cpi-seed/media

# NOTE: no `chown -R` over /opt/cpi-seed. Rewriting ownership on 129 MB of
# already-COPYed files creates a second full layer — it cost ~140 MB here.
# The COPY above already sets --chown.
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
