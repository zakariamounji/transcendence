#!/bin/bash
# Runs once on first boot (empty data dir) via docker-entrypoint-initdb.d.
# Creates the application database/user and a read-only monitoring user.
# All credentials come from the environment (see root .env).
set -euo pipefail

: "${APP_DB_NAME:?APP_DB_NAME is required}"
: "${APP_DB_USER:?APP_DB_USER is required}"
: "${APP_DB_PASSWORD:?APP_DB_PASSWORD is required}"
: "${EXPORTER_PASSWORD:?EXPORTER_PASSWORD is required}"

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" <<-EOSQL
    CREATE USER "$APP_DB_USER" WITH PASSWORD '$APP_DB_PASSWORD';

    -- Monitoring user: pg_monitor role only, never a superuser
    CREATE USER exporter WITH PASSWORD '$EXPORTER_PASSWORD';
    GRANT pg_monitor TO exporter;

    CREATE DATABASE "$APP_DB_NAME" OWNER "$APP_DB_USER";
EOSQL

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$APP_DB_NAME" <<-EOSQL
    GRANT ALL PRIVILEGES ON SCHEMA public TO "$APP_DB_USER";
EOSQL
