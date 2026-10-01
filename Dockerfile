# syntax=docker/dockerfile:1
#
# Builds the API into a small production image in 3 stages. Only the last
# stage becomes the final image; the first two are thrown away after building.

# Which npm registry to download packages from. Override it if
# registry.npmjs.org is blocked on your network (see DOCKER.md):
#   NPM_REGISTRY=https://registry.yarnpkg.com in .env
ARG NPM_REGISTRY=https://registry.npmjs.org

# ---------- Stage 1: compile TypeScript → JavaScript ----------
FROM node:24-alpine AS build
ARG NPM_REGISTRY
WORKDIR /app
RUN npm config set registry "$NPM_REGISTRY"

# Copy only the package files first: Docker caches each step, so as long as
# these two files don't change, `npm ci` is skipped on the next build.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Stage 2: install production dependencies only ----------
# No TypeScript, tsx, @types/... — the final image doesn't need them.
FROM node:24-alpine AS deps
ARG NPM_REGISTRY
WORKDIR /app
RUN npm config set registry "$NPM_REGISTRY"
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- Stage 3: the image that actually runs ----------
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Uploaded images live here (mounted as a volume in docker-compose.yml).
# Owned by the unprivileged `node` user that the app runs as.
RUN mkdir -p uploads && chown node:node uploads
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT:-5000}/api/health" || exit 1

# Apply any pending database migrations, then start the server. `exec`
# makes node the main process, so `docker stop` shuts it down cleanly.
CMD ["sh", "-c", "npm run migration:run:prod && exec node dist/server.js"]
