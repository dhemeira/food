#!/bin/sh
set -e

cd /srv/backend

# Ensure the data directory is writable by the web server, regardless of which
# user created the files (e.g. seed.php run via `docker compose exec` as root).
chown -R www-data:www-data /srv/backend/data 2>/dev/null || true

# Send a test push to all subscribed devices on startup.
# Exits non-zero when there are no subscriptions yet; that's expected on first boot.
php api/send-push.php || true

exec apache2-foreground
