FROM prom/alertmanager:v0.27.0

USER root
COPY alertmanager.yml.template /etc/alertmanager/alertmanager.yml.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9093
ENTRYPOINT ["/entrypoint.sh"]
