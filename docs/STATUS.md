# Project status, gaps and roadmap

Written after auditing every branch (`front`, `backend`, `abifkirn`, `bnafiai`,
`zmounji`, `abdael-m`) and merging them into this tree. It records what exists,
what does not, and what to do next.

---

## 1. The decision that has to be made first

**This project is not Pong.**

The 42 `ft_transcendence` subject requires a Pong game: local two-player on one
keyboard, a tournament system with matchmaking and per-tournament aliases, and
identical paddle speeds for both players. None of that exists on any branch —
there is no canvas, no game loop, no paddle, no ball, no tournament model, and
no matchmaking queue.

What the team built instead is a **competitive code-battle platform**, and it is
genuinely good: real-time multiplayer over websockets, server-side judging,
challenge authoring, live rosters, XP and a leaderboard. It is simply a different
product from the one the subject asks for.

At 42, modules only earn points once the mandatory part is complete. As it
stands, the mandatory part cannot pass, regardless of how polished the rest is.

There are two honest paths:

1. **Add Pong alongside the code battles.** The hard infrastructure — sockets,
   rooms, sessions, presence, stats, deployment — is already built and reusable.
   What is missing is the game itself plus tournaments and matchmaking. This is
   the only path that passes the subject.
2. **Confirm the subject really is Pong for your intake.** If your version of the
   subject differs, verify it in writing before building anything else.

Everything below assumes the platform as it exists today.

---

## 2. Where each branch went

| Branch     | Role                    | Disposition                                                        |
| ---------- | ----------------------- | ------------------------------------------------------------------ |
| `front`    | Next.js frontend        | Became `frontend/` — the only complete UI.                          |
| `backend`  | NestJS API + gateway    | Base of `backend/`.                                                 |
| `abifkirn` | `backend` + 1 commit    | **Merged.** Its single commit fixes the roster event mismatch.      |
| `bnafiai`  | Rustbox judge work      | **Already contained in `backend`** — zero commits ahead. Nothing lost. |
| `zmounji`  | DevOps                  | Source of `db/`, `monitoring/`, the Dockerfiles and compose layout. |
| `abdael-m` | Early frontend scaffold | Superseded by `front`; only its `start -p 1337` fix was worth keeping. |

`zmounji` also carried hand-copied snapshots of the backend and frontend that were
already two days stale and missing the entire battles UI, the socket client and
the judge. Those snapshots were discarded in favour of the real branches.

---

## 3. What works

- **Authentication.** better-auth runs inside NestJS; email/password, Google,
  GitHub and 42-intra OAuth are configured. Passwords are hashed with scrypt. The
  same session cookie authenticates REST calls and the websocket handshake.
- **Challenges.** Create, list, publish and delete, with a timing interceptor.
- **Battles.** Create (solo/duo/group, public/private), join, leave, start, end.
- **Live gameplay.** socket.io rooms, live rosters, live verdicts, XP on win.
- **Judging.** Submissions are executed by the Rustbox sandbox and compared to the
  expected output server-side, with per-user rate limiting and single-flight
  submission locking.
- **Leaderboard and profiles.** Ranking by level/exp/wins, presence heartbeat.
- **Monitoring.** Prometheus, Alertmanager, Grafana, node and postgres exporters.

## 4. What was broken and is now fixed

Fixed while assembling this tree:

**Security**

- `PATCH /user/battleResult` let any user award themselves arbitrary wins and XP —
  removed.
- `submitCode` never checked that the submitter had joined the battle, so anyone
  with a battle id could steal a win — membership and `RUNNING` status now enforced.
- `endBattle` let any authenticated socket terminate any battle — now restricted.
- Every submission's **full source code** was broadcast to the whole room before
  judging, so opponents could copy the winning solution — no longer broadcast.
- `challenge.expectedOutput` (the answer) was shipped to clients, and judging is a
  string compare — stripped from client-facing responses.
- Private battle `roomCode` was sent to every client and verified in the browser —
  stripped; the server now validates it.
- Any authenticated user could rewrite or publish anyone else's challenge —
  ownership/admin check added server-side.
- `GET /user/all` returned every user's email to every client — restricted to
  leaderboard-safe fields.
- Committed secrets (a live Gmail app password, Postgres and Grafana passwords)
  removed; everything now comes from a git-ignored `.env`. **The leaked Gmail app
  password and database passwords must still be rotated — deleting them from the
  working tree does not remove them from git history.**
- The monitoring database user was `SUPERUSER`; it now holds only `pg_monitor`.

**Integration**

- `app.enableCors()` was never called, so every browser REST call failed — added.
- The gateway used `origin: '*'` with `credentials: true`, a combination browsers
  reject outright — now driven by `TRUSTED_ORIGINS`.
- The backend emitted `battle-${id}:allPlayers` while the frontend listened for
  `battle:playersUpdated` — unified (this is what `abifkirn` fixed).
- `battle:playerWon` carried no `battleId`, so a win in any battle marked the
  user's own battle finished — payload now includes it.
- `battle:started` emitted a battle with no relations, blanking the lobby — the
  payload now includes players and challenge.
- Websocket errors never reached the client in the `{ error }` shape the frontend
  expects, so failures hung silently — handlers now return it.
- The presence heartbeat 401'd on every beat during a battle — fixed.
- A stale session cookie caused an infinite `/` ↔ `/auth` redirect loop — the
  frontend now distinguishes "unauthenticated" from "backend unreachable".
- `ValidationPipe` had no options, so unknown fields reached Prisma — now
  `whitelist` + `forbidNonWhitelisted`.
- Auth rate limiting was 5 requests/minute across all of `/api/auth/*`, which
  broke normal sign-up flows and was shared across the campus NAT — retuned to
  target credential endpoints only.

**Deployment**

- No branch could start with one command. There is now a root `docker-compose.yml`
  plus a `Makefile`: `make` builds and runs the whole stack.
- There was no HTTPS anywhere and websockets ran in the clear. An nginx service now
  terminates TLS and serves everything from one origin, so websockets are `wss`.
- The compose file required a pre-existing external Docker network and referenced
  `.env` files that were never committed — both fixed; volumes, healthchecks and
  ordered startup added.
- `postinstall` ran `prisma db push`, so `npm install` failed without a live
  database — migrations now run at container start with `prisma migrate deploy`,
  which also means the committed migration history is finally used.
- Both Dockerfiles were single-stage and shipped build tooling — now multi-stage.
- Frontend `start` bound port 3000, colliding with the backend — now 1337.

**Quality**

- Removed the v0.dev debug traces (`[v0]` logs and a global `onAny` socket
  listener), dead code (`useBattle.tsx`, unused socket helpers, unreachable
  password prompt), `alert()`-driven UX, duplicate DOM ids, and the misspelled
  `myfectch.ts` / `chanllenges` / `Battels` identifiers.

## 5. What is still missing

**Mandatory for the subject (see section 1)**

- The Pong game: local two-player, identical paddle speeds.
- Tournament system: brackets, per-tournament aliases, announcing next matches.
- Matchmaking.

**Feature gaps in the platform as built**

| Gap | Notes |
| --- | ----- |
| Live chat | `ChatSession`/`Message` models exist but are commented out in the schema. No UI, endpoints or events. A subject module. |
| Two-factor authentication | Not started. better-auth ships a 2FA plugin, so this is a small module to claim. |
| Friends / blocking | No model, no UI. |
| Match history | Battles are not retained per user beyond aggregate win/loss counters. |
| Profile editing | `PATCH /user/me` exists; there is no UI for it. |
| Avatar upload | No upload endpoint; avatars come from OAuth providers or a default image. |
| GDPR endpoints | Only static policy pages; no data export, anonymisation or account deletion. |
| Battle cancellation | `PATCH /battles/:id/cancel` exists with no UI, so an abandoned lobby can only be left. |
| Submission history | Verdicts are broadcast and discarded; nothing is persisted, so there is no audit trail or replay. |
| Tests | Only `should be defined` scaffolds. No integration or e2e coverage. |
| CI | None. |

**Known weaknesses to be aware of**

- Judging is an exact string comparison of stdout, so a challenge whose expected
  output is guessable can be won by printing it. Consider hidden test cases.
- Code execution is outsourced to a third-party SaaS; if Rustbox is down or the
  API key is missing, battles cannot be judged.
- The backend framework is NestJS on Express. The subject's backend module pins
  Fastify, so this does not claim that module as written.
- The leaderboard is paginated and searched entirely client-side over the full
  user list.

## 6. Suggested order of work

1. **Rotate every leaked credential** (Gmail app password, Postgres, Grafana).
   They are still in git history.
2. **Resolve the Pong question** in section 1 before writing more features.
3. Run the stack end-to-end (`make`), sign up, create a challenge, run a two-player
   battle, and confirm the judge path works with a real Rustbox key.
4. Persist submissions, then build match history on top.
5. Claim the cheap subject modules that fit what exists: 2FA (better-auth plugin),
   live chat (models already sketched), GDPR endpoints.
6. Add integration tests around the battle lifecycle and the judge, then CI.
