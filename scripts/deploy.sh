#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

git pull --ff-only
npm ci
npm run prod:build
npm run prod:up
npm run prod:migrate

npm run compose:prod -- ps
npm run compose:prod -- logs --tail=30 server