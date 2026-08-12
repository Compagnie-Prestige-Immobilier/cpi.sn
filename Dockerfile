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
RUN npm ci

# ── builder ──────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The build never touches the database: migrations run at container start.
# These are placeholders only so payload.config.ts can be imported at build time.
ENV DATABASE_URI="postgres://build:build@localhost:5432/build"
ENV PAYLOAD_SECRET="build-time-placeholder"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

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

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
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

RUN mkdir -p /app/media && chown -R nextjs:nodejs /app/media

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
