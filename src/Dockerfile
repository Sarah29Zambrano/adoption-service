# ── Stage 1: dependencias ────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: imagen de test optimizada ───────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

# Copiar dependencias del stage anterior (incluye devDeps para Jest)
COPY --from=deps /app/node_modules ./node_modules

# Copiar estructura src/ completa
COPY jest.config.js ./
COPY services/      ./services/
COPY routers/       ./routers/
COPY tests/         ./tests/

# Variable de entorno para saltar validación externa en CI
ENV SKIP_USER_VALIDATION=true \
    NODE_ENV=test

CMD ["npx", "jest", "--forceExit", "--ci"]