# Documentation des Endpoints Admin - ZePrompt API

## Table des matières
- [Authentification requise](#authentification-requise)
- [Endpoints de gestion des utilisateurs](#endpoints-de-gestion-des-utilisateurs)
- [Endpoints de gestion des prompts](#endpoints-de-gestion-des-prompts)
- [Endpoints de gestion des tags](#endpoints-de-gestion-des-tags)

---

## Authentification requise

Tous les endpoints admin nécessitent :
- **Authentification** : JWT token dans le header `Authorization`
- **Rôle** : L'utilisateur doit avoir le rôle `admin`

**Format du header :**
```
Authorization: Bearer <token>
```

---

## Endpoints de gestion des utilisateurs

### 1. Désactiver un utilisateur

**PUT** `/api/auth/users/:userId/disabled`

**Description** : Désactive un utilisateur (met `active` à `false`)

**Headers requis :**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Paramètres d'URL :**
- `userId` (string, UUID, requis) - ID de l'utilisateur à désactiver

**Exemple de requête :**
```bash
PUT /api/auth/users/123e4567-e89b-12d3-a456-426614174000/disabled
Authorization: Bearer <token>
```

**Réponse en cas de succès (200) :**
```json
{
  "success": true,
  "message": "Utilisateur désactivé avec succès",
  "statusCode": 200
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `403` : Accès refusé (droits administrateur requis)
- `404` : Utilisateur introuvable

---

### 2. Réactiver un utilisateur

**PUT** `/api/auth/users/:userId/enable`

**Description** : Réactive un utilisateur (met `active` à `true`)

**Headers requis :**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Paramètres d'URL :**
- `userId` (string, UUID, requis) - ID de l'utilisateur à réactiver

**Exemple de requête :**
```bash
PUT /api/auth/users/123e4567-e89b-12d3-a456-426614174000/enable
Authorization: Bearer <token>
```

**Réponse en cas de succès (200) :**
```json
{
  "success": true,
  "message": "Utilisateur activé avec succès",
  "statusCode": 200
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `403` : Accès refusé (droits administrateur requis)
- `404` : Utilisateur introuvable

---

### 3. Supprimer un utilisateur (soft delete)

**DELETE** `/api/auth/users/:userId/soft-delete`

**Description** : Supprime un utilisateur de manière soft (marque comme supprimé, ne supprime pas réellement de la base de données)

**Headers requis :**
```
Authorization: Bearer <token>
```

**Paramètres d'URL :**
- `userId` (string, UUID, requis) - ID de l'utilisateur à supprimer

**Exemple de requête :**
```bash
DELETE /api/auth/users/123e4567-e89b-12d3-a456-426614174000/soft-delete
Authorization: Bearer <token>
```

**Réponse en cas de succès (200) :**
```json
{
  "success": true,
  "message": "Utilisateur supprimé avec succès",
  "statusCode": 200
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `403` : Accès refusé (droits administrateur requis)
- `404` : Utilisateur introuvable

---

### 4. Restaurer un utilisateur supprimé

**PUT** `/api/auth/users/:userId/restore`

**Description** : Restaure un utilisateur qui a été supprimé (soft delete)

**Headers requis :**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Paramètres d'URL :**
- `userId` (string, UUID, requis) - ID de l'utilisateur à restaurer

**Exemple de requête :**
```bash
PUT /api/auth/users/123e4567-e89b-12d3-a456-426614174000/restore
Authorization: Bearer <token>
```

**Réponse en cas de succès (200) :**
```json
{
  "success": true,
  "message": "Utilisateur restauré avec succès",
  "statusCode": 200
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `403` : Accès refusé (droits administrateur requis)
- `404` : Utilisateur introuvable

---

## Endpoints de gestion des prompts

### 5. Récupérer tous les prompts (Admin)

**GET** `/api/prompts/admin`

**Description** : Récupère tous les prompts, quel que soit leur statut (activé, désactivé, etc.). Seuls les admins peuvent voir tous les prompts.

**Headers requis :**
```
Authorization: Bearer <token>
```

**Paramètres de requête (query) :**
- `page` (integer, optionnel, défaut: 1) - Numéro de page pour la pagination
- `limit` (integer, optionnel, défaut: 20) - Nombre d'éléments par page

**Exemple de requête :**
```bash
GET /api/prompts/admin?page=1&limit=20
Authorization: Bearer <token>
```

**Réponse en cas de succès (200) :**
```json
{
  "success": true,
  "message": "Prompts récupérés avec succès",
  "statusCode": 200,
  "data": {
    "prompts": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Titre du prompt",
        "content": "Contenu du prompt",
        "contentType": "text",
        "isPublic": true,
        "status": "activé",
        "views": 100,
        "userId": "user-id-here",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageCount": 3
  }
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `403` : Accès refusé (droits administrateur requis)

---

### 6. Vider le cache des prompts

**DELETE** `/api/prompts/admin/cache`

**Description** : Vide le cache Redis des prompts. Utile pour forcer un rafraîchissement des données.

**Headers requis :**
```
Authorization: Bearer <token>
```

**Exemple de requête :**
```bash
DELETE /api/prompts/admin/cache
Authorization: Bearer <token>
```

**Réponse en cas de succès (200) :**
```json
{
  "success": true,
  "message": "Cache des prompts vidé avec succès. 15 clé(s) supprimée(s).",
  "statusCode": 200,
  "data": {
    "deletedKeys": 15
  },
  "code": "CACHE_CLEARED"
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `403` : Accès refusé (droits administrateur requis)

---

## Endpoints de gestion des tags

### 7. Créer un tag

**POST** `/api/tags`

**Description** : Crée un nouveau tag. Seuls les admins peuvent créer des tags.

**Headers requis :**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body requis :**
```json
{
  "name": "Nom du tag"
}
```

**Paramètres du body :**
- `name` (string, requis) - Nom du tag à créer

**Exemple de requête :**
```bash
POST /api/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "JavaScript"
}
```

**Réponse en cas de succès (201) :**
```json
{
  "success": true,
  "message": "Catégorie créé avec succès.",
  "statusCode": 201,
  "data": {
    "tag": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "JavaScript",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  },
  "code": "TAG_CREATED"
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `403` : Accès refusé (droits administrateur requis)
- `409` : Tag déjà existant
- `400` : Validation échouée

---

### 8. Mettre à jour un tag

**PUT** `/api/tags/:id`

**Description** : Met à jour un tag existant. Seuls les admins peuvent modifier des tags.

**Headers requis :**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Paramètres d'URL :**
- `id` (string, UUID, requis) - ID du tag à modifier

**Body requis :**
```json
{
  "name": "Nouveau nom du tag"
}
```

**Paramètres du body :**
- `name` (string, requis) - Nouveau nom du tag

**Exemple de requête :**
```bash
PUT /api/tags/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "JavaScript ES6"
}
```

**Réponse en cas de succès (200) :**
```json
{
  "success": true,
  "message": "Catégorie mis à jour avec succès.",
  "statusCode": 200,
  "data": {
    "tag": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "JavaScript ES6",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  },
  "code": "TAG_UPDATED"
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `403` : Accès refusé (droits administrateur requis)
- `404` : Tag introuvable
- `400` : Validation échouée

---

### 9. Supprimer un tag

**DELETE** `/api/tags/:id`

**Description** : Supprime un tag. Seuls les admins peuvent supprimer des tags.

**Headers requis :**
```
Authorization: Bearer <token>
```

**Paramètres d'URL :**
- `id` (string, UUID, requis) - ID du tag à supprimer

**Exemple de requête :**
```bash
DELETE /api/tags/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

**Réponse en cas de succès (200) :**
```json
{
  "success": true,
  "message": "Catégorie supprimé avec succès.",
  "statusCode": 200,
  "data": {
    "tag": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "JavaScript",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  },
  "code": "TAG_DELETED"
}
```

**Erreurs possibles :**
- `401` : Non authentifié
- `403` : Accès refusé (droits administrateur requis)
- `404` : Tag introuvable

---

## Récapitulatif des endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| PUT | `/api/auth/users/:userId/disabled` | Désactiver un utilisateur |
| PUT | `/api/auth/users/:userId/enable` | Réactiver un utilisateur |
| DELETE | `/api/auth/users/:userId/soft-delete` | Supprimer un utilisateur (soft delete) |
| PUT | `/api/auth/users/:userId/restore` | Restaurer un utilisateur |
| GET | `/api/prompts/admin` | Récupérer tous les prompts |
| DELETE | `/api/prompts/admin/cache` | Vider le cache des prompts |
| POST | `/api/tags` | Créer un tag |
| PUT | `/api/tags/:id` | Mettre à jour un tag |
| DELETE | `/api/tags/:id` | Supprimer un tag |

---

## Notes importantes

1. **Base URL** : Tous les endpoints sont préfixés par `/api`
2. **Authentification** : Tous les endpoints admin nécessitent un token JWT valide dans le header `Authorization: Bearer <token>`
3. **Rôle admin** : L'utilisateur authentifié doit avoir le rôle `admin` dans la base de données
4. **Codes de réponse** : 
   - `200` : Succès
   - `201` : Créé avec succès
   - `400` : Requête invalide
   - `401` : Non authentifié
   - `403` : Accès refusé (pas admin)
   - `404` : Ressource introuvable
   - `409` : Conflit (ex: tag déjà existant)
   - `500` : Erreur serveur

