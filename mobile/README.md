# App mobile du patron — Oven's Pizza Party

Expo (SDK 57) + React Native + TypeScript. Même API que le site et le dashboard.

## Lancer l'app sur le téléphone Android (Expo Go)

**Une seule fois :**
1. Sur le téléphone : installer **Expo Go** (Play Store). Téléphone et PC sur le **même Wi-Fi**.
2. Ouvrir le pare-feu Windows à l'API et à Expo (PowerShell **administrateur**) :
   ```powershell
   New-NetFirewallRule -DisplayName "Ovens API" -Direction Inbound -LocalPort 8090 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Expo Metro" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
   ```

**À chaque fois (dans WSL) :**
```bash
cd ~/OvenPizza-
docker compose up -d          # l'API doit tourner
cd mobile
npm install                   # la première fois ou après un git pull
npm run setup                 # crée mobile/.env.local et affiche la commande netsh à copier
npm run start:lan             # affiche un QR code exp://IP-DU-PC:8081
```
Après chaque redémarrage du PC, coller dans PowerShell (**administrateur**) la commande `netsh interface portproxy …`
affichée par `npm run setup` : Expo tourne dans WSL, Windows doit lui faire suivre le port 8081.

Scanner le QR code avec **Expo Go**. L'écran de connexion indique **« Serveur joignable »** (vert) si tout va bien.

- `npm run setup` ne trouve pas l'IP : sous Windows, `ipconfig` → adresse IPv4 du Wi-Fi, puis `npm run setup -- 192.168.1.20`.
- « Failed to download remote update » : le téléphone ne joint pas Expo. Tester `http://IP-DU-PC:8081/status` dans Chrome
  sur le téléphone (doit afficher `packager-status:running`) ; sinon refaire la commande `netsh`.
- « Serveur injoignable » : Docker lancé ? même Wi-Fi ? règles de pare-feu ? bonne IP (elle peut changer d'un jour à l'autre) ?
- `npm run start:tunnel` (ngrok) évite `netsh`, mais échoue souvent.

## Notifications de nouvelles réservations

Expo Go ne reçoit plus les notifications push sur Android : il faut installer l'app elle-même
(**development build**, un fichier APK généré gratuitement par Expo). Le reste de l'app marche toujours dans Expo Go.

**Une seule fois :**
1. Créer un compte gratuit sur **expo.dev**, puis dans WSL :
   ```bash
   cd ~/OvenPizza-/mobile
   npx eas-cli login
   npx eas-cli init          # relie le projet : ajoute extra.eas.projectId dans app.json
   ```
2. Créer un projet **Firebase** (console.firebase.google.com) → *Ajouter une app Android* → nom du paquet
   `ma.ovenspizza.patron` → télécharger **`google-services.json`** et le placer dans `mobile/`.
3. Clé d'envoi Google pour Expo : Firebase → *Paramètres du projet* → *Comptes de service* → *Générer une nouvelle clé privée*
   (fichier JSON, **secret, ne pas le mettre dans Git**), puis :
   ```bash
   npx eas-cli credentials    # Android → development → Google Service Account → FCM V1 → choisir ce fichier
   ```
4. Générer l'APK (dans le cloud d'Expo, ~15 min) puis l'installer sur le téléphone avec le lien affiché :
   ```bash
   npx eas-cli build --profile development --platform android
   ```

**Ensuite, à chaque fois :** comme pour Expo Go, mais avec `npm run start:dev`, et ouvrir l'app **Oven's Patron**
installée (au lieu d'Expo Go). À la connexion, l'app demande l'autorisation d'envoyer des notifications : accepter.

Test : faire une réservation sur le site → notification « Nouvelle réservation 🍕 » sur le téléphone ;
la toucher ouvre le détail. La déconnexion depuis l'app arrête les notifications sur ce téléphone.

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
  notifications/         autorisation, enregistrement du téléphone, ouverture de la réservation touchée
  components/            éléments d'interface réutilisables
  theme/                 couleurs (shared/theme/tokens.ts), polices, espacements
```

- **S** : chaque dossier a un seul rôle (les écrans n'appellent jamais `fetch` directement).
- **O** : nouvelles fonctions ajoutées par de nouveaux modules, sans modifier les écrans (ex. `notifications/`).
- **L** : `SessionStorage` a deux implémentations interchangeables (téléphone / navigateur).
- **I** : petites interfaces (`SessionStorage` : charger / sauver / effacer).
- **D** : les écrans dépendent de hooks et de modules d'API ; le client HTTP reçoit son stockage de l'extérieur.

Les types de l'API, le client HTTP de base, le formatage (prix, dates) et les libellés viennent de `../shared`.
