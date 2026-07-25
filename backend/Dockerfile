# ---------- build stage ----------
FROM node:24-bookworm-slim AS build

# OpenSSL is required by the Prisma engine
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
# --ignore-scripts: postinstall must not touch the database at build time
RUN npm ci --ignore-scripts

COPY . .
RUN npx prisma generate && npm run build

# ---------- runtime stage ----------
FROM node:24-bookworm-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/package.json ./

EXPOSE 3000

# Apply pending migrations on boot (compose guarantees the db is healthy), then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
