#!/bin/sh
set -eu

TEMPLATE=/usr/local/etc/redis/redis.conf.template
CONF=/tmp/redis.conf

# Fail fast rather than starting an unauthenticated Redis.
: "${REDIS_PASSWORD:?REDIS_PASSWORD is not set}"

# Defaults keep the rendered config valid when an optional tunable is absent;
# an empty value would be a syntax error and Redis would refuse to start.
export REDIS_PORT="${REDIS_PORT:-6379}"
export REDIS_APPENDONLY="${REDIS_APPENDONLY:-yes}"
export REDIS_MAXMEMORY="${REDIS_MAXMEMORY:-256mb}"
export REDIS_MAXMEMORY_POLICY="${REDIS_MAXMEMORY_POLICY:-allkeys-lru}"
export REDIS_LOGLEVEL="${REDIS_LOGLEVEL:-notice}"

# Only the listed placeholders are substituted, so anything else that happens to
# look like a shell variable in the template is left untouched.
envsubst '${REDIS_PORT} ${REDIS_PASSWORD} ${REDIS_APPENDONLY} ${REDIS_MAXMEMORY} ${REDIS_MAXMEMORY_POLICY} ${REDIS_LOGLEVEL}' \
	< "$TEMPLATE" > "$CONF"

# Chain to the base image's entrypoint so it still drops root to the redis user.
exec docker-entrypoint.sh redis-server "$CONF" "$@"
