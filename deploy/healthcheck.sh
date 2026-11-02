#!/bin/bash
set -euo pipefail
if ! curl -fsS --max-time 8 http://127.0.0.1:3000/ >/dev/null; then
  logger -t flatmates-health "localhost:3000 failed; restarting flatmates"
  systemctl restart flatmates
fi
