# API reference

Every route is protected by a global `AuthGuard` unless marked **public**.
Authentication is a better-auth session cookie, sent automatically by the browser
because the frontend and backend share one origin behind nginx.

REST responses are wrapped by a global interceptor:

```json
{ "statusCode": 200, "message": "OK", "data": { } }
```

## Authentication — `/api/auth/*`

Handled entirely by better-auth. The routes the frontend uses:

| Method | Path                        | Purpose                          |
| ------ | --------------------------- | -------------------------------- |
| POST   | `/api/auth/sign-up/email`   | Register with email and password  |
| POST   | `/api/auth/sign-in/email`   | Log in                            |
| POST   | `/api/auth/sign-in/social`  | Google / GitHub                   |
| GET    | `/api/auth/sign-in/oauth2`  | 42 intra (generic OAuth provider) |
| POST   | `/api/auth/sign-out`        | Log out                           |
| GET    | `/api/auth/get-session`     | Current session                   |

Sign-in and sign-up are rate limited more strictly than the rest of `/api/auth/*`.

## Users

| Method | Path           | Purpose                                                              |
| ------ | -------------- | -------------------------------------------------------------------- |
| GET    | `/user/me`     | The caller's own profile, including their email                       |
| GET    | `/user/all`    | Leaderboard, ordered by level → exp → wins. **Never includes emails** |
| PATCH  | `/user/me`     | Update `name` and `image`                                             |
| POST   | `/user/status` | Presence heartbeat: `{ "status": "ONLINE" \| "OFFLINE" }`             |

An `ONLINE` heartbeat does not overwrite `IN_BATTLE`, so the 20-second heartbeat
cannot knock a player out of a running battle.

## Challenges

| Method | Path                      | Purpose                                     |
| ------ | ------------------------- | ------------------------------------------- |
| GET    | `/challenges`             | Published challenges                        |
| GET    | `/challenges/me`          | Challenges the caller created                |
| GET    | `/challenges/:id`         | One challenge                                |
| POST   | `/challenges`             | Create                                       |
| POST   | `/challenges/:id`         | Update or publish — **creator or admin only** |
| DELETE | `/challenges/:id`         | Delete — **creator or admin only**           |

`expectedOutput` is never included in a listing. Judging is an exact output
comparison, so shipping it would hand clients the answer.

## Battles

| Method | Path                     | Purpose                            |
| ------ | ------------------------ | ---------------------------------- |
| GET    | `/battles/all`           | Battle list                         |
| GET    | `/battles/current`       | The caller's active battle          |
| GET    | `/battles/:id`           | One battle                          |
| POST   | `/battles/create`        | Create a battle                     |
| PATCH  | `/battles/:id/cancel`    | Cancel — **creator only**, `WAITING` |

Create accepts:

```json
{
  "mode": "SOLO" | "DUO" | "GROUP",
  "visibility": "PUBLIC" | "PRIVATE",
  "challengeId": "…",
  "roomCode": "optional, 4-12 alphanumeric, PRIVATE only"
}
```

`roomCode` is returned **only** in this create response, to its creator. Every
other battle read omits it, and the server validates it on join.

## Operations (public)

| Method | Path       | Purpose                                       |
| ------ | ---------- | --------------------------------------------- |
| GET    | `/health`  | Liveness, used by the Docker healthcheck       |
| GET    | `/metrics` | Prometheus metrics — not exposed through nginx |

## WebSocket

socket.io on the same origin (`wss://…/socket.io/`). The session cookie
authenticates the handshake, so the gateway resolves the user on every event.

### Client → server

Each emit takes an acknowledgement callback. On failure the ack is
`{ "error": "message" }`.

| Event              | Payload                                          | Notes                                |
| ------------------ | ------------------------------------------------ | ------------------------------------ |
| `joinBattle`       | `{ battleId, roomCode? }`                        | Room code checked server-side         |
| `leaveBattle`      | `{ battleId }`                                   |                                       |
| `startBattle`      | `{ battleId }`                                   | Creator only                          |
| `endBattle`        | `{ battleId }`                                   | Creator only, battle must be running  |
| `submitCode`       | `{ battleId, language, code, stdin? }`           | Member only, battle must be running   |
| `getBattlePlayers` | `{ battleId }`                                   | Returns the roster                    |

`submitCode` is rate limited per user and allows one in-flight submission at a
time.

### Server → client

| Event                    | Payload                    | When                                      |
| ------------------------ | -------------------------- | ----------------------------------------- |
| `battle:playersUpdated`  | `{ battleId, players }`    | Someone joins or leaves                    |
| `battle:started`         | `{ battle }`               | Creator starts it                          |
| `battle:playerWon`       | `{ battleId, userId }`     | A submission produced the expected output   |
| `battle:ended`           | `{ battle }`               | Battle finished                            |
| `codeSubmitted`          | `{ userId, language }`     | A player submitted — **source is not sent** |
| `codeResult`             | `{ userId, result }`       | A verdict came back from the judge          |

`battle:started` and `battle:ended` carry the battle with its players and
challenge, minus the room code and expected output.

Verdicts follow the judge's vocabulary: `AC` accepted, `WA` wrong answer,
`TLE` time limit exceeded, `RE` runtime error.
