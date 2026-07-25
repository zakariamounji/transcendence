# Working on this repository

## Branches

`main` holds the assembled, working product. Everything else is history:

| Branch     | What it was                                                      |
| ---------- | ---------------------------------------------------------------- |
| `front`    | The Next.js frontend, now `frontend/`                             |
| `backend`  | The NestJS API, now `backend/`                                    |
| `abifkirn` | One gateway fix on top of `backend` — merged                      |
| `bnafiai`  | The Rustbox judge — already contained in `backend`                |
| `zmounji`  | DevOps: Docker, database image, monitoring — now `db/`, `monitoring/` |
| `abdael-m` | An early frontend scaffold, superseded by `front`                 |

Work on a branch named after what you are building, and open a pull request into
`main`. Please write commit messages that say what changed — the old history does
not, and it makes bisecting impossible.

## Before you push

```sh
cd backend  && npm run build && npm run lint
cd frontend && npm run build && npm run lint
```

Both must pass. The frontend build runs TypeScript over the whole app, so a type
error anywhere fails it.

## Conventions

- **Never commit `.env`.** Add new variables to `.env.example` with a placeholder,
  and to `docker-compose.yml` if a container needs them.
- **Secrets come from the environment**, never from a literal in the source or a
  baked-in config file. `monitoring/alertmanager/` shows the pattern: a template
  plus an entrypoint that substitutes at start-up.
- **The answer stays on the server.** `challenge.expectedOutput` and a private
  battle's `roomCode` must never appear in a client-facing response. Battle reads
  go through `BATTLE_SELECT`; add fields there, not with ad-hoc `include`s.
- **Authorise on the server.** A check in a React component is a hint for the user,
  not a security control. Every socket event and route that mutates state verifies
  membership, ownership or role in the service layer.
- **Socket errors** are returned as `{ error: message }` acks, because that is what
  the client rejects on.

## Adding a socket event

1. Add the handler in `backend/src/gateway/gateway.ts`, wrapped in the `ack` helper
   so failures reach the client in the right shape.
2. Authorise it — membership or creator, plus the battle status it requires.
3. Add the client helper in `frontend/lib/socket.ts`.
4. Document both directions in `docs/API.md`.

## Database changes

Edit `backend/prisma/schema.prisma`, then:

```sh
cd backend && npx prisma migrate dev --name what_you_changed
```

Commit the generated migration. Containers run `prisma migrate deploy` at start-up,
so an uncommitted migration means a broken deployment for everyone else.
