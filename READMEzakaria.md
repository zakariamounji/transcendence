# ft_transcendence — Infrastructure Modules

This document covers the three infrastructure/architecture modules implemented in this project:

1. [Log Management with ELK](#1-log-management-with-elk)
2. [Monitoring with Prometheus & Grafana](#2-monitoring-with-prometheus--grafana)
3. [Backend as Microservices](#3-backend-as-microservices)

---

## Quick start

```bash
make            # check .env, create the shared network, build & start the main app
make monitoring # build & start the ELK + Prometheus/Grafana stack
make status     # show container status for both stacks
make clean      # stop everything and remove the shared network
```

The app is served at `https://localhost:8443` (nginx, TLS). Monitoring services are reachable directly on their own ports (see below), on the same host, once `make monitoring` succeeds.

Both stacks share one external Docker network (`mynetwork`) and one `.env` file at the repo root — copy `.env.example` to `.env` and fill in real secrets before running either.

---

## 1. Log Management with ELK

**Location:** `monitoring/` (`elasticsearch/`, `logstash/`, `kibana`, `filebeat/`)

### Pipeline

```
containers (stdout/stderr JSON logs)
        │
        ▼
   Filebeat  ──(container input, tails /var/lib/docker/containers/*/*.log)
        │  ships over the beats protocol
        ▼
   Logstash  ──(port 5044)
        │  parses JSON app payloads into an `app` sub-field,
        │  tags `environment: production`
        ▼
 Elasticsearch ──(daily index: logs-YYYY.MM.dd)
        │
        ▼
     Kibana ──(visualization & dashboards, port 5601)
```

- **Elasticsearch** stores and indexes logs, with X-Pack security enabled (`xpack.security.enabled: true`) and authenticated via the built-in `elastic` user.
- **Logstash** collects logs from Filebeat and transforms them: it detects JSON-formatted application log lines and decodes them into a structured `app` field (so app-level keys never collide with the base ECS fields), and stamps every event with an `environment` field.
- **Kibana** provides visualization and dashboards, authenticating to Elasticsearch as the built-in `kibana_system` service account (password set once at startup by the `es-setup` init job) and using its own encryption keys so saved objects, alerting rules, and reporting survive restarts.
- **Filebeat** runs with `user: "0:0"` and mounts the host's Docker container-log directory and the Docker socket read-only, tagging each event with Docker metadata (container name/id/image) via `add_docker_metadata`.

### Startup ordering

`elasticsearch` → `es-setup` (one-shot job that waits for Elasticsearch's security realm to accept auth, then sets the `kibana_system` password) → `kibana`. `logstash` and `filebeat` start once Elasticsearch is up; Logstash retries its own connection to Elasticsearch internally.

### Security

- Elasticsearch: X-Pack security on, HTTP auth required for all API calls (`elastic` superuser for admin/setup, `kibana_system` for Kibana).
- Kibana: dedicated service-account credentials (no shared superuser), persistent encryption keys for saved objects / alerting / reporting.
- Logstash → Elasticsearch output: authenticated with `elastic`/`${ELASTIC_PASSWORD}`, internal monitoring pipeline disabled (`xpack.monitoring.enabled: false`) so it doesn't hit Elasticsearch unauthenticated.
- All credentials/keys are injected via `.env` (see `.env.example`), never hardcoded.

### Log retention & archiving

> **Status: not yet implemented.** Indices are currently created per day (`logs-YYYY.MM.dd`) but nothing deletes or archives old ones — they will grow unbounded. To finish this requirement, add an Index Lifecycle Management (ILM) policy in Elasticsearch (e.g. rollover after N days/GB, move to a `warm`/`cold` phase, delete after a retention window) and attach it via an index template so new `logs-*` indices pick it up automatically.

### Access

| Service | URL | Auth |
|---|---|---|
| Elasticsearch | `http://localhost:9200` | `elastic` / `${ELASTIC_PASSWORD}` |
| Kibana | `http://localhost:5601` | `elastic` / `${ELASTIC_PASSWORD}` (or a Kibana-created user) |

---

## 2. Monitoring with Prometheus & Grafana

**Location:** `monitoring/` (`prometheus/`, `alertmanager/`, `grafana/`, plus `node-exporter`, `cadvisor`, `postgres-exporter`)

### Metrics collection

Prometheus scrapes every 15s by default (5s for itself):

| Job | Target | What it measures |
|---|---|---|
| `prometheus` | itself | Prometheus's own health |
| `node` | `node-exporter:9100` | Host CPU, memory, disk, network |
| `cadvisor` | `cadvisor:8080` | Per-container CPU/memory (feeds `ContainerHighMemory`) |
| `postgres` | `postgres-exporter:9187` | PostgreSQL health/stats via `pg_up` and friends |

`postgres-exporter` is configured with split `DATA_SOURCE_USER`/`DATA_SOURCE_PASS` (not a single DSN), because the exporter password contains `@`, which would otherwise corrupt a connection URI.

> The NestJS backend is not yet instrumented (no `/metrics` endpoint), so it isn't scraped and there's no `BackendDown` alert. Add `prom-client`, expose `/metrics`, then re-enable the commented-out `nestjs-backend-local` job in `prometheus.yml`.

### Alerting rules (`prometheus/alert.rules.yml`)

| Alert | Condition | Severity |
|---|---|---|
| `DatabaseDown` | `pg_up == 0` for 30s | critical |
| `PostgresExporterDown` | Prometheus can't scrape postgres-exporter for 30s | critical |
| `ContainerHighMemory` | a container is above 85% of its memory limit for 1m | warning |
| `NodeExporterDown` | Prometheus can't scrape node-exporter for 30s | warning |

Alerts fire to **Alertmanager**, which groups by `alertname`, waits 10s before the first notification and re-notifies every hour, and routes to email via SMTP if credentials are configured — otherwise to a `null` receiver so alerts are still visible in the Alertmanager UI/API without failing on missing SMTP config.

### Grafana dashboards

- Datasource (Prometheus) and the `Transcendence` dashboard folder are auto-provisioned on boot from `grafana/provisioning/` — no manual setup needed after `make monitoring`.
- Dashboard JSON lives in `grafana/provisioning/dashboards/transcendence.json`; add more `.json` files to the same folder to provision additional dashboards.

### Securing Grafana access

- `GF_AUTH_ANONYMOUS_ENABLED=false` — no anonymous dashboard access.
- Admin credentials (`GF_SECURITY_ADMIN_USER` / `GF_SECURITY_ADMIN_PASSWORD`) come from `.env`, not the image defaults.
- Dashboards/datasources are provisioned as read-only (`editable: false`) so changes go through version control, not ad-hoc UI edits.

### Access

| Service | URL |
|---|---|
| Prometheus | `http://localhost:9090` |
| Alertmanager | `http://localhost:9093` |
| Grafana | `http://localhost:3005` |

---

## 3. Backend as Microservices

**Location:** `backend/src/`

The backend is a single NestJS process, structured as loosely-coupled, single-responsibility modules rather than a flat controller/service pile — each domain is isolated behind its own module and only exposes what it explicitly exports:

| Module | Responsibility | Exposes |
|---|---|---|
| `auth` | Authentication (email/password, OAuth via Google/GitHub/42) | REST, via `better-auth` |
| `user` | User profiles, sign-in hooks | REST (`/user`, `/users`) |
| `battle` | Battle/match lifecycle, backed by Postgres + a Redis cache (5 min TTL) for hot reads | REST (`/battle`, `/battles`) |
| `challenge` | Challenge management | REST (`/challenge`, `/challenges`) |
| `gateway` | Real-time layer (Socket.IO): live battle activity, timers | WebSocket (`/socket.io/`) |
| `database` | Prisma/Postgres access, shared via DI | Internal only |

Cross-module access happens only through explicit NestJS `imports`/`exports` (e.g. `battle` imports `database` and its own `redis` module; `gateway` imports `battle`) — no module reaches into another's internals directly, which keeps interfaces clear and modules independently testable.

**Communication:**
- **REST APIs** are the primary interface between the frontend and each module, each on its own route prefix, routed by nginx (`/api/auth`, `/user(s)`, `/battle(s)`, `/challenge(s)`) to a single backend upstream.
- **Redis** is used as shared, fast state for the real-time path — the `battle` module caches battle documents (`battle:<id>`, 5 min TTL) and the `gateway` module reads/writes the same store, so the WebSocket layer and REST layer stay consistent without both hitting Postgres on every event.
- **WebSocket (Socket.IO)** carries live push updates (battle activity, disconnect timers) that don't fit the request/response REST model.

> Note: this is a modular monolith (one deployable process, strict internal module boundaries) rather than physically separate microservice containers. It satisfies "loosely-coupled services with clear interfaces / single responsibility" at the code level; splitting modules into separate deployables would be the next step if true independent scaling/deployment is required.

### Security

- All backend traffic is reached only through nginx over TLS (`https://localhost:8443`); the backend container itself is not published on a host port.
- Auth is centralized in the `auth` module (OAuth + session/JWT via `better-auth`), so other modules don't each implement their own auth logic.

---

## Repository layout

```
.
├── docker-compose.yml       # main app: db, redis, backend, frontend, nginx
├── Makefile                 # make / make monitoring / make status / make clean
├── backend/                 # NestJS backend (see §3)
├── frontend/                # Next.js frontend
├── nginx/                   # TLS-terminating reverse proxy
├── db/                      # Postgres Dockerfile
├── redis/                   # Redis Dockerfile
└── monitoring/
    ├── docker-compose.yml   # ELK + Prometheus/Grafana stack (see §1, §2)
    ├── elasticsearch/
    ├── logstash/
    ├── filebeat/
    ├── prometheus/
    ├── alertmanager/
    ├── grafana/
    └── postgres-exporter/
```
