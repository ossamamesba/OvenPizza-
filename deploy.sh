#!/usr/bin/env bash
# Mise en ligne ou mise à jour du serveur (voir DEPLOY.md) :
#   git pull && ./deploy.sh
# Sans danger si relancé : ne supprime ni les réservations, ni les photos, ni le compte du patron.
set -euo pipefail
cd "$(dirname "$0")"

COMPOSE="docker compose -f docker-compose.prod.yml"
step() { printf '\n\033[1;32m▶ %s\033[0m\n' "$1"; }

if [ ! -f .env ]; then
  echo "Fichier .env absent : cp .env.prod.example .env, puis remplissez les adresses (voir DEPLOY.md)."
  exit 1
fi

step "Secrets"
for var in APP_SECRET JWT_PASSPHRASE MYSQL_PASSWORD MYSQL_ROOT_PASSWORD; do
  if grep -qE "^${var}=\s*$" .env; then
    sed -i "s|^${var}=.*|${var}=$(openssl rand -hex 24)|" .env
    echo "${var} généré dans .env (à garder secret)"
  fi
done
chmod 600 .env

step "Compilation du site et du dashboard"
for app in frontend admin; do
  docker run --rm -u "$(id -u):$(id -g)" -e npm_config_cache=/tmp/.npm \
    -v "$PWD":/repo -w "/repo/$app" node:22-slim sh -c "npm ci --no-audit --no-fund && npm run build"
done

step "Base de données et PHP"
$COMPOSE up -d --build database php
$COMPOSE exec -T php composer install --no-dev --optimize-autoloader --classmap-authoritative --no-interaction
$COMPOSE exec -T php php bin/console lexik:jwt:generate-keypair --skip-if-exists
$COMPOSE exec -T php php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration
$COMPOSE exec -T php php bin/console app:catalog:init
$COMPOSE exec -T php php bin/console cache:clear

step "Mise en ligne (HTTPS)"
$COMPOSE up -d --remove-orphans
$COMPOSE restart php

env_get() { grep -E "^$1=" .env | tail -1 | cut -d= -f2-; }
step "Terminé"
echo "  Site      : https://$(env_get SITE_DOMAIN)"
echo "  Dashboard : https://$(env_get ADMIN_DOMAIN)"
echo "  API       : https://$(env_get API_DOMAIN)/api/packs"
echo "Premier déploiement : créez le compte du patron avec"
echo "  $COMPOSE exec php php bin/console app:create-admin EMAIL"
