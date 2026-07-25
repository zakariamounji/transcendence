# ft_transcendence — Code Battle Platform

A real-time competitive programming platform: players create C/C++ **challenges**
(a subject plus an expected output), open **battles** around them, and race to submit
a solution. Submissions are judged server-side and the first correct answer wins.

Built by a team of four for 42. Stack:

| Layer      | Technology                                                 |
| ---------- | ---------------------------------------------------------- |
| Frontend   | Next.js 16 (App Router, React 19), TypeScript, Tailwind v4  |
| Backend    | NestJS 11, socket.io gateway, Prisma 7                      |
| Database   | PostgreSQL 17                                               |
| Auth       | better-auth (email/password, Google, GitHub, 42 intra)      |
| Judge      | Rustbox (external sandboxed code-execution API)             |
| Edge       | nginx (single HTTPS entrypoint, TLS + wss termination)      |
| Monitoring | Prometheus, Alertmanager, Grafana, node/postgres exporters  |

## Quick start

```sh
make            # creates .env from the template, then builds and starts everything
```

Then edit `.env` (it is git-ignored) and fill in real secrets — at minimum
`POSTGRES_PASSWORD`, `DB_PASSWORD`, `EXPORTER_PASSWORD` and `BETTER_AUTH_SECRET`:

```sh
openssl rand -base64 32     # use this for BETTER_AUTH_SECRET
```

Re-run `make up` after editing. The app is then served on a single HTTPS origin:

| URL                    | Service                      |
| ---------------------- | ---------------------------- |
| https://localhost:8443 | The application              |
| http://localhost:3005  | Grafana (loopback only)      |
| http://localhost:9090  | Prometheus (loopback only)   |
| http://localhost:9093  | Alertmanager (loopback only) |

The certificate is self-signed, so the browser warns once on first visit.

### Make targets

| Target        | Effect                                                |
| ------------- | ----------------------------------------------------- |
| `make up`     | Build and start the whole stack in the background      |
| `make down`   | Stop and remove containers (database volume survives)  |
| `make logs`   | Follow logs from every service                         |
| `make ps`     | Show service status                                    |
| `make re`     | Restart everything                                     |
| `make clean`  | Stop and **delete volumes** — destroys the database    |
| `make fclean` | `clean` plus a Docker system prune                     |

## Repository layout

```
.
├── frontend/          Next.js 16 app (App Router)
│   ├── app/           routes: / (dashboard), /auth, legal pages
│   ├── components/    battles/, challenges/, ranking/, ui/ (shadcn)
│   ├── lib/           socket.io client, better-auth client, server fetch helper
│   ├── providers/     presence heartbeat
│   └── proxy.ts       Next 16 proxy (the former middleware) — auth gate
├── backend/           NestJS API + websocket gateway
│   ├── src/auth/      better-auth configuration (providers, sessions)
│   ├── src/battle/    battle lifecycle: create, join, leave, start, end
│   ├── src/challenge/ challenge CRUD and publishing
│   ├── src/user/      profile, presence, leaderboard
│   ├── src/gateway/   socket.io events + Rustbox judge integration
│   └── prisma/        schema and migrations
├── db/                PostgreSQL image + first-boot role/database setup
├── nginx/             TLS termination and routing to frontend/backend
├── monitoring/        Prometheus, Alertmanager, Grafana provisioning
├── docker-compose.yml single-command orchestration
└── .env.example       every variable the stack needs
```

## Architecture

Everything reaches the browser through **one HTTPS origin** (`nginx`), which routes:

- `/socket.io/*` → backend gateway (upgraded to `wss`)
- `/api/auth/*` and the REST routes → backend
- everything else → the Next.js frontend

Because it is a single origin, session cookies are first-party and websockets are
secure without any extra client configuration.

### Authentication

`better-auth` runs **inside** the NestJS process and owns the whole session
lifecycle. The Next.js frontend talks to it with `better-auth/react`, and the same
session cookie authenticates both REST calls and the websocket handshake, so the
gateway can resolve `@Session()` on every event. Passwords are hashed by
better-auth (scrypt); the backend stores no plaintext credentials.

A global `AuthGuard` protects every route — public endpoints must opt out
explicitly.

### A battle, end to end

1. A player creates a challenge (subject + expected output) and publishes it.
2. Another player opens a battle on that challenge (`POST /battles/create`),
   public or private with a room code.
3. Players join over websocket (`joinBattle`); the room roster is broadcast to
   everyone as `battle:playersUpdated`.
4. The creator starts it (`startBattle`) → `battle:started`.
5. Players submit source (`submitCode`). The backend sends it to the Rustbox
   sandbox, compares the output against the expected output **server-side**, and
   broadcasts either a private `codeResult` verdict or, on the first correct
   answer, `battle:playerWon` followed by `battle:ended`.
6. The winner is awarded XP; stats and the leaderboard update.

The expected output never leaves the server, and submitted source is never
broadcast to opponents.

## Development without Docker

```sh
# database only
docker compose up -d db

# backend  (http://localhost:3000)
cd backend && npm install && npx prisma migrate deploy && npm run start:dev

# frontend (http://localhost:1337)
cd frontend && npm install && npm run dev
```

Set `NEXT_PUBLIC_BACKEND_URL=http://localhost:3000` and
`TRUSTED_ORIGINS=http://localhost:1337` for this mode.

## Security notes

- No secrets in git: `.env` is ignored and `.env.example` holds only placeholders.
- The database exporter user holds `pg_monitor` only, never superuser.
- Grafana anonymous access is disabled; Prometheus, Alertmanager and Grafana bind
  to loopback and are not exposed publicly.
- Challenge answers (`expectedOutput`) and private room codes are stripped from
  every client-facing response.
- Submissions are rate-limited per user, and a player may only submit to a battle
  they have actually joined.

## Status

See [`docs/STATUS.md`](docs/STATUS.md) for the current feature matrix, the known
gaps, and the remaining roadmap.
