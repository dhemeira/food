#!/bin/sh
set -e

cd /srv/backend

# Send a test push to all subscribed devices on startup.
# Exits non-zero when there are no subscriptions yet; that's expected on first boot.
php api/send-push.php || true

exec apache2-foreground