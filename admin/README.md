# Dashboard du patron — Oven's Pizza Party

Application web séparée du site client (React 19 + TypeScript + Vite + Tailwind CSS 4).

- Lancé par Docker : `docker compose up -d` → http://localhost:5174
- Connexion avec le compte créé par `php bin/console app:create-admin`
- Vérifications : `npm run lint` et `npm run build`

## Organisation

```
src/
  lib/api.ts        client API (jeton JWT, déconnexion auto si le jeton expire)
  api/admin.ts      toutes les routes /api/login et /api/admin/*
  auth/             connexion, session, protection des pages
  hooks/useAsync.ts chargement des données
  components/       layout (barre latérale / navigation mobile), cartes, boutons…
  pages/            Tableau de bord, Réservations, Détail, Menu, Formulaire pizza, Connexion
```

Les types, le client HTTP, le formatage et le thème viennent de `../shared` (communs avec le site et l'app mobile).
