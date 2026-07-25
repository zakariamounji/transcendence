# ---------- build stage ----------
FROM node:24-bookworm-slim AS build

WORKDIR /app

# NEXT_PUBLIC_* variables are baked into the client bundle at build time
ARG NEXT_PUBLIC_BACKEND_URL=https://localhost:8443
ARG NEXT_PUBLIC_FRONTEND_URL=https://localhost:8443
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL \
    NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- runtime stage ----------
FROM node:24-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./

EXPOSE 1337
CMD ["npm", "run", "start"]
