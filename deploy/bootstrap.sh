#!/bin/bash
# Run on the Oracle VM as root (sudo bash bootstrap.sh)
set -euo pipefail

APP_DIR=/opt/flatmates
SRC_DIR=/opt/flatmates-src
DATA_DIR=/var/lib/flatmates
SITE=www.flatmates.co.in
EMAIL="${CERTBOT_EMAIL:-support@flatmates.co.in}"

MEM_KB=$(awk '/MemTotal/ {print $2}' /proc/meminfo 2>/dev/null || echo 8000000)
if [[ "${MEM_KB}" -lt 2000000 ]]; then
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"
else
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
fi

install -d -o ubuntu -g ubuntu "$APP_DIR" "$SRC_DIR" "$DATA_DIR/images"

if [[ -f /tmp/flatmates.env ]]; then
  install -m 600 -o root -g root /tmp/flatmates.env /etc/flatmates.env
fi

if [[ -f /tmp/src.tgz ]]; then
  rm -rf "$SRC_DIR"
  install -d -o ubuntu -g ubuntu "$SRC_DIR"
  tar -xzf /tmp/src.tgz -C "$SRC_DIR"
fi

if [[ -f /tmp/flatmates-release/server.js ]]; then
  rsync -a --delete --exclude 'deploy/secrets' /tmp/flatmates-release/ "$APP_DIR/"
elif [[ -f "$SRC_DIR/package.json" ]]; then
  if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  fi
  chown -R ubuntu:ubuntu "$SRC_DIR"
  sudo -u ubuntu bash -lc "cd '$SRC_DIR' && npm ci && npm run build"
  rm -rf "$APP_DIR"
  install -d -o ubuntu -g ubuntu "$APP_DIR/.next"
  rsync -a "$SRC_DIR/.next/standalone/" "$APP_DIR/"
  rsync -a "$SRC_DIR/public/" "$APP_DIR/public/"
  rsync -a "$SRC_DIR/.next/static/" "$APP_DIR/.next/static/"
  rsync -a "$SRC_DIR/deploy/" "$APP_DIR/deploy/"
fi

if [[ -d "$APP_DIR/deploy" ]]; then
  install -m 644 "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/flatmates
  ln -sfn /etc/nginx/sites-available/flatmates /etc/nginx/sites-enabled/flatmates
  rm -f /etc/nginx/sites-enabled/default
  install -m 644 "$APP_DIR/deploy/flatmates.service" /etc/systemd/system/flatmates.service
  install -m 755 "$APP_DIR/deploy/healthcheck.sh" /usr/local/bin/flatmates-healthcheck
  install -m 755 "$APP_DIR/deploy/backup.sh" /usr/local/bin/flatmates-backup
  install -m 755 "$APP_DIR/deploy/restore.sh" /usr/local/bin/flatmates-restore
fi

if [[ ! -f "$APP_DIR/server.js" ]]; then
  echo "bootstrap: no server.js in $APP_DIR (upload src.tgz or a standalone release)" >&2
  exit 1
fi

chown -R ubuntu:ubuntu "$APP_DIR" "$DATA_DIR"

systemctl daemon-reload
systemctl enable --now flatmates
nginx -t
systemctl reload nginx

CRON_SECRET=""
if [[ -f /etc/flatmates.env ]]; then
  # shellcheck disable=SC1091
  set -a
  source /etc/flatmates.env
  set +a
fi

cat >/etc/cron.d/flatmates <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
* * * * * root /usr/local/bin/flatmates-healthcheck
0 3 * * * root curl -fsS -H "Authorization: Bearer ${CRON_SECRET}" http://127.0.0.1:3000/api/cron >/dev/null
0 4 * * * root /usr/local/bin/flatmates-backup
EOF
chmod 644 /etc/cron.d/flatmates

if [[ "${ENABLE_TLS:-1}" == "1" ]]; then
  certbot --nginx -d www.flatmates.co.in -d flatmates.co.in --non-interactive --agree-tos -m "$EMAIL" --redirect || true
fi

systemctl restart flatmates
echo "bootstrap ok"
