# Oven's Pizza Party

Système complet du restaurant : API Symfony, site client React (PWA) et application mobile du patron.

## Structure

```
backend/   API Symfony 7.4 (PHP 8.3, Doctrine, MySQL)
docker/    Configuration des conteneurs PHP et Nginx
frontend/  Site client React + TypeScript (PWA)        — à venir
mobile/    Application du patron React Native (Expo)   — à venir
```

## Démarrage (Docker, WSL recommandé)

```bash
cp .env.example .env                              # facultatif
docker compose up -d --build
docker compose exec php composer install          # première fois uniquement
```

| Service    | URL                     |
|------------|-------------------------|
| API        | http://localhost:8080   |
| MySQL      | localhost:3307 (app/app)|
| phpMyAdmin | http://localhost:8081 (`docker compose --profile tools up -d`) |

Commandes Symfony : `docker compose exec php php bin/console <commande>`

## Première installation du backend

```bash
docker compose exec php composer install
docker compose exec php php bin/console doctrine:migrations:migrate -n
docker compose exec php php bin/console lexik:jwt:generate-keypair      # clés JWT (non versionnées)
docker compose exec php php bin/console app:create-admin patron@exemple.ma
docker compose exec php php bin/console doctrine:fixtures:load -n        # données de démo (vide la base !)
```

## API

- Public : `GET /api/pizzas`, `GET /api/pizzas/{id}`, `POST /api/reservations`
- Login : `POST /api/login` `{"email", "password"}` → `{"token", "user"}`
- Patron (en-tête `Authorization: Bearer <token>`) : `/api/admin/me`, `/api/admin/pizzas`, `/api/admin/reservations`
