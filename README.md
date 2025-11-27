# ZePrompt API

<div align="center">

![Node.js](https://img.shields.io/badge/node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-5.1-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-14+-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-6+-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**API robuste et moderne pour la gestion de prompts, utilisateurs et fichiers**

[Documentation](https://github.com/Lordkode/zeprompt-api/wiki) · [Signaler un bug](https://github.com/Lordkode/zeprompt-api/issues) · [Demander une fonctionnalité](https://github.com/Lordkode/zeprompt-api/issues/new)

</div>

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Documentation API](#-documentation-api)
- [Architecture](#-architecture)
- [Contribuer](#-contribuer)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 À propos

**ZePrompt API** est une API REST complète et sécurisée conçue pour gérer des prompts, des utilisateurs et des fichiers. Elle offre un système d'authentification JWT, un traitement asynchrone de fichiers, un système de cache Redis, et bien plus encore.

### Cas d'usage

- 📝 Gestion de bibliothèques de prompts (texte et PDF)
- 👥 Système complet de gestion d'utilisateurs
- 💬 Système de commentaires et d'engagement (likes, vues)
- 📁 Upload et optimisation automatique de fichiers
- 🏷️ Système de tags et de catégorisation
- 📊 Statistiques et analytics
- 📧 Emails transactionnels (vérification, reset password)

---

## ✨ Fonctionnalités

### Gestion des Prompts
- ✅ Création de prompts **texte** ou **PDF** avec images facultatives
- ✅ **Versioning** automatique des prompts
- ✅ Statut public/privé avec gestion de visibilité
- ✅ Système de **tags** pour la catégorisation
- ✅ **Likes** et **vues** avec analytics
- ✅ **Commentaires** avec système de signalement

### Gestion des Utilisateurs
- ✅ **Authentification JWT** sécurisée (24h expiration)
- ✅ **Vérification d'email** à l'inscription
- ✅ **Reset de mot de passe** par email
- ✅ Profils utilisateurs avec **photos** et **liens sociaux**
- ✅ Rôles (user/admin) avec permissions

### Gestion des Fichiers
- ✅ **Upload de fichiers** (PDF, images)
- ✅ **Optimisation automatique** d'images avec Sharp
- ✅ Génération de **thumbnails** (800x800, 150x150)
- ✅ Stockage sur **Cloudflare R2** (S3-compatible)
- ✅ Traitement **asynchrone** via BullMQ workers

### Sécurité & Performance
- ✅ **Rate limiting** sur les endpoints sensibles
- ✅ **Helmet.js** pour les headers de sécurité
- ✅ **CORS** configuré avec whitelist
- ✅ **Validation** des données avec Zod
- ✅ **Cache Redis** pour les requêtes fréquentes
- ✅ **Logging** structuré avec Winston

### DevOps & Monitoring
- ✅ **Migrations** de base de données avec Sequelize
- ✅ **Seeders** pour les données de test
- ✅ **Health check** endpoint
- ✅ **Documentation Swagger** automatique
- ✅ **Logs rotatifs** quotidiens
- ✅ **ESLint** avec hooks Git (Husky)

---

## 🛠️ Technologies

### Backend Core
- **Node.js** 22+ - Runtime JavaScript
- **Express.js** 5.1 - Framework web minimaliste
- **JavaScript (CommonJS)** - Pas de TypeScript

### Base de données & Cache
- **PostgreSQL** 14+ - Base de données relationnelle
- **Sequelize** 6.37 - ORM avec migrations
- **Redis** 6+ - Cache et queues (IORedis)

### Traitement asynchrone
- **BullMQ** 5.56 - File d'attente de jobs
- **Workers** - Traitement d'emails et de fichiers

### Stockage & Fichiers
- **Cloudflare R2** - Stockage cloud S3-compatible
- **Multer** 2.0 - Upload de fichiers
- **Sharp** 0.34 - Optimisation d'images

### Sécurité & Validation
- **JWT (jsonwebtoken)** - Authentification
- **bcrypt** 6.0 - Hachage de mots de passe
- **Zod** 4.0 - Validation de schémas
- **Helmet** 8.1 - Headers de sécurité HTTP
- **CORS** 2.8 - Cross-Origin Resource Sharing

### DevTools & Qualité
- **ESLint** 9.33 - Linting de code
- **Husky** 9.1 - Git hooks
- **lint-staged** - Linting pré-commit
- **Nodemon** - Hot reload en dev
- **Winston** - Logging professionnel

### Documentation & API
- **Swagger/OpenAPI** 3.0 - Documentation API
- **Socket.IO** 4.8 - Communication temps réel

---

## 🚀 Installation

### Prérequis

Assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) 22+ (LTS recommandé)
- [PostgreSQL](https://www.postgresql.org/) 14+
- [Redis](https://redis.io/) 6+
- [Git](https://git-scm.com/)
- Un compte [Cloudflare R2](https://www.cloudflare.com/products/r2/) (ou S3-compatible)

### Étapes d'installation

1. **Clonez le repository**

```bash
git clone https://github.com/Lordkode/zeprompt-api.git
cd zeprompt-api
```

2. **Installez les dépendances**

```bash
npm install
```

3. **Configurez l'environnement**

Copiez le fichier d'exemple et configurez vos variables :

```bash
cp .env.example .env
```

Éditez `.env` avec vos valeurs (voir [Configuration](#-configuration))

4. **Créez la base de données**

```bash
# Créez la base PostgreSQL
createdb zeprompt

# Exécutez les migrations
npx sequelize-cli db:migrate

# (Optionnel) Insérez des données de test
npx sequelize-cli db:seed:all
```

5. **Démarrez Redis**

```bash
# Avec Docker
docker run -d -p 6379:6379 redis:alpine

# Ou via votre système
redis-server
```

6. **Lancez le serveur**

```bash
# Mode développement (avec hot reload)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur **http://localhost:3005** 🎉

---

## ⚙️ Configuration

### Variables d'environnement requises

Créez un fichier `.env` à la racine avec les variables suivantes :

#### Application
```env
NODE_ENV=development          # development | test | production
PORT=3005                     # Port du serveur
FRONTEND_URL=http://localhost:3000  # URL du frontend (CORS)
```

#### Base de données PostgreSQL
```env
PGHOST=localhost
PGDATABASE=zeprompt
PGUSER=postgres
PGPASSWORD=votre_password
PGPORT=5432
```

#### Redis
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=                # Optionnel
```

#### JWT Authentication
```env
JWT_SECRET=votre_secret_super_securise_changez_moi
JWT_EXPIRES_IN=24h
```

#### Cloudflare R2 (Stockage)
```env
CLOUDFLARE_BUCKET_NAME=zeprompt-files
CLOUDFLARE_ENDPOINT_URL=https://xxx.r2.cloudflarestorage.com
CLOUDFLARE_ACCESS_KEY_ID=votre_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=votre_secret_key
```

#### Service d'emails (Mailzeet)
```env
MAILZEET_API_KEY=votre_api_key
MAILZEET_FROM_EMAIL=noreply@zeprompt.com
MAILZEET_FROM_NAME=ZePrompt
```

📄 **Voir `.env.example`** pour toutes les variables disponibles

---

## 📖 Utilisation

### Démarrer le serveur

```bash
# Développement (avec nodemon)
npm run dev

# Production
npm start
```

### Vérifier la santé de l'API

```bash
curl http://localhost:3005/api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2025-11-27T10:00:00.000Z",
  "uptime": 123.45,
  "version": "1.0.0"
}
```

### Scripts disponibles

```bash
npm run dev              # Lancer en mode développement
npm run lint             # Vérifier le code avec ESLint
npm run lint:fix         # Corriger automatiquement les erreurs
npm run r2:check         # Vérifier la config Cloudflare R2
npm run migrate:r2       # Migrer les fichiers vers R2
```

---

## 📚 Documentation API

### Swagger UI

La documentation interactive est disponible à :

**http://localhost:3005/api/docs**

### Endpoints principaux

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/api/auth/register` | Créer un compte | - |
| `POST` | `/api/auth/login` | Se connecter | - |
| `GET` | `/api/auth/users/me` | Profil utilisateur | JWT |
| `POST` | `/api/prompts` | Créer un prompt | JWT |
| `GET` | `/api/prompts/public` | Liste des prompts publics | - |
| `GET` | `/api/prompts/:id` | Détails d'un prompt | - |
| `PUT` | `/api/prompts/:id` | Modifier un prompt | JWT |
| `DELETE` | `/api/prompts/:id` | Supprimer un prompt | JWT |
| `POST` | `/api/prompts/:id/like` | Liker un prompt | Optional |
| `POST` | `/api/prompts/:id/comments` | Commenter un prompt | JWT |
| `GET` | `/api/users` | Liste des utilisateurs | - |
| `GET` | `/api/tags` | Liste des tags | - |
| `GET` | `/api/stats` | Statistiques | - |

### Exemples d'utilisation

#### Créer un compte

```bash
curl -X POST http://localhost:3005/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

#### Se connecter

```bash
curl -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

#### Créer un prompt

```bash
curl -X POST http://localhost:3005/api/prompts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mon super prompt",
    "content": "Contenu du prompt...",
    "isPublic": true,
    "tags": ["ai", "development"]
  }'
```

### Collection Postman

Une collection Postman complète est disponible dans `postman_collection.json`

---

## 🏗️ Architecture

### Structure du projet

```
zeprompt-api/
├── index.js                  # Point d'entrée
├── config/                   # Configuration (DB, Redis, S3, Swagger)
├── models/                   # Modèles Sequelize
├── migrations/               # Migrations de base de données
├── modules/                  # Modules métier (architecture modulaire)
│   ├── auth/                # Authentification
│   ├── prompts/             # Gestion des prompts
│   ├── users/               # Gestion des utilisateurs
│   ├── tags/                # Tags
│   ├── comment/             # Commentaires
│   ├── like/                # Likes
│   ├── files/               # Fichiers
│   └── stats/               # Statistiques
├── middleware/              # Middlewares Express
├── services/                # Services métier (cache, email, storage)
├── utils/                   # Utilitaires (logger, JWT, errors)
├── schemas/                 # Validation Zod
├── queues/                  # Files d'attente BullMQ
├── workers/                 # Workers asynchrones
├── templates/               # Templates d'emails
└── scripts/                 # Scripts utilitaires
```

### Architecture modulaire

Chaque module suit le pattern **Controller → Service → Repository** :

```
module/
├── [module].controller.js   # Gestion des requêtes HTTP
├── [module].service.js      # Logique métier
├── [module].repository.js   # Accès base de données
├── [module].routes.js       # Définition des routes
└── [module].errors.js       # Erreurs personnalisées
```

### Flow de traitement

```
Client → Routes → Middleware (auth, validation) → Controller → Service → Repository → Database
                                                       ↓
                                                   Queue (async)
                                                       ↓
                                                   Worker
```

---

## 🤝 Contribuer

Nous accueillons toutes les contributions ! Que vous souhaitiez corriger un bug, ajouter une fonctionnalité ou améliorer la documentation, votre aide est précieuse.

### Guide rapide

1. **Fork** le projet
2. **Créez** une branche (`git checkout -b feature/amazing-feature`)
3. **Committez** vos changements (`git commit -m 'feat: add amazing feature'`)
4. **Poussez** vers votre branche (`git push origin feature/amazing-feature`)
5. **Ouvrez** une Pull Request vers `dev`

### Documentation complète

📖 Consultez notre [**Guide de Contribution**](CONTRIBUTING.md) pour :

- 📋 Standards de code
- 🌿 Workflow Git et branches
- ✅ Checklist avant PR
- 🧪 Comment tester
- 📝 Conventions de commits
- 🔍 Process de revue

### Code de Conduite

Veuillez lire notre [Code de Conduite](CODE_OF_CONDUCT.md) avant de contribuer.

---

## 📄 License

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

Cela signifie que vous pouvez :
- ✅ Utiliser ce projet commercialement
- ✅ Modifier le code source
- ✅ Distribuer le code
- ✅ Utiliser en privé

Sous conditions de :
- 📋 Inclure la licence et le copyright
- 📋 Indiquer les changements effectués

---

## 📞 Contact

### Équipe ZePrompt

- **Email** : contact@zeprompt.com
- **GitHub** : [@Lordkode](https://github.com/Lordkode)
- **Issues** : [Signaler un problème](https://github.com/Lordkode/zeprompt-api/issues)
- **Discussions** : [Poser une question](https://github.com/Lordkode/zeprompt-api/discussions)

### Liens utiles

- 📖 [Documentation complète](https://github.com/Lordkode/zeprompt-api/wiki)
- 🐛 [Signaler un bug](https://github.com/Lordkode/zeprompt-api/issues/new?template=bug_report.md)
- 💡 [Demander une fonctionnalité](https://github.com/Lordkode/zeprompt-api/issues/new?template=feature_request.md)
- 💬 [Discussions communautaires](https://github.com/Lordkode/zeprompt-api/discussions)

---

## 🙏 Remerciements

Merci à tous les contributeurs qui ont participé à ce projet !

- [Express.js](https://expressjs.com/) - Framework web
- [Sequelize](https://sequelize.org/) - ORM PostgreSQL
- [BullMQ](https://docs.bullmq.io/) - Job queue
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing
- La communauté open-source ❤️

---

<div align="center">

**⭐ Si vous aimez ce projet, n'oubliez pas de lui donner une étoile !**

Fait avec ❤️ par l'équipe ZePrompt

</div>
