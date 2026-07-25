FROM nginx:1.27-alpine

# Self-signed certificate for local HTTPS (42 requirement).
# For a real domain, replace with proper certificates.
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/certs/transcendence.key \
      -out /etc/nginx/certs/transcendence.crt \
      -subj "/C=MA/ST=Khouribga/L=Khouribga/O=1337/OU=transcendence/CN=localhost"

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8443
