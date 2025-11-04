# Documentation - Création de Prompts

## Endpoint
```
POST /api/prompts
```

## Authentification
**Requise** : Bearer Token dans le header `Authorization`

```bash
Authorization: Bearer <votre_token_jwt>
```

---

## Champs de la requête

### **Champs obligatoires**

| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `title` | `string` | Titre du prompt | Min: 5 caractères, Max: 100 caractères |
| `contentType` | `string` | Type de contenu | Valeurs: `"text"` ou `"pdf"` |

### **Champs conditionnels**

#### Si `contentType: "text"`
| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `content` | `string` | Contenu texte du prompt | **Obligatoire**, Max: 5000 caractères |

#### Si `contentType: "pdf"`
| Champ | Type | Description | Contraintes |
|-------|------|-------------|-------------|
| `pdfFilePath` | `string` | Chemin du fichier PDF uploadé | **Obligatoire** |
| `pdfOriginalName` | `string` | Nom original du fichier PDF | **Obligatoire** |

### **Champs optionnels**

| Champ | Type | Description | Par défaut |
|-------|------|-------------|------------|
| `application` | `string` | Application cible (ChatGPT, Claude, Gemini, etc.) | `null` |
| `tags` | `array` ou `string` | Liste des tags/catégories | `[]` |
| `isPublic` | `boolean` | Visibilité publique ou privée | `true` |
| `status` | `string` | Statut du prompt (`"activé"` ou `"désactivé"`) | `"activé"` |
| `imagePath` | `string` | Chemin de la première image | `null` |
| `imageOriginalName` | `string` | Nom original de la première image | `null` |
| `imageFileSize` | `number` | Taille de la première image (en octets) | `null` |
| `imagePath2` | `string` | Chemin de la deuxième image | `null` |
| `imageOriginalName2` | `string` | Nom original de la deuxième image | `null` |
| `imageFileSize2` | `number` | Taille de la deuxième image (en octets) | `null` |
| `imageUrl` | `string` | URL de l'image (si déjà uploadée) | `null` |
| `imageUrl2` | `string` | URL de la deuxième image | `null` |
| `pdfUrl` | `string` | URL du PDF (si déjà uploadé) | `null` |
| `thumbnailUrl` | `string` | URL du thumbnail de l'image | `null` |
| `thumbnailUrl2` | `string` | URL du thumbnail de la deuxième image | `null` |

---

## Cas d'usage et exemples

### **1. Prompt texte simple**

Créer un prompt textuel basique avec tags.

```json
{
  "title": "Comment créer une API REST avec Express",
  "contentType": "text",
  "content": "Voici un guide complet pour créer une API REST avec Express.js...",
  "application": "ChatGPT",
  "tags": ["development", "nodejs", "api"],
  "isPublic": true
}
```

**Réponse attendue :**
```json
{
  "success": true,
  "code": "PROMPT_CREATED",
  "message": "Prompt créé avec succès.",
  "data": {
    "prompt": {
      "id": "uuid-generated",
      "title": "Comment créer une API REST avec Express",
      "content": "Voici un guide complet...",
      "contentType": "text",
      "application": "ChatGPT",
      "isPublic": true,
      "status": "activé",
      "Tags": [
        { "id": "...", "name": "development" },
        { "id": "...", "name": "nodejs" },
        { "id": "...", "name": "api" }
      ],
      "user": {
        "id": "...",
        "username": "...",
        "email": "..."
      }
    }
  }
}
```

---

### **2. Prompt texte avec une image**

Créer un prompt avec une image d'illustration.

```json
{
  "title": "Design System pour React",
  "contentType": "text",
  "content": "Voici les principes de notre design system React...",
  "application": "Claude",
  "tags": ["design", "react", "ui"],
  "imagePath": "/uploads/prompts/images/design-system.png",
  "imageOriginalName": "design-system.png",
  "imageFileSize": 245678,
  "isPublic": true
}
```

**Note :** L'image sera automatiquement uploadée vers Cloudflare R2 et les URLs `imageUrl` et `thumbnailUrl` seront générées.

---

### **3. Prompt texte avec deux images**

Créer un prompt avec deux images (avant/après, exemple/résultat, etc.).

```json
{
  "title": "Optimisation d'images pour le web",
  "contentType": "text",
  "content": "Voici comment optimiser vos images pour améliorer les performances...",
  "application": "Midjourney",
  "tags": ["performance", "images", "optimization"],
  "imagePath": "/uploads/prompts/images/before.png",
  "imageOriginalName": "before.png",
  "imageFileSize": 500000,
  "imagePath2": "/uploads/prompts/images/after.png",
  "imageOriginalName2": "after.png",
  "imageFileSize2": 150000,
  "isPublic": true
}
```

---

### **4. Prompt PDF**

Créer un prompt avec un document PDF.

```json
{
  "title": "Guide complet Node.js",
  "contentType": "pdf",
  "pdfFilePath": "/uploads/prompts/pdfs/nodejs-guide.pdf",
  "pdfOriginalName": "nodejs-guide.pdf",
  "application": "ChatGPT",
  "tags": ["nodejs", "tutorial", "backend"],
  "isPublic": true
}
```

**Note :** Le PDF sera automatiquement uploadé vers Cloudflare R2 et l'URL `pdfUrl` sera générée.

---

### **5. Prompt privé**

Créer un prompt visible uniquement par son créateur.

```json
{
  "title": "Mon prompt privé pour Gemini",
  "contentType": "text",
  "content": "Ceci est un prompt personnel que je ne souhaite pas partager...",
  "application": "Gemini",
  "tags": ["personal", "draft"],
  "isPublic": false,
  "status": "activé"
}
```

---

### **6. Prompt désactivé (brouillon)**

Créer un prompt en brouillon (non visible publiquement même si `isPublic: true`).

```json
{
  "title": "Prompt en cours de rédaction",
  "contentType": "text",
  "content": "Ce prompt n'est pas encore terminé...",
  "application": "Claude",
  "tags": ["wip", "draft"],
  "isPublic": true,
  "status": "désactivé"
}
```

---

### **7. Prompt avec nouveau tag**

Les tags sont créés automatiquement s'ils n'existent pas.

```json
{
  "title": "Prompt pour DALL-E 3",
  "contentType": "text",
  "content": "Techniques avancées pour créer des images avec DALL-E 3...",
  "application": "DALL-E",
  "tags": ["DALL-E", "image-generation", "ai-art"],
  "isPublic": true
}
```

**Note :** Les tags "DALL-E", "image-generation" et "ai-art" seront créés automatiquement s'ils n'existent pas.

---

### **8. Prompt avec tags en format string (Form-Data)**

Pour les uploads avec `multipart/form-data`, les tags peuvent être envoyés comme une chaîne séparée par des virgules.

```json
{
  "title": "Prompt avec tags string",
  "contentType": "text",
  "content": "Contenu du prompt...",
  "application": "Perplexity",
  "tags": "research,analysis,data-science",
  "isPublic": "true"
}
```

**Note :**
- `tags` est une string séparée par des virgules
- `isPublic` peut être `"true"` ou `"false"` en string

---

## Applications suggérées

Voici une liste d'applications couramment utilisées :

- `"ChatGPT"`
- `"Claude"`
- `"Gemini"`
- `"Midjourney"`
- `"DALL-E"`
- `"Stable Diffusion"`
- `"Perplexity"`
- `"Copilot"`
- `"Bard"`
- Ou toute autre application (max 100 caractères)

---

## Gestion des fichiers

### **Images**
- Les images sont automatiquement uploadées vers **Cloudflare R2**
- Deux versions sont générées :
  - Image principale : 1200x1200px, qualité 90%
  - Thumbnail : 300x300px, qualité 85%
- Les champs `imageUrl` et `thumbnailUrl` sont automatiquement remplis
- Les fichiers locaux sont supprimés après upload réussi

### **PDFs**
- Les PDFs sont automatiquement uploadés vers **Cloudflare R2**
- Le champ `pdfUrl` est automatiquement rempli
- Les fichiers locaux sont supprimés après upload réussi

---

## Erreurs courantes

### **Erreur : Champ content manquant**
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Le champ 'content' est requis pour un contenu texte.",
  "errors": [...]
}
```
**Solution :** Ajouter le champ `content` pour un prompt de type `"text"`.

---

### **Erreur : Champs PDF manquants**
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Les champs 'pdfFilePath' et 'pdfOriginalName' sont requis pour un contenu PDF.",
  "errors": [...]
}
```
**Solution :** Ajouter `pdfFilePath` et `pdfOriginalName` pour un prompt de type `"pdf"`.

---

### **Erreur : Titre trop court**
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Le titre doit contenir au moins 5 caractères",
  "errors": [...]
}
```
**Solution :** Le titre doit faire au minimum 5 caractères.

---

### **Erreur : Prompt dupliqué**
```json
{
  "success": false,
  "code": "DUPLICATE_PROMPT",
  "message": "Ce prompt existe déjà (hash identique).",
  "errors": [...]
}
```
**Solution :** Un prompt avec le même titre, contenu et contentType existe déjà. Modifier le contenu.

---

## Exemple cURL complet

```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Prompt pour Claude AI",
    "contentType": "text",
    "content": "Agis comme un expert en développement web...",
    "application": "Claude",
    "tags": ["development", "web", "claude"],
    "isPublic": true,
    "status": "activé"
  }'
```

---

## Notes importantes

1. **Authentification obligatoire** : Un token JWT valide est requis
2. **Tags auto-créés** : Les tags inexistants sont automatiquement créés
3. **Upload automatique** : Les images et PDFs sont uploadés vers Cloudflare R2
4. **Hash unique** : Chaque prompt a un hash unique basé sur titre + contenu + contentType
5. **Cache invalidé** : Le cache Redis est automatiquement invalidé après création
6. **Validation stricte** : Tous les champs sont validés avec Zod

---

## Structure de la réponse

```json
{
  "success": true,
  "code": "PROMPT_CREATED",
  "message": "Prompt créé avec succès.",
  "data": {
    "prompt": {
      "id": "uuid",
      "title": "...",
      "content": "...",
      "contentType": "text|pdf",
      "application": "...",
      "isPublic": true|false,
      "status": "activé|désactivé",
      "imageUrl": "https://cdn.zeprompt.com/...",
      "thumbnailUrl": "https://cdn.zeprompt.com/...",
      "pdfUrl": "https://cdn.zeprompt.com/...",
      "userId": "uuid",
      "createdAt": "2025-11-04T...",
      "updatedAt": "2025-11-04T...",
      "Tags": [
        { "id": "uuid", "name": "tag1" },
        { "id": "uuid", "name": "tag2" }
      ],
      "user": {
        "id": "uuid",
        "username": "...",
        "email": "...",
        "profilePicture": "..."
      }
    }
  }
}
```
