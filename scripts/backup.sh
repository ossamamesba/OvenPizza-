#!/usr/bin/env bash
# Sauvegarde quotidienne (serveur) : base de données + photos des pizzas, gardées 14 jours.
# Cron (crontab -e) : 30 3 * * * /home/USER/OvenPizza-/scripts/backup.sh >> /home/USER/backups/backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."

DEST="${BACKUP_DIR:-$HOME/backups}"
STAMP=$(date +%Y-%m-%d_%H%M)
mkdir -p "$DEST"

docker compose -f docker-compose.prod.yml exec -T database \
  sh -c 'exec mysqldump --single-transaction --no-tablespaces -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  | gzip > "$DEST/db_$STAMP.sql.gz"
tar -czf "$DEST/uploads_$STAMP.tar.gz" -C backend/public uploads 2>/dev/null || true

find "$DEST" -name 'db_*.sql.gz' -mtime +14 -delete
find "$DEST" -name 'uploads_*.tar.gz' -mtime +14 -delete
echo "$(date '+%F %T') sauvegarde OK : $DEST/db_$STAMP.sql.gz"
