FROM nginx:alpine

# Install openssl to generate self-signed SSL certificates for transcendence HTTPS
RUN apk add --no-cache openssl

# Create SSL directory and generate self-signed certificate
RUN mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/transcendence.key \
    -out /etc/nginx/certs/transcendence.crt \
    -subj "/C=MA/ST=Khouribga/L=Khouribga/O=1337/OU=Transcendence/CN=localhost"

# Copy NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8443

CMD ["nginx", "-g", "daemon off;"]