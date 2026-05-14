# XForwardTelegram 🤖

Un bot Telegram simple, rapide et autonome qui télécharge les vidéos depuis X (anciennement Twitter) et vous les envoie directement dans l'application. Parfait pour sauvegarder ou partager des vidéos sans avoir à quitter Telegram.

## ✨ Fonctionnalités

- **Téléchargement automatique** : Envoyez simplement un lien `x.com` ou `twitter.com`, le bot s'occupe du reste.
- **Optimisation de la qualité** : Télécharge la meilleure qualité disponible tout en bridant la résolution au 720p pour éviter les fichiers inutilement immenses.
- **Contournement de la limite Telegram (50 Mo)** : Si une vidéo dépasse la limite imposée par l'API publique de Telegram, le bot la découpe intelligemment en plusieurs morceaux (via FFmpeg) et les envoie à la suite, sans aucune perte de données.
- **Auto-nettoyage** : Supprime automatiquement les fichiers temporaires sur votre serveur/machine une fois les vidéos téléversées sur Telegram.

## 🛠️ Prérequis

Avant de lancer ce bot, vous devez de disposer de :

1. **[Node.js](https://nodejs.org/)** (v16 ou supérieur recommandé).
2. **FFmpeg** installé sur votre machine (indispensable pour le découpage des longues vidéos).
   * *Sous Debian/Ubuntu :* `sudo apt-get install ffmpeg`
   * *Sous macOS :* `brew install ffmpeg`
   * *Sous Windows :* [Télécharger FFmpeg](https://ffmpeg.org/download.html)
3. Un **Bot Token Telegram**. Créez un bot via [@BotFather](https://t.me/botfather) sur Telegram pour obtenir ce token.
4. **Un fichier de cookies Twitter (`cookies.txt`)** : `yt-dlp` a souvent besoin de cookies valides pour contourner les restrictions et lire les tweets. Extrayez vos cookies Twitter au format Netscape (avec une extension de navigateur comme *Get cookies.txt LOCALLY*) et placez le fichier à la racine de ce dossier.

## 🚀 Installation

1. **Clonez ce dépôt** ou téléchargez le code source.
2. **Installez les dépendances** :
   ```bash
   npm install
   ```
3. **Configurez votre environnement** :
   Créez un fichier `.env` à la racine de votre projet et ajoutez-y votre Token de Bot :
   ```dotenv
   TOKEN=VOTRE_TOKEN_ICI
   ```
   *(Pensez à ajouter `.env` et `cookies.txt` à votre fichier `.gitignore` afin de garder vos données secrètes si vous hébergez le code publiquement).*

## 🎮 Lancement

Démarrez simplement le bot avec la commande :

```bash
node index.js
```

Le terminal affichera : `🤖 Le bot est démarré et prêt à télécharger...`

Allez ensuite discuter avec votre bot sur Telegram et envoyez-lui un lien Twitter pour tester !

## 📦 Dépendances Principales

- `node-telegram-bot-api` : Interaction avec l'API Telegram.
- `youtube-dl-exec` (et `yt-dlp`) : Le coeur du téléchargement des vidéos.

## 📝 Licence

Ce projet est libre de droits. N'hésitez pas à l'adapter et à l'améliorer pour répondre à vos propres besoins !
