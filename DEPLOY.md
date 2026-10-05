# Mise en ligne — Oven's Pizza Party

Un seul serveur (VPS) fait tourner tout le projet avec Docker :

| Adresse | Contenu |
|---|---|
| `https://ovenspizzaparty.ma` | Site des clients (installable sur téléphone) |
| `https://admin.ovenspizzaparty.ma` | Dashboard du patron |
| `https://api.ovenspizzaparty.ma` | API pour l'app mobile du patron |

Le HTTPS est automatique et gratuit (Caddy + Let's Encrypt). Les adresses sont des exemples : elles se règlent dans `.env`.

## 1. Acheter (une fois)

- **Serveur VPS** : Ubuntu 24.04, 2 Go de RAM minimum (ex. Hetzner CX22, OVH VPS, Contabo ; ~5 €/mois).
- **Nom de domaine** : un `.com` s'achète en quelques minutes (Namecheap, OVH…). Un `.ma` peut demander
  plusieurs jours et des justificatifs : à anticiper si c'est le choix du client.

## 2. DNS (chez le vendeur du domaine)

Créer 4 enregistrements **A** vers l'adresse IP du serveur :

| Nom | Type | Valeur |
|---|---|---|
| `@` | A | IP du serveur |
| `www` | A | IP du serveur |
| `admin` | A | IP du serveur |
| `api` | A | IP du serveur |

La propagation prend de quelques minutes à quelques heures (`ping admin.ovenspizzaparty.ma` doit répondre avec l'IP).

## 3. Préparer le serveur (une fois)

```bash
ssh root@IP_DU_SERVEUR
adduser ovens && usermod -aG sudo ovens          # utilisateur dédié
curl -fsSL https://get.docker.com | sh && usermod -aG docker ovens
ufw allow OpenSSH && ufw allow 80 && ufw allow 443/tcp && ufw allow 443/udp && ufw --force enable
su - ovens
git clone -b claude/install-ui-ux-pro-max-skill-cathec https://github.com/ossamamesba/OvenPizza-.git
cd OvenPizza-
cp .env.prod.example .env
nano .env                                         # domaines + email ; laisser les mots de passe vides
```

Dépôt privé : GitHub demande un identifiant et un **jeton** (Settings → Developer settings → Personal access tokens)
à la place du mot de passe.

## 4. Mettre en ligne

```bash
./deploy.sh
docker compose -f docker-compose.prod.yml exec php php bin/console app:create-admin EMAIL_DU_PATRON
```

`deploy.sh` génère les mots de passe et secrets vides dans `.env`, compile le site et le dashboard,
installe Symfony en mode production, applique les migrations, installe le catalogue de départ
(2 packs, 8 pizzas avec photos) puis démarre le HTTPS.

Vérifier : le site, le dashboard (connexion du patron) et `https://api.…/api/packs`.

## 5. Sauvegardes automatiques (une fois)

```bash
mkdir -p ~/backups && crontab -e
# ajouter la ligne :
30 3 * * * /home/ovens/OvenPizza-/scripts/backup.sh >> /home/ovens/backups/backup.log 2>&1
```

Chaque nuit : base de données + photos dans `~/backups`, gardées 14 jours.
Copier de temps en temps ce dossier hors du serveur (ex. `scp -r ovens@IP:backups .`).

## 6. App mobile du patron (APK de production)

Depuis le PC (WSL), dans `mobile/` :

```bash
eas env:create --environment production --name EXPO_PUBLIC_API_URL --value https://api.ovenspizzaparty.ma --visibility plaintext --non-interactive
eas build --profile production --platform android
```

Envoyer au patron le lien de l'APK affiché à la fin (à ouvrir sur son téléphone → Installer).
L'app se connecte directement au serveur : plus besoin du PC ni d'Expo Go.
Notifications : la clé FCM V1 doit être ajoutée sur expo.dev (Credentials → `ma.ovenspizza.patron`).

## Mises à jour

```bash
cd ~/OvenPizza- && git pull && ./deploy.sh
```

Les réservations, photos, comptes et mots de passe sont conservés.

## En cas de problème

```bash
docker compose -f docker-compose.prod.yml ps            # tout doit être « Up »
docker compose -f docker-compose.prod.yml logs caddy    # certificats HTTPS (DNS pas encore prêt ?)
docker compose -f docker-compose.prod.yml logs php      # erreurs Symfony
```

Restaurer une sauvegarde de la base :

```bash
gunzip -c ~/backups/db_AAAA-MM-JJ_HHMM.sql.gz | docker compose -f docker-compose.prod.yml exec -T database \
  sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
```
