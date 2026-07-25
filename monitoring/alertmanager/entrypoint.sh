#!/bin/sh
# Substitute SMTP credentials from the environment into the config,
# so no secret is ever baked into the image or committed to git.
set -e

: "${ALERT_SMTP_HOST:=smtp.example.com:587}"
: "${ALERT_EMAIL_FROM:=alerts@example.com}"
: "${ALERT_EMAIL_TO:=team@example.com}"
: "${ALERT_SMTP_PASSWORD:=disabled}"

sed -e "s|\${ALERT_SMTP_HOST}|$ALERT_SMTP_HOST|g" \
    -e "s|\${ALERT_EMAIL_FROM}|$ALERT_EMAIL_FROM|g" \
    -e "s|\${ALERT_EMAIL_TO}|$ALERT_EMAIL_TO|g" \
    -e "s|\${ALERT_SMTP_PASSWORD}|$ALERT_SMTP_PASSWORD|g" \
    /etc/alertmanager/alertmanager.yml.template > /etc/alertmanager/alertmanager.yml

exec /bin/alertmanager \
  --config.file=/etc/alertmanager/alertmanager.yml \
  --storage.path=/alertmanager
