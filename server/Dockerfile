# Production Multi-Stage Dockerfile for TypeScript Backend
# Stage 1: Build & Compile TypeScript
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY knexfile.js ./
COPY src/ ./src/
RUN npm run build

# Stage 2: Production Runtime Image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy knex configuration, database migrations/seeds, and compiled dist
COPY --chown=node:node knexfile.js ./
COPY --chown=node:node src/database ./src/database
COPY --chown=node:node --from=builder /app/dist ./dist

# Security: Run as unprivileged user
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.js"]
