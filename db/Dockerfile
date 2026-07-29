FROM postgres:17

COPY setup.sh /docker-entrypoint-initdb.d/10-setup.sh
RUN chmod +x /docker-entrypoint-initdb.d/10-setup.sh

EXPOSE 5432