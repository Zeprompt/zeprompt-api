# 🖼️ Guide : Images facultatives pour les prompts textes

## 📌 Vue d'ensemble

Les utilisateurs peuvent maintenant ajouter une image facultative lors de la création d'un prompt de type **texte**. Cette fonctionnalité permet d'enrichir visuellement les prompts textuels sans pour autant rendre l'image obligatoire.

---

## 🎯 Fonctionnalités

✅ **Upload d'image facultatif** pour les prompts texte  
✅ **Formats supportés** : JPEG, PNG, WebP, GIF  
✅ **Taille maximale** : 5MB  
✅ **Optimisation automatique** : Redimensionnement à 1200x1200px max  
✅ **Génération de thumbnail** : 300x300px  
✅ **Traitement asynchrone** : Via BullMQ queue/worker  
✅ **Compatibilité** : Fonctionne avec les prompts texte et PDF

---

## 🗄️ Structure de la base de données

### Nouveaux champs dans la table `prompts`

```sql
-- Migration: 20251013000000-add-image-fields-to-prompts.js

ALTER TABLE prompts ADD COLUMN image_path VARCHAR(255) NULL;
ALTER TABLE prompts ADD COLUMN image_file_size INTEGER NULL;
ALTER TABLE prompts ADD COLUMN image_original_name VARCHAR(255) NULL;
```

| Champ | Type | Description |
|-------|------|-------------|
| `image_path` | STRING | Chemin vers l'image uploadée |
| `image_file_size` | INTEGER | Taille du fichier en octets |
| `image_original_name` | STRING | Nom original du fichier |

---

## 📝 Modèle Sequelize

```javascript
// models/prompt.js

Prompt.init({
  // ... autres champs
  
  imagePath: {
    type: DataTypes.STRING,
    field: "image_path",
    allowNull: true,
  },
  imageFileSize: {
    type: DataTypes.INTEGER,
    field: "image_file_size",
    allowNull: true,
  },
  imageOriginalName: {
    type: DataTypes.STRING,
    field: "image_original_name",
    allowNull: true,
  },
  
  // ... autres champs
});
```

---

## 🔄 Flux de traitement

```
1. Utilisateur crée un prompt texte avec image
   ↓
2. Middleware conditionalUpload gère l'upload
   ↓
3. Fichier sauvegardé dans uploads/prompts/images/
   ↓
4. Prompt créé en DB avec chemin de l'image
   ↓
5. Job ajouté à la fileQueue (type: prompt_image)
   ↓
6. Worker optimise l'image en arrière-plan
   ↓
7. Image originale remplacée par version optimisée
   ↓
8. Thumbnail créé (300x300px)
```

---

## 🛠️ Composants techniques

### 1️⃣ Middleware d'upload (`middleware/conditionalUpload.js`)

Le middleware gère maintenant **deux types de fichiers** :
- `pdf` : Pour les prompts PDF (field name: `pdf`)
- `image` : Pour les images de prompts texte (field name: `image`)

```javascript
// Upload multipart qui gère PDF et images
upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);
```

**Limites** :
- PDF : 20MB max
- Images : 5MB max

### 2️⃣ Worker de traitement (`workers/fileWorker.js`)

Nouveau type de job : **`prompt_image`**

```javascript
case "prompt_image":
  await processPromptImage(filePath, userId, metadata);
  break;
```

**Traitement effectué** :
- ✅ Redimensionnement à 1200x1200px max (conserve proportions)
- ✅ Optimisation JPEG qualité 90%
- ✅ Création d'un thumbnail 300x300px (qualité 85%)
- ✅ Remplacement de l'original par la version optimisée

### 3️⃣ Service (`services/fileUploadService.js`)

Nouvelle méthode : **`processPromptImage()`**

```javascript
await fileUploadService.processPromptImage(
  filePath,
  userId,
  {
    promptId: prompt.id,
    title: prompt.title,
    originalName: imageOriginalName,
    fileSize: imageFileSize,
  }
);
```

**Priorité** : Moyenne (2)  
**Retry** : 3 tentatives

### 4️⃣ Intégration dans le service (`modules/prompts/prompt.service.js`)

```javascript
// Si une image est attachée (pour prompts texte), ajouter à la queue
if (data.contentType === 'text' && data.imagePath) {
  try {
    await fileUploadService.processPromptImage(
      data.imagePath,
      data.userId,
      {
        promptId: prompt.id,
        title: prompt.title,
        originalName: data.imageOriginalName,
        fileSize: data.imageFileSize,
      }
    );
    logger.info(`🖼️ Image de prompt ajoutée à la queue`);
  } catch (error) {
    logger.error(`❌ Erreur lors de l'ajout de l'image à la queue`);
    // Continue quand même, l'image sera utilisée même si le traitement échoue
  }
}
```

---

## 📡 API - Exemples d'utilisation

### 1. Créer un prompt texte **SANS** image

**Endpoint** : `POST /api/prompts`

**Headers** :
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body (JSON)** :
```json
{
  "title": "Mon prompt texte simple",
  "content": "Ceci est un prompt sans image",
  "contentType": "text",
  "tags": ["javascript", "nodejs"],
  "isPublic": true
}
```

---

### 2. Créer un prompt texte **AVEC** image

**Endpoint** : `POST /api/prompts`

**Headers** :
```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Body (Form-Data)** :
```
title: "Mon prompt avec image"
content: "Voici mon prompt illustré"
contentType: "text"
tags: "react,frontend,design"
isPublic: "true"
image: [FILE] mon-image.jpg
```

**Exemple avec cURL** :
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Mon prompt avec image" \
  -F "content=Voici mon prompt illustré" \
  -F "contentType=text" \
  -F "tags=react,frontend,design" \
  -F "isPublic=true" \
  -F "image=@/path/to/image.jpg"
```

**Exemple avec JavaScript (Fetch)** :
```javascript
const formData = new FormData();
formData.append('title', 'Mon prompt avec image');
formData.append('content', 'Voici mon prompt illustré');
formData.append('contentType', 'text');
formData.append('tags', 'react,frontend,design');
formData.append('isPublic', 'true');
formData.append('image', imageFile); // File object

const response = await fetch('http://localhost:3000/api/prompts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Prompt créé:', result.data.prompt);
```

---

### 3. Réponse de l'API

```json
{
  "message": "Prompt créé avec succès",
  "statusCode": 201,
  "data": {
    "prompt": {
      "id": "uuid-123-456",
      "title": "Mon prompt avec image",
      "content": "Voici mon prompt illustré",
      "contentType": "text",
      "imagePath": "C:\\uploads\\prompts\\images\\1697210000000-mon-image.jpg",
      "imageFileSize": 245678,
      "imageOriginalName": "mon-image.jpg",
      "isPublic": true,
      "userId": "user-uuid-789",
      "createdAt": "2025-10-13T10:30:00.000Z",
      "updatedAt": "2025-10-13T10:30:00.000Z"
    }
  },
  "code": "PROMPT_CREATED",
  "success": true
}
```

---

## 🖼️ Résultat du traitement

Après le traitement par le worker, vous aurez **2 fichiers** :

1. **Image optimisée** (remplace l'original)
   - Chemin : `uploads/prompts/images/1697210000000-mon-image.jpg`
   - Taille maximale : 1200x1200px
   - Qualité JPEG : 90%

2. **Thumbnail**
   - Chemin : `uploads/prompts/images/1697210000000-mon-image_thumb.jpg`
   - Taille : 300x300px (crop centré)
   - Qualité JPEG : 85%

---

## 🔍 Validation du schéma (Zod)

```javascript
// schemas/prompt.schema.js

const createPromptSchema = z.object({
  // ... autres champs
  
  imagePath: z.string().optional().nullable(),
  imageOriginalName: z.string().optional().nullable(),
  imageFileSize: z.number().optional().nullable(),
  
  // ... autres champs
});
```

**Points importants** :
- ✅ Tous les champs d'image sont **facultatifs**
- ✅ Accepte `null` ou `undefined`
- ✅ Pas de validation de contrainte entre `contentType` et `imagePath`
- ✅ Fonctionne avec prompts texte OU PDF

---

## 📊 Monitoring

### Vérifier le statut de traitement d'une image

**Endpoint** : `GET /api/files/job/:jobId`

```bash
curl -X GET http://localhost:3000/api/files/job/1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse** :
```json
{
  "message": "Statut du job récupéré",
  "data": {
    "found": true,
    "jobId": "1234567890",
    "state": "completed",
    "progress": 100,
    "data": {
      "type": "prompt_image",
      "filePath": "C:\\uploads\\prompts\\images\\1697210000000-mon-image.jpg",
      "userId": "user-uuid-789",
      "metadata": {
        "promptId": "uuid-123-456",
        "title": "Mon prompt avec image",
        "originalName": "mon-image.jpg",
        "fileSize": 245678
      }
    },
    "result": {
      "originalPath": "C:\\uploads\\prompts\\images\\1697210000000-mon-image.jpg",
      "thumbnailPath": "C:\\uploads\\prompts\\images\\1697210000000-mon-image_thumb.jpg",
      "optimized": true
    }
  }
}
```

---

## ⚠️ Gestion des erreurs

### Erreur : Type de fichier non supporté

```json
{
  "message": "Type de fichier non supporté",
  "code": "INVALID_FILE_TYPE"
}
```

**Solution** : Utilisez uniquement JPEG, PNG, WebP ou GIF.

---

### Erreur : Fichier trop volumineux

```json
{
  "message": "Fichier trop volumineux. Taille maximale : 20MB pour PDF, 5MB pour images",
  "code": "FILE_TOO_LARGE"
}
```

**Solution** : Réduisez la taille de votre image avant l'upload.

---

### Échec du traitement dans la queue

Si le traitement de l'image échoue dans le worker, **le prompt sera quand même créé** avec l'image originale. Le système réessaiera 3 fois automatiquement.

```javascript
// Le code continue même si la queue échoue
try {
  await fileUploadService.processPromptImage(...);
} catch (error) {
  logger.error(`❌ Erreur lors de l'ajout de l'image à la queue`);
  // Continue quand même
}
```

---

## 🎨 Cas d'usage

### 1. Prompt texte simple (sans image)

**Scenario** : Un utilisateur crée un prompt de code JavaScript simple.

**Action** : Envoyer uniquement `title`, `content`, `contentType=text`.

**Résultat** : Prompt créé sans image.

---

### 2. Prompt texte illustré (avec image)

**Scenario** : Un utilisateur crée un prompt de design UI avec un mockup.

**Action** : Envoyer `title`, `content`, `contentType=text`, + `image` (fichier).

**Résultat** : 
- Prompt créé avec image
- Image optimisée automatiquement
- Thumbnail généré

---

### 3. Prompt PDF (pas d'image)

**Scenario** : Un utilisateur upload un document PDF.

**Action** : Envoyer `title`, `contentType=pdf`, + `pdf` (fichier).

**Résultat** : Prompt PDF créé, pas de champ image.

---

## 🚀 Améliorations futures

### 1. Affichage conditionnel de l'image

Dans le frontend, afficher l'image seulement si `imagePath` existe :

```javascript
{prompt.imagePath && (
  <img 
    src={`/uploads/prompts/images/${prompt.imagePath}`} 
    alt={prompt.title}
  />
)}
```

### 2. Galerie d'images

Afficher un thumbnail dans la liste des prompts :

```javascript
{prompt.imagePath && (
  <img 
    src={`/uploads/prompts/images/${prompt.imagePath.replace('.jpg', '_thumb.jpg')}`}
    className="thumbnail"
  />
)}
```

### 3. Suppression d'image

Ajouter un endpoint pour supprimer l'image d'un prompt :

```javascript
DELETE /api/prompts/:id/image
```

### 4. Upload d'image lors de la mise à jour

Permettre d'ajouter/remplacer l'image lors d'un `PUT /api/prompts/:id`.

---

## ✅ Checklist de tests

- [ ] Créer un prompt texte **sans** image (JSON)
- [ ] Créer un prompt texte **avec** image (Form-Data)
- [ ] Vérifier que l'image est sauvegardée dans `uploads/prompts/images/`
- [ ] Vérifier que le prompt contient `imagePath`, `imageFileSize`, `imageOriginalName`
- [ ] Attendre quelques secondes et vérifier l'optimisation (image + thumbnail)
- [ ] Tester avec une image > 5MB (doit échouer)
- [ ] Tester avec un fichier non-image (doit échouer)
- [ ] Créer un prompt PDF (ne doit pas interférer)
- [ ] Vérifier les logs du worker (`🖼️ Traitement de l'image de prompt`)
- [ ] Consulter `/api/files/queue/stats` pour voir les jobs

---

## 📅 Informations

**Date de création** : 13 octobre 2025  
**Version** : 1.0.0  
**Auteur** : Équipe Zeprompt

---

## 📚 Fichiers modifiés

```
migrations/
  └── 20251013000000-add-image-fields-to-prompts.js (NEW)

models/
  └── prompt.js (MODIFIED - +3 champs)

middleware/
  ├── conditionalUpload.js (MODIFIED - gère PDF + images)
  └── uploadPromptImage.js (NEW)

schemas/
  └── prompt.schema.js (MODIFIED - +3 champs)

workers/
  └── fileWorker.js (MODIFIED - +processPromptImage)

services/
  └── fileUploadService.js (MODIFIED - +processPromptImage)

modules/prompts/
  └── prompt.service.js (MODIFIED - intégration queue image)
```

---

**🎉 La fonctionnalité est maintenant complète et prête à l'emploi !**
