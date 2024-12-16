# syntax=docker/dockerfile:1.2
FROM node:21-alpine AS base

RUN apk add --update --no-cache libc6-compat build-base \
  make \
  g++ \
  jpeg-dev \
  cairo-dev \
  giflib-dev \
  pango-dev \
  libtool \
  autoconf \
  automake \
  python3 \
  pkgconfig \
  libjpeg-turbo-dev \
  libpng-dev \
  bash

RUN apk add --update --repository http://dl-3.alpinelinux.org/alpine/edge/testing libmount ttf-dejavu ttf-droid ttf-freefont ttf-liberation fontconfig

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && \
  corepack prepare yarn@stable --activate && \
  addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs && \
  yarn set version stable

FROM base AS deps

COPY ./.yarn/releases ./.yarn/releases/
COPY ./.yarnrc.yml .
COPY package.json yarn.lock ./

RUN --mount=type=cache,target=/app/.yarn/cache,id=yarncache,sharing=shared,mode=0777 \
  npm_config_build_from_source=true yarn install --immutable || true

RUN mkdir -p /app/build-logs && \
  cp /tmp/*.log /app/build-logs/ || true

FROM deps AS builder

COPY . .
COPY .env /app/.env

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV=production
RUN mkdir -p /app/.next/cache && chown nextjs:nodejs /app/.next/cache
VOLUME /app/.next/cache
RUN --mount=type=cache,target=/app/.next/cache,uid=1001,gid=1001,id=nextcache,sharing=shared,mode=0777 yarn run build

FROM base AS production


RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder /app/public ./public/
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static/
COPY --from=builder --chown=nextjs:nodejs /app/.next/cache ./.next/cache/
COPY --from=builder /app/.yarnrc.yml .
COPY --from=builder /app/.yarn/releases .yarn/releases/
COPY --from=builder --chown=nextjs:nodejs /app/.env .env


USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "--max-old-space-size=4096", "/app/server.js"]