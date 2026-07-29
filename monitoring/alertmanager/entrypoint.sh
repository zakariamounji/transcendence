#!/bin/sh
# Substitute SMTP credentials from the environment into the config,
# so no secret is ever baked into the image or committed to git.
set -e

# Previously this fell back to smtp.example.com, which does not resolve.
# Alertmanager then retried the delivery forever and filled the log with
# "Notify for alerts failed ... no such host". Route to a no-op receiver
# instead unless every SMTP setting is actually present.
if [ -n "$ALERT_SMTP_HOST" ] && [ -n "$ALERT_SMTP_PASSWORD" ] &&
   [ -n "$ALERT_EMAIL_FROM" ] && [ -n "$ALERT_EMAIL_TO" ]; then
  ALERT_RECEIVER=email-notifications
  echo "alertmanager: email notifications enabled -> $ALERT_EMAIL_TO"
else
  ALERT_RECEIVER=null
  echo "alertmanager: SMTP not configured; alerts route to the null receiver."
  echo "alertmanager: set ALERT_SMTP_HOST, ALERT_EMAIL_FROM, ALERT_EMAIL_TO and"
  echo "alertmanager: ALERT_SMTP_PASSWORD in .env to enable email delivery."
fi

# Placeholders only, so the unused receiver still parses as valid config.
: "${ALERT_SMTP_HOST:=smtp.example.com:587}"
: "${ALERT_EMAIL_FROM:=alerts@example.com}"
: "${ALERT_EMAIL_TO:=team@example.com}"
: "${ALERT_SMTP_PASSWORD:=disabled}"

sed -e "s|\${ALERT_RECEIVER}|$ALERT_RECEIVER|g" \
    -e "s|\${ALERT_SMTP_HOST}|$ALERT_SMTP_HOST|g" \
    -e "s|\${ALERT_EMAIL_FROM}|$ALERT_EMAIL_FROM|g" \
    -e "s|\${ALERT_EMAIL_TO}|$ALERT_EMAIL_TO|g" \
    -e "s|\${ALERT_SMTP_PASSWORD}|$ALERT_SMTP_PASSWORD|g" \
    /etc/alertmanager/alertmanager.yml.template > /etc/alertmanager/alertmanager.yml

exec /bin/alertmanager \
  --config.file=/etc/alertmanager/alertmanager.yml \
  --storage.path=/alertmanager
