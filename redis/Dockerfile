FROM redis:7-alpine

# Copy custom configuration file into the container
COPY redis.conf /usr/local/etc/redis/redis.conf

# Expose the standard Redis port
EXPOSE 6379

# Launch redis-server with the custom config path
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
