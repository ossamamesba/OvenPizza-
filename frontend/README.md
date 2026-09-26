# Frontend client — Oven's Pizza Party

React 19 + TypeScript + Vite + Tailwind CSS 4, installable en PWA.

- Lancé par Docker : `docker compose up -d` → http://localhost:5173
- Hors Docker : `npm install && npm run dev` (l'API doit tourner sur http://localhost:8090)
- Vérifications : `npm run lint` et `npm run build`

## Organisation

```
src/
  api/          appels à l'API Symfony (client.ts = fetch + gestion des erreurs)
  types/api.ts  types des données de l'API (à garder alignés avec le backend)
  config/       infos du restaurant (adresse, horaires…) — PAS les prix
  hooks/        usePizzas (chargement du menu)
  components/   composants réutilisables (layout, cartes, horaires…)
  pages/        Accueil, Menu, Infos, Réservation, 404
  index.css     design tokens (couleurs, polices) — utiliser bg-primary, text-muted…
```

Règle : les pizzas et les prix viennent **toujours** de l'API (`GET /api/pizzas`).
