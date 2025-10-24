# 🏷️ Fix: Inclusion des Tags dans les réponses API

## 🐛 Problème identifié

Les tags n'étaient pas retournés dans les réponses API lors de :
- La création d'un prompt
- La récupération de la liste des prompts publics
- La recherche de prompts
- La récupération d'un prompt par ID

## ✅ Solution implémentée

### 1. Modification de `createPrompt()`
**Fichier**: `modules/prompts/prompt.repository.js`

**Avant**:
```javascript
async createPrompt(data, options = {}) {
  return await Prompt.create(data, options);
}
```

**Après**:
```javascript
async createPrompt(data, options = {}) {
  const prompt = await Prompt.create(data, options);
  // Recharger le prompt avec ses relations (tags, user, etc.)
  await prompt.reload({
    include: [
      { model: Tag, through: { attributes: [] } },
      { model: User, as: "user", attributes: ["id", "username", "email"] },
    ],
    ...options,
  });
  return prompt;
}
```

**Bénéfice**: Le prompt retourné après création contient maintenant les tags et l'utilisateur.

---

### 2. Modification de `getAllPrompts()`
**Fichier**: `modules/prompts/prompt.repository.js`

**Ajout de l'inclusion des tags et user**:
```javascript
const { rows, count } = await Prompt.findAndCountAll({
  where: whereCondition,
  include: [
    { 
      model: Tag, 
      through: { attributes: [] },
      attributes: ["id", "name"]
    },
    { 
      model: User, 
      as: "user", 
      attributes: ["id", "username", "email"] 
    },
  ],
  offset,
  limit,
  order: [["createdAt", "DESC"]],
  distinct: true, // Important pour le comptage correct avec relations many-to-many
  ...options,
});
```

**Bénéfice**: La liste des prompts contient maintenant les tags et les informations utilisateur.

---

### 3. Modification de `searchPrompts()`
**Fichier**: `modules/prompts/prompt.repository.js`

**Ajout systématique des includes**:
```javascript
const include = [
  {
    model: User,
    as: "user",
    attributes: ["id", "username", "email"],
  },
];

if (tags.length > 0) {
  include.push({
    model: Tag,
    where: { name: tags },
    through: { attributes: [] },
    attributes: ["id", "name"],
    required: true,
  });
} else {
  include.push({
    model: Tag,
    through: { attributes: [] },
    attributes: ["id", "name"],
    required: false,
  });
}
```

**Bénéfice**: La recherche retourne toujours les tags, même si aucun filtre n'est appliqué.

---

### 4. Modification de `findPromptById()`
**Fichier**: `modules/prompts/prompt.repository.js`

**Ajout des attributs pour Tag**:
```javascript
include: [
  { model: User, as: "user", attributes: ["id", "username", "email"] },
  { model: Tag, through: { attributes: [] }, attributes: ["id", "name"] },
  { model: Like, attributes: [] },
  { model: View, attributes: [] },
],
```

**Bénéfice**: La récupération d'un prompt par ID retourne les tags avec id et name.

---

### 5. Modification de `findSimilarPrompts()`
**Fichier**: `modules/prompts/prompt.repository.js`

**Ajout des attributs et user**:
```javascript
include: [
  {
    model: Tag,
    where: { id: tagsIds },
    through: { attributes: [] },
    attributes: ["id", "name"],
    required: true,
  },
  {
    model: User,
    as: "user",
    attributes: ["id", "username", "email"],
  },
],
```

**Bénéfice**: Les prompts similaires contiennent les tags et user.

---

## 📊 Format de réponse attendu

### Création de prompt (POST /api/prompts)
```json
{
  "success": true,
  "code": "PROMPT_CREATED",
  "message": "Prompt créé avec succès.",
  "data": {
    "prompt": {
      "id": "79f96ce1-3132-458a-ac72-bf16a0f78f41",
      "title": "Mon premier prompt texte",
      "content": "Contenu de mon prompt...",
      "contentType": "text",
      "status": "activé",
      "isPublic": true,
      "views": 0,
      "userId": "fccbfe65-35b9-4d13-a88e-d386a60d0414",
      "hash": "fb7a46...",
      "createdAt": "2025-10-04T17:50:10.491Z",
      "updatedAt": "2025-10-04T17:50:10.491Z",
      "Tags": [
        {
          "id": "tag-uuid-1",
          "name": "javascript"
        },
        {
          "id": "tag-uuid-2",
          "name": "test"
        }
      ],
      "user": {
        "id": "fccbfe65-35b9-4d13-a88e-d386a60d0414",
        "username": "3d3m",
        "email": "user@example.com"
      }
    }
  }
}
```

### Liste des prompts (GET /api/prompts/public)
```json
{
  "success": true,
  "code": "PROMPTS_RETURNED",
  "message": "Prompts récupérés avec succès.",
  "data": {
    "prompts": [
      {
        "id": "79f96ce1-3132-458a-ac72-bf16a0f78f41",
        "title": "Mon premier prompt texte",
        "content": "Contenu...",
        "contentType": "text",
        "status": "activé",
        "isPublic": true,
        "views": 0,
        "userId": "fccbfe65-35b9-4d13-a88e-d386a60d0414",
        "createdAt": "2025-10-04T17:50:10.491Z",
        "updatedAt": "2025-10-04T17:50:10.491Z",
        "Tags": [
          {
            "id": "tag-uuid-1",
            "name": "javascript"
          },
          {
            "id": "tag-uuid-2",
            "name": "nodejs"
          }
        ],
        "user": {
          "id": "fccbfe65-35b9-4d13-a88e-d386a60d0414",
          "username": "3d3m",
          "email": "user@example.com"
        }
      }
    ],
    "total": 10,
    "page": 1,
    "pageCount": 1
  }
}
```

---

## 🔑 Points techniques importants

### 1. `through: { attributes: [] }`
Exclut les colonnes de la table de jointure `prompt_tags` dans la réponse.

### 2. `attributes: ["id", "name"]`
Limite les champs retournés pour Tag à `id` et `name` uniquement.

### 3. `distinct: true`
**Crucial** pour `findAndCountAll` avec relations many-to-many. Sans cela, le comptage est incorrect.

### 4. `reload()` après `create()`
Nécessaire pour charger les relations après la création d'un prompt, car `create()` ne retourne que l'instance de base.

### 5. `required: false` vs `required: true`
- `false`: LEFT JOIN - retourne le prompt même sans tags
- `true`: INNER JOIN - retourne uniquement les prompts avec tags

---

## 🧪 Comment tester

### Test 1: Création avec tags
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test avec tags",
    "content": "Contenu de test",
    "contentType": "text",
    "tags": ["javascript", "nodejs", "api"],
    "status": "activé"
  }'
```

**Vérifier**: La réponse doit contenir un tableau `Tags` avec les 3 tags.

### Test 2: Liste des prompts
```bash
curl http://localhost:3000/api/prompts/public?page=1&limit=5
```

**Vérifier**: Chaque prompt dans `data.prompts` doit avoir un tableau `Tags` et un objet `user`.

### Test 3: Recherche
```bash
curl http://localhost:3000/api/prompts/search?q=test&tags=javascript
```

**Vérifier**: Les résultats contiennent les tags et les infos utilisateur.

### Test 4: Récupération par ID
```bash
curl -X GET http://localhost:3000/api/prompts/79f96ce1-3132-458a-ac72-bf16a0f78f41 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Vérifier**: Le prompt contient les tags avec les attributs `id` et `name`.

---

## ✅ Résultat

- [x] Tags retournés lors de la création
- [x] Tags retournés dans la liste des prompts
- [x] Tags retournés dans la recherche
- [x] Tags retournés lors de la récupération par ID
- [x] Tags retournés pour les prompts similaires
- [x] Informations utilisateur incluses partout
- [x] Comptage correct avec `distinct: true`
- [x] Performance optimisée avec `attributes` limités

---

**Date**: 4 octobre 2025  
**Version**: 1.1.0  
**Status**: ✅ Résolu
