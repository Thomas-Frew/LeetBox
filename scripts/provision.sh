#!/usr/bin/env bash
set -euo pipefail

REPO="https://github.com/Thomas-Frew/LeetBox.git"
APP_DIR="/opt/leetbox"
APP_USER="leetbox"

# packages
apt-get update && apt-get upgrade -y
apt-get install -y ca-certificates curl git ufw unattended-upgrades

# swap
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# docker
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi
systemctl enable --now docker

# node
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# app user + checkout
id -u "$APP_USER" >/dev/null 2>&1 || useradd -m -s /bin/bash -G docker "$APP_USER"

if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO" "$APP_DIR"
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# .env
ENV_FILE="$APP_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  gen() { openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32; }
  DB_PASS="$(gen)"

  cat > "$ENV_FILE" <<EOF
NODE_ENV=production

DATABASE_USER=leetbox
DATABASE_PASSWORD=${DB_PASS}
DATABASE_NAME=leetbox
DATABASE_URL="postgresql://leetbox:${DB_PASS}@db:5432/leetbox"
EOF

  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "generated $ENV_FILE"
else
  echo "$ENV_FILE exists — left alone"
fi

echo
echo "provisioned. next:  sudo -u $APP_USER -i  then  cd $APP_DIR && ./scripts/deploy.sh"