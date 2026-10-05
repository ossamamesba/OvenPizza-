#!/usr/bin/env bash
# Crée mobile/.env.local avec l'adresse IP Wi-Fi du PC Windows (lancé depuis WSL) :
#  - EXPO_PUBLIC_API_URL : l'API Symfony vue depuis le téléphone ;
#  - REACT_NATIVE_PACKAGER_HOSTNAME : l'adresse mise dans le QR code d'Expo (sinon celle, injoignable, de WSL).
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
printf 'EXPO_PUBLIC_API_URL=http://%s:%s\nREACT_NATIVE_PACKAGER_HOSTNAME=%s\n' "$IP" "$PORT" "$IP" > .env.local
echo "OK : mobile/.env.local → API http://$IP:$PORT, QR code exp://$IP:8081"
echo "Vérification depuis WSL : $(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://$IP:$PORT/api/packs" || true) (200 = l'API répond sur cette adresse)"

# Expo tourne dans WSL : Windows doit faire suivre le port 8081 vers WSL (l'adresse de WSL change au redémarrage).
WSL_IP=$(hostname -I | awk '{print $1}')
echo
echo "À coller dans PowerShell (administrateur), après chaque redémarrage du PC :"
echo "  netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=$WSL_IP"
