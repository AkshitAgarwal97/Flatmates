#!/bin/bash
set -euo pipefail
if [[ -f /etc/flatmates.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source /etc/flatmates.env
  set +a
fi

DATA_DIR="${FLATMATES_DATA_DIR:-/var/lib/flatmates}"
NS="${OCI_NAMESPACE:-}"
BUCKET="${OCI_BACKUP_BUCKET:-flatmates-backups}"
STAMP="$(date -u +%Y-%m-%dT%H%M%SZ)"
TMP="/tmp/flatmates-data-${STAMP}.tgz"

if [[ ! -d "$DATA_DIR" ]]; then
  logger -t flatmates-backup "data dir missing: $DATA_DIR"
  exit 1
fi

tar -czf "$TMP" -C "$DATA_DIR" .
if [[ -n "$NS" ]] && command -v oci >/dev/null 2>&1; then
  oci os object put --auth instance_principal -ns "$NS" -bn "$BUCKET" --name "data/${STAMP}.tgz" --file "$TMP" --force >/dev/null
  oci os object put --auth instance_principal -ns "$NS" -bn "$BUCKET" --name "data/latest.tgz" --file "$TMP" --force >/dev/null
  logger -t flatmates-backup "uploaded $STAMP"
else
  mkdir -p /var/backups/flatmates
  cp "$TMP" "/var/backups/flatmates/${STAMP}.tgz"
  cp "$TMP" /var/backups/flatmates/latest.tgz
  ls -1t /var/backups/flatmates/*.tgz | tail -n +8 | xargs -r rm -f
  logger -t flatmates-backup "local snapshot $STAMP (oci cli/namespace not configured)"
fi
rm -f "$TMP"
