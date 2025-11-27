# Guide de Contribution - ZePrompt API

Merci de votre intérêt pour contribuer à ZePrompt API ! Ce document fournit des directives pour contribuer au projet.

## Table des matières

- [Code de Conduite](#code-de-conduite)
- [Comment contribuer ?](#comment-contribuer-)
- [Structure du projet](#structure-du-projet)
- [Configuration de l'environnement de développement](#configuration-de-lenvironnement-de-développement)
- [Standards de code](#standards-de-code)
- [Workflow Git](#workflow-git)
- [Types de contributions](#types-de-contributions)
- [Process de revue](#process-de-revue)
- [Ressources utiles](#ressources-utiles)

---

## Code de Conduite

En participant à ce projet, vous vous engagez à respecter notre [Code de Conduite](CODE_OF_CONDUCT.md). Veuillez le lire avant de contribuer.

---

## Comment contribuer ?

### 1. Signaler un bug

Si vous trouvez un bug :

1. **Vérifiez** d'abord qu'il n'a pas déjà été signalé dans les [Issues](https://github.com/Lordkode/zeprompt-api/issues)
2. **Créez une nouvelle issue** avec le template "Bug Report"
3. **Décrivez** le problème de manière détaillée :
   - Étapes pour reproduire
   - Comportement attendu vs observé
   - Environnement (OS, Node.js version, etc.)
   - Screenshots si applicable
   - Logs d'erreur pertinents

### 2. Proposer une amélioration

Pour suggérer une nouvelle fonctionnalité :

1. **Ouvrez une issue** avec le template "Feature Request"
2. **Expliquez** le cas d'usage et la valeur ajoutée
3. **Proposez** une implémentation si vous en avez une en tête
4. **Attendez** les retours de la communauté avant de commencer le développement

### 3. Contribuer au code

Les contributions de code sont les bienvenues ! Voici comment procéder :

#### Étapes rapides

```bash
# 1. Forkez le projet sur GitHub

# 2. Clonez votre fork
git clone https://github.com/VOTRE_USERNAME/zeprompt-api.git
cd zeprompt-api

# 3. Ajoutez le repository upstream
git remote add upstream https://github.com/Lordkode/zeprompt-api.git

# 4. Créez une branche depuis dev
git checkout dev
git pull upstream dev
git checkout -b feature/ma-fonctionnalite

# 5. Faites vos modifications et commitez
git add .
git commit -m "feat: description de ma fonctionnalité"

# 6. Poussez vers votre fork
git push origin feature/ma-fonctionnalite

# 7. Ouvrez une Pull Request vers la branche dev
```

---

## Structure du projet

Voici l'organisation du code pour vous aider à vous repérer :

```
zeprompt-api/
├── index.js                  # Point d'entrée de l'application
├── config/                   # Configuration (DB, Redis, S3, etc.)
├── models/                   # Modèles Sequelize (User, Prompt, etc.)
├── migrations/               # Migrations de base de données
├── modules/                  # Modules métier (architecture modulaire)
│   ├── auth/                # Authentification JWT
│   ├── prompts/             # Gestion des prompts
│   ├── users/               # Gestion des utilisateurs
│   ├── tags/                # Gestion des tags
│   ├── comment/             # Système de commentaires
│   ├── like/                # Système de likes
│   ├── files/               # Gestion des fichiers
│   └── stats/               # Statistiques
├── middleware/              # Middlewares Express
├── services/                # Services métier (cache, storage, email)
├── utils/                   # Utilitaires (logger, JWT, etc.)
├── schemas/                 # Schémas de validation Zod
├── queues/                  # Files d'attente BullMQ
├── workers/                 # Workers pour traitement asynchrone
├── templates/               # Templates d'emails
└── scripts/                 # Scripts utilitaires
```

### Architecture modulaire

Chaque module suit cette structure :

```
module/
├── [module].controller.js   # Gestion des requêtes HTTP + docs Swagger
├── [module].service.js      # Logique métier
├── [module].repository.js   # Requêtes base de données (optionnel)
├── [module].routes.js       # Définition des routes
├── [module].errors.js       # Erreurs personnalisées
└── [module].schema.js       # Validation (dans /schemas)
```

---

## Configuration de l'environnement de développement

### Prérequis

- **Node.js** 22+ (recommandé)
- **PostgreSQL** 14+
- **Redis** 6+
- **Git**
- Un compte Cloudflare R2 (pour le stockage de fichiers) ou S3-compatible

### Installation

1. **Clonez le projet**

```bash
git clone https://github.com/Lordkode/zeprompt-api.git
cd zeprompt-api
```

2. **Installez les dépendances**

```bash
npm install
```

3. **Configurez les variables d'environnement**

Copiez `.env.example` vers `.env` et configurez :

```bash
cp .env.example .env
```

Variables importantes :
- `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGPORT` - PostgreSQL
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Redis
- `JWT_SECRET`, `JWT_EXPIRES_IN` - Authentication
- `CLOUDFLARE_*` - Cloudflare R2 (stockage)
- `MAILZEET_*` - Service d'emails
- `FRONTEND_URL` - URL du frontend (pour CORS)

4. **Créez la base de données**

```bash
# Créez la base PostgreSQL
createdb zeprompt

# Exécutez les migrations
npx sequelize-cli db:migrate

# (Optionnel) Seedez les données de test
npx sequelize-cli db:seed:all
```

5. **Lancez Redis**

```bash
# Avec Docker
docker run -d -p 6379:6379 redis:alpine

# Ou via votre gestionnaire de paquets
redis-server
```

6. **Démarrez le serveur en mode développement**

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3005`

7. **Vérifiez l'installation**

- API : http://localhost:3005/api/health
- Documentation : http://localhost:3005/api/docs

---

## Standards de code

### Style de code

Le projet utilise **ESLint** avec des règles strictes. Avant de commiter :

```bash
# Vérifiez les erreurs
npm run lint

# Corrigez automatiquement
npm run lint:fix
```

### Conventions de nommage

- **Fichiers** : camelCase ou kebab-case (`userService.js`, `auth.controller.js`)
- **Variables/Fonctions** : camelCase (`getUserById`, `isAuthenticated`)
- **Classes** : PascalCase (`User`, `AppError`)
- **Constantes** : UPPER_SNAKE_CASE (`JWT_SECRET`, `MAX_FILE_SIZE`)

### Gestion des erreurs

Utilisez la classe `AppError` pour les erreurs métier :

```javascript
const AppError = require('../utils/appError');

// Erreur métier
throw new AppError('Utilisateur non trouvé', 404);

// Erreur validation
throw new AppError('Email invalide', 400);
```

### Réponses API standardisées

Utilisez `AppResponse` pour des réponses cohérentes :

```javascript
const AppResponse = require('../utils/appResponse');

// Succès
return AppResponse.success(res, data, 'Message de succès', 200);

// Erreur (géré automatiquement par errorHandler)
```

### Documentation Swagger

Documentez vos endpoints avec des commentaires JSDoc :

```javascript
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur introuvable
 */
```

### Validation des données

Utilisez **Zod** pour valider les entrées :

```javascript
const { z } = require('zod');

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8)
});

// Dans le controller
const validated = createUserSchema.parse(req.body);
```

### Logs

Utilisez le logger Winston (pas de `console.log` !) :

```javascript
const logger = require('../utils/logger');

logger.info('Message informatif');
logger.error('Erreur détectée', { error });
logger.debug('Détails de debug', { data });
```

---

## Workflow Git

### Branches

Le projet utilise **GitFlow** avec 3 branches principales :

- **`main`** : Version stable finale (production mirror)
- **`prod`** : Version déployée en production
- **`dev`** : Branche de développement active

### Création de branches

**Toutes les branches de fonctionnalités doivent partir de `dev`** :

```bash
git checkout dev
git pull upstream dev
git checkout -b <type>/<nom-descriptif>
```

#### Types de branches

- `feature/` - Nouvelles fonctionnalités
- `fix/` - Corrections de bugs
- `refactor/` - Refactoring
- `docs/` - Documentation
- `test/` - Ajout de tests
- `chore/` - Tâches diverses (deps, config)

Exemples :
- `feature/add-prompt-export`
- `fix/auth-token-expiry`
- `refactor/prompt-service`
- `docs/api-documentation`

### Commits

Suivez la convention **Conventional Commits** :

```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

#### Types de commits

- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage (pas de changement de code)
- `refactor` : Refactoring (ni fix ni feat)
- `test` : Ajout/modification de tests
- `chore` : Tâches de maintenance
- `perf` : Amélioration de performance

#### Exemples

```bash
feat(auth): ajouter la vérification d'email
fix(prompts): corriger la pagination des résultats
docs(readme): mettre à jour les instructions d'installation
refactor(users): simplifier la logique de validation
test(auth): ajouter tests pour le refresh token
chore(deps): mettre à jour les dépendances
```

### Pull Requests

#### Avant de soumettre

- ✅ Code lint sans erreurs (`npm run lint`)
- ✅ Tests passent (si applicable)
- ✅ Documentation Swagger à jour
- ✅ Commits bien formatés
- ✅ Branche à jour avec `dev`

#### Template de PR

Lors de la création de votre PR vers `dev` :

```markdown
## Description

[Description claire de vos changements]

## Type de changement

- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Comment tester ?

[Étapes pour tester vos changements]

## Checklist

- [ ] Mon code suit le style du projet
- [ ] J'ai commenté les parties complexes
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de warnings
- [ ] J'ai ajouté des tests si nécessaire
- [ ] Les tests existants passent
```

#### Process de revue

1. **Ouvrez la PR** vers `dev` (jamais vers `main` ou `prod`)
2. **Assignez des reviewers** (mainteneurs du projet)
3. **Répondez aux commentaires** et effectuez les changements demandés
4. **Attendez l'approbation** (au moins 1 maintainer)
5. **Merge** effectué par un maintainer après validation

---

## Types de contributions

### 🐛 Corrections de bugs

1. Ouvrez une issue pour discuter du bug
2. Créez une branche `fix/nom-du-bug`
3. Corrigez le bug avec un test prouvant la correction
4. Soumettez une PR

### ✨ Nouvelles fonctionnalités

1. Ouvrez une issue "Feature Request"
2. Discutez de l'implémentation avec la communauté
3. Créez une branche `feature/nom-feature`
4. Implémentez avec tests et documentation
5. Soumettez une PR

### 📝 Documentation

Les améliorations de documentation sont toujours bienvenues :

- Corriger des typos
- Clarifier des instructions
- Ajouter des exemples
- Traduire en d'autres langues

### 🧪 Tests

Le projet a besoin de plus de tests ! Contributions bienvenues :

- Tests unitaires
- Tests d'intégration
- Tests E2E

### 🎨 Améliorations de performance

- Optimisation de requêtes DB
- Amélioration du cache
- Optimisation des workers

---

## Process de revue

### Ce que nous recherchons

- ✅ Code propre et lisible
- ✅ Conformité aux standards du projet
- ✅ Tests appropriés
- ✅ Documentation à jour
- ✅ Pas de régression
- ✅ Performance acceptable

### Délais de revue

- Les mainteneurs s'efforcent de répondre sous **48-72h**
- Les PR complexes peuvent prendre plus de temps
- N'hésitez pas à relancer après 1 semaine sans réponse

### Après le merge

Votre branche sera automatiquement supprimée après fusion. Vous pouvez :

```bash
# Nettoyer votre environnement local
git checkout dev
git pull upstream dev
git branch -d feature/ma-fonctionnalite
```

---

## Ressources utiles

### Documentation technique

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/docs/v6/)
- [BullMQ Job Queue](https://docs.bullmq.io/)
- [Zod Validation](https://zod.dev/)
- [Swagger/OpenAPI](https://swagger.io/specification/)

### Outils du projet

- **ESLint** : Linting de code
- **Husky** : Git hooks
- **Winston** : Logging
- **Multer** : Upload de fichiers
- **Sharp** : Traitement d'images
- **Socket.IO** : WebSockets

### Standards

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

### Communauté

- **Issues** : [GitHub Issues](https://github.com/Lordkode/zeprompt-api/issues)
- **Discussions** : [GitHub Discussions](https://github.com/Lordkode/zeprompt-api/discussions)
- **Email** : [contact@zeprompt.com](mailto:contact@zeprompt.com)

---

## Questions ?

Si vous avez des questions :

1. Consultez la [documentation](README.md)
2. Cherchez dans les [issues existantes](https://github.com/Lordkode/zeprompt-api/issues)
3. Ouvrez une [discussion GitHub](https://github.com/Lordkode/zeprompt-api/discussions)
4. Contactez les mainteneurs

---

**Merci pour votre contribution ! 🙏**

Chaque contribution, petite ou grande, aide à améliorer ZePrompt API pour toute la communauté.
