# Documentation API Authentification – ZePrompt

## Table des matières
- [1. Présentation](#présentation)
- [2. Endpoints](#endpoints)
  - [2.1 Inscription (Register)](#21-inscription-register)
  - [2.2 Connexion (Login)](#22-connexion-login)
  - [2.3 Vérification d'email](#23-vérification-demail)
  - [2.4 Renvoi de l'email de vérification](#24-renvoi-de-lemail-de-vérification)
- [3. Gestion des tokens JWT](#gestion-des-tokens-jwt)
- [4. Exemples d'utilisation](#exemples-dutilisation)
- [5. Codes d'erreur](#codes-derreur)
- [6. Sécurité et bonnes pratiques](#sécurité-et-bonnes-pratiques)

---

## 1. Présentation

Ce module gère l’authentification des utilisateurs sur ZePrompt : inscription, connexion, vérification d’email, génération et validation de tokens JWT.  
Toutes les routes sont documentées avec leurs paramètres, retours et exemples.

---

## 2. Endpoints

### 2.1 Inscription (Register)

**POST** `/api/auth/register`

- **Description** : Crée un nouvel utilisateur et envoie un email de vérification.
- **Body requis :**
  - `username` (string, requis)
  - `email` (string, requis)
  - `password` (string, requis)

**Exemple de requête :**
```json
{
  "username": "johnDoe",
  "email": "john@example.com",
  "password": "MotDePasseSecurise123"
}
```

**Réponse en cas de succès :**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "username": "johnDoe",
      "email": "john@example.com",
      "emailVerified": false
    },
    "emailResult": {
      "success": true,
      "message": "Email de vérification mis en queue pour envoi"
    }
  }
}
```

**Erreurs possibles :**
- 400 : Email déjà utilisé
- 500 : Erreur serveur

---

### 2.2 Connexion (Login)

**POST** `/api/auth/login`

- **Description** : Authentifie un utilisateur et retourne un JWT.
- **Body requis :**
  - `email` (string, requis)
  - `password` (string, requis)

**Exemple de requête :**
```json
{
  "email": "john@example.com",
  "password": "MotDePasseSecurise123"
}
```

**Réponse en cas de succès :**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "username": "johnDoe",
      "email": "john@example.com",
      "emailVerified": true
    }
  }
}
```

**Erreurs possibles :**
- 401 : Email ou mot de passe incorrect
- 403 : Email non vérifié
- 500 : Erreur serveur

---

### 2.3 Vérification d'email

**GET** `/api/auth/verify-email?token=...&email=...`

- **Description** : Vérifie l’email de l’utilisateur à l’aide du token reçu par email.
- **Query params :**
  - `token` (string, requis)
  - `email` (string, requis)

**Réponse en cas de succès :**
```json
{
  "success": true,
  "message": "Email vérifié avec succès"
}
```

**Erreurs possibles :**
- 400 : Token ou email manquant
- 401 : Token invalide ou expiré
- 404 : Utilisateur non trouvé
- 500 : Erreur serveur

---

### 2.4 Renvoi de l'email de vérification

**POST** `/api/auth/resend-verification`

- **Description** : Renvoie un email de vérification à l’utilisateur.
- **Body requis :**
  - `email` (string, requis)

**Exemple de requête :**
```json
{
  "email": "john@example.com"
}
```

**Réponse en cas de succès :**
```json
{
  "success": true,
  "message": "Email de vérification mis en queue pour envoi"
}
```

**Erreurs possibles :**
- 404 : Utilisateur non trouvé
- 400 : Email déjà vérifié
- 500 : Erreur serveur

---

## 3. Gestion des tokens JWT

- **Génération** : Un token JWT est généré à la connexion, contenant l’id, le username et le rôle de l’utilisateur.
- **Expiration** : Par défaut 1h (`JWT_EXPIRES_IN` configurable).
- **Vérification** : Utiliser la fonction `verifyToken(token)` pour valider un JWT côté backend.

---

## 4. Exemples d'utilisation

### Inscription
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'johnDoe', email: 'john@example.com', password: '...' })
});
const data = await response.json();
```

### Connexion
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john@example.com', password: '...' })
});
const data = await response.json();
localStorage.setItem('token', data.data.token);
```

### Vérification d'email
```javascript
const response = await fetch('/api/auth/verify-email?token=...&email=...');
const data = await response.json();
```

---

## 5. Codes d'erreur

- `400` : Requête invalide (paramètre manquant, email déjà utilisé, etc.)
- `401` : Non autorisé (token invalide, mauvais mot de passe)
- `403` : Action interdite (email non vérifié)
- `404` : Ressource non trouvée (utilisateur)
- `500` : Erreur serveur

---

## 6. Sécurité et bonnes pratiques

- Les mots de passe sont hashés avec bcrypt avant stockage.
- Les tokens de vérification sont temporaires et stockés dans Redis.
- Les tokens JWT sont signés et expirent automatiquement.
- Les endpoints d’authentification ne retournent jamais de données sensibles (mot de passe, etc.).
- Les emails de vérification sont mis en queue pour garantir la délivrabilité et la scalabilité.

---

**Cette documentation couvre l’ensemble du module d’authentification de ZePrompt.**