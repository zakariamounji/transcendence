#!/bin/bash
set -e

# 1. Initialize the database folder if it hasn't been done yet
if [ ! -d "/var/lib/postgresql/15/main/base" ]; then
    echo "Initializing database cluster..."
    /usr/lib/postgresql/15/bin/initdb -D /var/lib/postgresql/15/main
fi

echo "Starting temporary database instance..."
/usr/lib/postgresql/15/bin/pg_ctl -D /var/lib/postgresql/15/main \
    -o "-c config_file=/etc/postgresql/15/main/postgresql.conf" \
    -l /tmp/postgres_init.log start

echo "Waiting for database to be ready..."
while ! /usr/lib/postgresql/15/bin/pg_isready -q; do
    sleep 1
done

echo "Database is ready. Running configuration queries..."

/usr/lib/postgresql/15/bin/psql -U postgres <<'EOF'
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'exporter') THEN
        CREATE USER exporter WITH PASSWORD '1234';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'zakaria') THEN
        CREATE USER zakaria WITH PASSWORD '1234';
    ELSE
        ALTER USER zakaria WITH PASSWORD '1234';
    END IF;
END
$$;

SELECT 'CREATE DATABASE freelancer OWNER zakaria'
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_database WHERE datname = 'freelancer')
\gexec

ALTER DATABASE freelancer OWNER TO zakaria;

-- Connect to the freelancer database and fix ownership/privileges
\c freelancer;

GRANT ALL PRIVILEGES ON DATABASE freelancer TO zakaria;
GRANT ALL PRIVILEGES ON SCHEMA public TO zakaria;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO zakaria;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO zakaria;

DO
$$
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
$$;

-- Remove stale users table/schema state so schema sync starts clean
DROP TABLE IF EXISTS public.users CASCADE;
DROP SEQUENCE IF EXISTS public.users_id_seq;

-- Create application table as zakaria
SET SESSION AUTHORIZATION zakaria;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL
);

ALTER TABLE public.users OWNER TO zakaria;
ALTER SEQUENCE public.users_id_seq OWNER TO zakaria;

INSERT INTO users (id, email, password) VALUES 
(1, 'user@gmail.com', '1234567'),
(2, 'zakaria@gmail.com', '1234567')
ON CONFLICT (email) DO NOTHING;

RESET SESSION AUTHORIZATION;
EOF

# 5. Stop the background instance cleanly using full path
echo "Stopping temporary database instance..."
/usr/lib/postgresql/15/bin/pg_ctl -D /var/lib/postgresql/15/main -m fast stop

# 6. Start the permanent database foreground process using full path
echo "Starting database server as main process..."
exec /usr/lib/postgresql/15/bin/postgres -D /var/lib/postgresql/15/main -c config_file=/etc/postgresql/15/main/postgresql.conf

