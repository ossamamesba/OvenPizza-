#!/usr/bin/env bash
# Crée mobile/.env.local avec l'adresse IP Wi-Fi du PC Windows (lancé depuis WSL).
# Usage : bash scripts/setup-env.sh            → détection automatique
#         bash scripts/setup-env.sh 192.168.1.20 → adresse donnée à la main
set -euo pipefail
cd "$(dirname "$0")/.."

IP="${1:-}"
if [ -z "$IP" ] && command -v powershell.exe >/dev/null 2>&1; then
  # Adresse IPv4 de la carte réseau qui sert de route par défaut (Wi-Fi ou Ethernet) côté Windows
  IP=$(powershell.exe -NoProfile -Command \
    "(Get-NetIPConfiguration | Where-Object { \$_.IPv4DefaultGateway -ne \$null -and \$_.NetAdapter.Status -eq 'Up' } | Select-Object -First 1).IPv4Address.IPAddress" \
    2>/dev/null | tr -d '\r\n ')
fi

if [ -z "$IP" ]; then
  echo "Adresse IP introuvable automatiquement."
  echo "Sous Windows, tapez « ipconfig » et relancez : bash scripts/setup-env.sh VOTRE_IPV4"
  exit 1
fi

PORT="${API_PORT:-8090}"
echo "EXPO_PUBLIC_API_URL=http://$IP:$PORT" > .env.local
echo "OK : mobile/.env.local → EXPO_PUBLIC_API_URL=http://$IP:$PORT"
echo "Vérification depuis WSL : $(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://$IP:$PORT/api/packs" || true) (200 = l'API répond sur cette adresse)"
