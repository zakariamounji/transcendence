FROM redis:7-alpine

# envsubst is not part of the base image; the entrypoint uses it to render
# redis.conf from the environment.
RUN apk add --no-cache gettext-envsubst

# Copy the configuration template and the entrypoint that renders it
COPY redis.conf.template /usr/local/etc/redis/redis.conf.template
COPY entrypoint.sh /usr/local/bin/redis-entrypoint.sh
RUN chmod +x /usr/local/bin/redis-entrypoint.sh

# Matches the default REDIS_PORT; the actual port comes from the environment
EXPOSE 6378

ENTRYPOINT ["/usr/local/bin/redis-entrypoint.sh"]
