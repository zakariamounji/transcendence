#!/bin/bash
set -e

# Fail fast if the container was started without the required credentials,
# otherwise an empty expansion would silently produce broken SQL.
: "${POSTGRES_USER:?POSTGRES_USER is not set}"
: "${DB_NAME:?DB_NAME is not set}"
: "${DB_USER:?DB_USER is not set}"
: "${DB_PASSWORD:?DB_PASSWORD is not set}"
: "${EXPORTER_USER:?EXPORTER_USER is not set}"
: "${EXPORTER_PASSWORD:?EXPORTER_PASSWORD is not set}"

# The official image passes POSTGRES_USER (default: postgres) to psql automatically.
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" <<-EOSQL
DO
\$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${EXPORTER_USER}') THEN
        CREATE USER "${EXPORTER_USER}" WITH PASSWORD '${EXPORTER_PASSWORD}' SUPERUSER;
    ELSE
        ALTER USER "${EXPORTER_USER}" WITH PASSWORD '${EXPORTER_PASSWORD}';
        ALTER USER "${EXPORTER_USER}" WITH SUPERUSER;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
        CREATE USER "${DB_USER}" WITH PASSWORD '${DB_PASSWORD}';
    ELSE
        ALTER USER "${DB_USER}" WITH PASSWORD '${DB_PASSWORD}';
    END IF;
END
\$\$;

SELECT 'CREATE DATABASE "${DB_NAME}" OWNER "${DB_USER}"'
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_database WHERE datname = '${DB_NAME}')
\gexec

ALTER DATABASE "${DB_NAME}" OWNER TO "${DB_USER}";

-- Connect to the application database and set permissions
\c ${DB_NAME};

GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME}" TO "${DB_USER}";
GRANT ALL PRIVILEGES ON SCHEMA public TO "${DB_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO "${DB_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO "${DB_USER}";

DO
\$\$
DECLARE
    tbl record;
    seq record;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I OWNER TO %I', tbl.tablename, '${DB_USER}');
    END LOOP;
    FOR seq IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public' LOOP
        EXECUTE format('ALTER SEQUENCE public.%I OWNER TO %I', seq.sequence_name, '${DB_USER}');
    END LOOP;
END
\$\$;

RESET SESSION AUTHORIZATION;
EOSQL
