#!/bin/bash
set -e

# The official image passes POSTGRES_USER (default: postgres) to psql automatically.
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" <<-EOSQL
DO
\$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'exporter') THEN
        CREATE USER exporter WITH PASSWORD '1234' SUPERUSER;
    ELSE
        ALTER USER exporter WITH PASSWORD '1234';
        ALTER USER exporter WITH SUPERUSER;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'zakaria') THEN
        CREATE USER zakaria WITH PASSWORD '1234';
    ELSE
        ALTER USER zakaria WITH PASSWORD '1234';
    END IF;
END
\$\$;

SELECT 'CREATE DATABASE freelancer OWNER zakaria'
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_database WHERE datname = 'freelancer')
\gexec

ALTER DATABASE freelancer OWNER TO zakaria;

-- Connect to the freelancer database and set permissions
\c freelancer;

GRANT ALL PRIVILEGES ON DATABASE freelancer TO zakaria;
GRANT ALL PRIVILEGES ON SCHEMA public TO zakaria;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO zakaria;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO zakaria;

DO
\$\$
DECLARE
    tbl record;
    seq record;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I OWNER TO zakaria', tbl.tablename);
    END LOOP;
    FOR seq IN SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public' LOOP
        EXECUTE format('ALTER SEQUENCE public.%I OWNER TO zakaria', seq.sequence_name);
    END LOOP;
END
\$\$;

RESET SESSION AUTHORIZATION;
EOSQL
