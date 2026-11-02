#!/bin/bash
# Restore /var/lib/flatmates from Object Storage (latest.tgz) or a local file.
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
SRC="${1:-}"
TMP=/tmp/flatmates-restore.tgz

if [[ -z "$SRC" ]]; then
  if [[ -n "$NS" ]] && command -v oci >/dev/null 2>&1; then
    oci os object get --auth instance_principal -ns "$NS" -bn "$BUCKET" --name "data/latest.tgz" --file "$TMP"
    SRC="$TMP"
  elif [[ -f /var/backups/flatmates/latest.tgz ]]; then
    SRC=/var/backups/flatmates/latest.tgz
  else
    echo "usage: restore.sh [file.tgz]" >&2
    exit 1
  fi
fi

install -d -o ubuntu -g ubuntu "$DATA_DIR"
tar -xzf "$SRC" -C "$DATA_DIR"
chown -R ubuntu:ubuntu "$DATA_DIR"
systemctl restart flatmates
echo "restored $SRC -> $DATA_DIR"
