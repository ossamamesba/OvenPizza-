# App mobile du patron — Oven's Pizza Party

Expo (SDK 57) + React Native + TypeScript. Même API que le site et le dashboard.

## Lancer l'app sur le téléphone Android

1. Sur le téléphone : installer **Expo Go** (Play Store). Téléphone et PC sur le **même Wi-Fi**.
2. Sur Windows (PowerShell) : `ipconfig` → noter l'**adresse IPv4** du Wi-Fi (ex. `192.168.1.20`).
3. Autoriser l'API dans le pare-feu Windows (PowerShell **administrateur**, une seule fois) :
   ```powershell
   New-NetFirewallRule -DisplayName "Ovens API" -Direction Inbound -LocalPort 8090 -Protocol TCP -Action Allow
   ```
4. Dans WSL :
   ```bash
   cd ~/OvenPizza-/mobile
   echo "EXPO_PUBLIC_API_URL=http://192.168.1.20:8090" > .env.local   # votre IPv4
   npm install
   npm run start:tunnel
   ```
5. Scanner le QR code affiché avec **Expo Go**.

`--tunnel` est nécessaire sous WSL : le téléphone ne voit pas directement le serveur de développement à l'intérieur de WSL.

## Vérifications

```bash
npm run typecheck
npm run lint
```

## Architecture (SOLID)

```
app/                     écrans (expo-router) : affichage uniquement
  (tabs)/                Accueil, Demandes, Packs, Pizzas, Profil
  reservation/[id]       détail d'une demande
  pizza/[id]             ajout (id = new) / modification + photo
  pack/[id]              modification d'un pack (prix…)
src/
  api/                   un module par ressource (auth, reservations, packs, pizzas)
    sessionHttpClient.ts jeton + renouvellement automatique (refresh token)
  storage/               SessionStorage (interface) + implémentations (coffre chiffré / web)
  auth/                  session du patron (AuthProvider, useAuth)
  hooks/useQuery.ts      chargement, cache, rafraîchissement au retour sur l'écran
  components/            éléments d'interface réutilisables
  theme/                 couleurs (shared/theme/tokens.ts), polices, espacements
```

- **S** : chaque dossier a un seul rôle (les écrans n'appellent jamais `fetch` directement).
- **O** : nouvelles fonctions (ex. notifications) ajoutées par de nouveaux modules, sans modifier les écrans.
- **L** : `SessionStorage` a deux implémentations interchangeables (téléphone / navigateur).
- **I** : petites interfaces (`SessionStorage` : charger / sauver / effacer).
- **D** : les écrans dépendent de hooks et de modules d'API ; le client HTTP reçoit son stockage de l'extérieur.

Les types de l'API, le client HTTP de base, le formatage (prix, dates) et les libellés viennent de `../shared`.
