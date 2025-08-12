# Documentation Technique – ZePrompt API (Version actuelle)

## Table des matières
- [1. Présentation générale](#présentation-générale)
- [2. Gestion des utilisateurs](#gestion-des-utilisateurs)
  - [2.1 Repository](#21-repository)
  - [2.2 Service](#22-service)
  - [2.3 Contrôleur](#23-contrôleur)
- [3. Sécurité des mots de passe](#sécurité-des-mots-de-passe)
- [4. Gestion des emails](#gestion-des-emails)
  - [4.1 Utilitaire d'envoi d'email](#41-utilitaire-denvoi-demail)
  - [4.2 Vérification d'email](#42-vérification-demail)
- [5. Standardisation des réponses HTTP](#standardisation-des-réponses-http)
- [6. Architecture et bonnes pratiques](#architecture-et-bonnes-pratiques)
- [7. Historique des améliorations](#historique-des-améliorations)

---

## 1. Présentation générale

Cette version de l’API ZePrompt propose une architecture modulaire, robuste et professionnelle pour la gestion des utilisateurs, la sécurité, la vérification d’email, et la standardisation des réponses HTTP.  
Chaque module est documenté et suit les bonnes pratiques Node.js pour garantir maintenabilité, évolutivité et sécurité.

---

## 2. Gestion des utilisateurs

### 2.1 Repository

**Fichier** : `/modules/users/user.repository.js`

- Fournit toutes les opérations CRUD sur les utilisateurs via Sequelize.
- Méthodes principales :
  - `findAll` : Récupère tous les utilisateurs.
  - `findById` : Recherche par identifiant.
  - `findByEmail` : Recherche par email.
  - `create` : Création d’un utilisateur.
  - `update` : Mise à jour d’un utilisateur.
  - `delete` : Suppression d’un utilisateur.
- Gestion des erreurs recommandée via try/catch.
- Documentation JSDoc pour chaque méthode.

---

### 2.2 Service

**Fichier** : `/modules/users/user.service.js`

- Sert d’interface métier entre le contrôleur et le repository.
- Méthodes principales :
  - `getAllUser`
  - `getUserById`
  - `getUserByEmail`
  - `createUser`
  - `updateUser`
  - `deleteUser`
- Peut intégrer des validations métier supplémentaires.
- Documentation JSDoc présente.

---

### 2.3 Contrôleur

**Fichier** : `/modules/users/user.controller.js`

- Gère les requêtes HTTP liées aux utilisateurs.
- Utilise l’utilitaire `httpResponse` pour uniformiser les réponses de succès et d’erreur.
- Méthodes principales :
  - `getAll`
  - `getById`
  - `create`
  - `update`
  - `delete`
- Gestion centralisée des erreurs et des succès.
- Commentaires professionnels pour chaque méthode.

---

## 3. Sécurité des mots de passe

**Fichier** : `/utils/passwordUtils.js`

- Utilise `bcrypt` pour le hashage et la comparaison des mots de passe.
- Fonctions :
  - `hashPassword` : Hash un mot de passe.
  - `comparePassword` : Compare un mot de passe en clair avec un hash.
- Commentaires simples et explicites.

---

## 4. Gestion des emails

### 4.1 Utilitaire d'envoi d'email

**Fichier** : `/utils/emailUtils.js`

- Permet l’envoi d’emails via l’API Mailzeet.
- Fonctionnalités :
  - Gestion du mode test (affichage console sans envoi réel).
  - Vérification de la configuration Mailzeet.
  - Envoi d’email avec gestion des erreurs et logs.
  - Support des templates, cc, bcc, etc.
- Commentaires détaillés pour chaque méthode.

---

### 4.2 Vérification d'email

**Fichier** : `/services/emailVerificationService.js`

- Gère la vérification d’email utilisateur.
- Fonctionnalités :
  - Génération de token sécurisé (crypto).
  - Stockage du token dans Redis avec expiration automatique (1h).
  - Génération de l’URL de vérification.
  - Génération du contenu HTML de l’email (template).
  - Mise en queue de l’envoi d’email via Bull/Redis (`emailQueue`), avec gestion des tentatives et backoff exponentiel.
  - Vérification du token reçu et validation de l’email utilisateur.
  - Renvoi d’email de vérification si besoin.
- Gestion des erreurs et retours structurés.
- Commentaires professionnels détaillés.

---

## 5. Standardisation des réponses HTTP

**Fichier** : `/utils/httpResponse.js`

- Classe utilitaire pour uniformiser toutes les réponses HTTP de l’API.
- Méthodes statiques :
  - `sendSuccess` : Réponse de succès standardisée (message + data).
  - `sendError` : Réponse d’erreur standardisée (message + log serveur).
- Utilisé dans tous les contrôleurs pour garantir des réponses cohérentes.
- JSDoc détaillé pour chaque méthode.

---

## 6. Architecture et bonnes pratiques

- **Modularité** : Séparation claire entre repository, service, contrôleur et utilitaires.
- **Centralisation** : Gestion centralisée des réponses HTTP et des emails.
- **Sécurité** :
  - Hashage des mots de passe.
  - Stockage temporaire des tokens de vérification.
  - Pas de fuite d’informations sensibles dans les réponses.
- **Scalabilité** :
  - Utilisation de files d’attente (queues) pour l’envoi d’emails.
  - Gestion des tentatives et backoff pour la résilience.
- **Commentaires** : Tous les fichiers sont commentés (JSDoc ou simples) pour faciliter la maintenance.
- **DRY** : Factorisation des comportements récurrents (réponses, gestion d’erreur, etc).

---

## 7. Historique des améliororations

- Ajout de commentaires professionnels dans tous les fichiers.
- Centralisation des réponses HTTP (succès/erreur) via `httpResponse.js`.
- Factorisation de la gestion des emails et de la vérification d’email.
- Mise en place de la queue pour l’envoi d’email de vérification.
- Conseils sur la robustesse, la sécurité et la scalabilité.
- Documentation de chaque module et utilitaire.

---

## Exemples d’utilisation

### Création d’un utilisateur
```javascript
const user = await userService.createUser({ username: "test", email: "test@ex.com", password: "..." });
```

### Envoi d’un email de vérification
```javascript
await EmailVerificationService.sendVerificationEmail(user);
```

### Vérification d’un token reçu
```javascript
await EmailVerificationService.verifyEmailToken(token, user.email);
```

### Réponse HTTP standardisée dans un contrôleur
```javascript
HttpResponse.sendSuccess(res, 200, "user", "created", user);
```

---

## Sécurité et confidentialité

- Seules les données publiques sont exposées dans les endpoints utilisateurs.
- Les tokens de vérification sont temporaires et sécurisés.
- Les logs d’erreur sont détaillés côté serveur mais sobres côté client.

---

**Cette version de l’API ZePrompt est prête pour une utilisation professionnelle, évolutive et maintenable.**