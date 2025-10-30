# 🚀 Migration R2 pour PDFs et Images de Prompts - Implémentation Complète

## 📅 Date d'implémentation
**30 Octobre 2024**

---

## 🎯 Objectif

Implémenter le stockage automatique sur Cloudflare R2 pour les **images de prompts texte** et les **PDFs de prompts**, en suivant le même pattern que pour les images de profil.

---

## ✅ Modifications réalisées

### 1. **Migrations de base de données**

**Fichier 1** : `migrations/20251030000000-add-pdf-url-to-prompts.js`

Ajout de deux nouveaux champs à la table `prompts` :
- `pdf_url` : URL publique du PDF dans R2
- `thumbnail_url` : URL du thumbnail de l'image dans R2

**Status** : ✅ Migration exécutée avec succès

**Fichier 2** : `migrations/20251030000001-add-second-image-to-prompts.js`

Ajout de champs pour la deuxième image facultative :
- `image2_path` : Chemin local de la deuxième image (temporaire)
- `image2_file_size` : Taille de la deuxième image
- `image2_original_name` : Nom original de la deuxième image
- `image2_url` : URL de la deuxième image dans R2
- `thumbnail2_url` : URL du thumbnail de la deuxième image dans R2

**Status** : ✅ Migration exécutée avec succès

---

### 2. **Modèle Sequelize**

**Fichier** : `models/prompt.js`

**Champs ajoutés** :
```javascript
// Champs pour première migration
pdfUrl: {
  type: DataTypes.STRING,
  field: "pdf_url",
  allowNull: true,
},
thumbnailUrl: {
  type: DataTypes.STRING,
  field: "thumbnail_url",
  allowNull: true,
},
// Champs pour deuxième image
imagePath2: {
  type: DataTypes.STRING,
  field: "image2_path",
  allowNull: true,
},
imageFileSize2: {
  type: DataTypes.INTEGER,
  field: "image2_file_size",
  allowNull: true,
},
imageOriginalName2: {
  type: DataTypes.STRING,
  field: "image2_original_name",
  allowNull: true,
},
imageUrl2: {
  type: DataTypes.STRING,
  field: "image2_url",
  allowNull: true,
},
thumbnailUrl2: {
  type: DataTypes.STRING,
  field: "thumbnail2_url",
  allowNull: true,
},
```

**Status** : ✅ Modèle mis à jour

---

### 3. **Schémas de validation Zod**

**Fichier** : `schemas/prompt.schema.js`

Ajout de `pdfUrl`, `thumbnailUrl`, `imagePath2`, `imageOriginalName2`, `imageFileSize2`, `imageUrl2` et `thumbnailUrl2` dans :
- `createPromptSchema`
- `updatePromptSchema`

**Status** : ✅ Schémas mis à jour

---

### 4. **Worker de traitement**

**Fichier** : `workers/fileWorker.js`

#### Modifications apportées :

**A. Import du modèle Prompt** :
```javascript
const { User, Prompt } = require("../models");
```

**B. Fonction `processPromptImage`** :
```javascript
// Mettre à jour la base de données avec l'URL R2
if (metadata && metadata.promptId) {
  await Prompt.update(
    { 
      imageUrl: result.image.url,
      thumbnailUrl: result.thumbnail.url 
    },
    { where: { id: metadata.promptId } }
  );
  logger.info(`Base de données mise à jour avec l'URL R2 pour le prompt ${metadata.promptId}`);
}
```

**C. Fonction `processPdfPrompt`** :
```javascript
// Mettre à jour la base de données avec l'URL R2
if (metadata && metadata.promptId) {
  await Prompt.update(
    { pdfUrl: result.url },
    { where: { id: metadata.promptId } }
  );
  logger.info(`Base de données mise à jour avec l'URL R2 pour le prompt ${metadata.promptId}`);
}
```

**Status** : ✅ Worker mis à jour

---

## 🔄 Flux de traitement

### Pour les **Images de Prompts Texte** (1 ou 2 images facultatives) :

```
1. Utilisateur crée un prompt texte avec 1 ou 2 images
   ↓
2. Middleware conditionalUpload télécharge les images localement
   ↓
3. Prompt créé dans la BDD avec imagePath(s) local(es)
   ↓
4. Job(s) ajouté(s) à la queue fileQueue pour chaque image
   ↓
5. Worker traite chaque job :
   - Optimise l'image (1200x1200)
   - Génère un thumbnail (300x300)
   - Upload les 2 vers R2
   - Met à jour la BDD avec imageUrl/imageUrl2 et thumbnailUrl/thumbnailUrl2
   - Supprime le fichier local
```

### Pour les **PDFs de Prompts** :

```
1. Utilisateur crée un prompt PDF
   ↓
2. Middleware conditionalUpload télécharge le PDF localement
   ↓
3. Prompt créé dans la BDD avec pdfFilePath local
   ↓
4. Job ajouté à la queue fileQueue
   ↓
5. Worker traite le job :
   - Valide que c'est un PDF
   - Upload vers R2
   - Met à jour la BDD avec pdfUrl
   - Supprime le fichier local
```

---

## 📊 Stockage dans R2

### Structure des dossiers

```
R2 Bucket/
├── profiles/              # Images de profil
│   ├── user-123-...jpg
│   └── user-123-..._thumb.jpg
│
├── prompts/
│   ├── images/           # Images de prompts texte
│   │   ├── user-123-...jpg
│   │   └── user-123-..._thumb.jpg
│   │
│   └── pdfs/             # PDFs de prompts
│       └── user-123-...pdf
```

### Champs dans la base de données

#### Pour les images de prompts texte (1 ou 2 images) :
| Champ | Description | Exemple |
|-------|-------------|---------|
| `image_path` | Chemin local image 1 (temporaire) | `uploads/prompts/images/1234567890-image.jpg` |
| `image_url` | URL R2 de l'image 1 | `https://r2.example.com/prompts/images/user-123-1234567890-image.jpg` |
| `thumbnail_url` | URL R2 du thumbnail image 1 | `https://r2.example.com/prompts/images/user-123-1234567890-image_thumb.jpg` |
| `image2_path` | Chemin local image 2 (temporaire, facultatif) | `uploads/prompts/images/1234567891-image2.jpg` |
| `image2_url` | URL R2 de l'image 2 (facultatif) | `https://r2.example.com/prompts/images/user-123-1234567891-image2.jpg` |
| `thumbnail2_url` | URL R2 du thumbnail image 2 (facultatif) | `https://r2.example.com/prompts/images/user-123-1234567891-image2_thumb.jpg` |

#### Pour les PDFs de prompts :
| Champ | Description | Exemple |
|-------|-------------|---------|
| `pdf_file_path` | Chemin local (temporaire) | `uploads/pdfs/1234567890-document.pdf` |
| `pdf_url` | URL R2 du PDF | `https://r2.example.com/prompts/pdfs/user-123-1234567890-document.pdf` |

---

## 🔐 Sécurité et Performance

### Avantages

✅ **Stockage décentralisé** : Fichiers sur R2, pas sur le serveur  
✅ **Performance** : CDN Cloudflare pour distribution globale  
✅ **Économie** : Pas de surcoût serveur pour stockage de fichiers  
✅ **Nettoyage automatique** : Fichiers locaux supprimés après upload  
✅ **Optimisation** : Images redimensionnées et compressées automatiquement  
✅ **Thumbnails** : Génération automatique pour performances UI  

### Prise en charge

✅ **Images de prompts texte** : 1 à 2 images facultatives, formats JPEG, PNG, WebP, GIF  
✅ **PDFs de prompts** : Format PDF standard  
✅ **Images de profil** : Déjà implémenté auparavant  

---

## 🧪 Test

### Test manuel

1. **Créer un prompt texte avec 1 ou 2 images** :
```bash
POST /api/prompts
Content-Type: multipart/form-data
{
  "title": "Mon prompt",
  "content": "Mon contenu",
  "contentType": "text",
  "image": <fichier-image.jpg>,     # Image 1 (facultative)
  "image2": <fichier-image2.jpg>   # Image 2 (facultative)
}
```

2. **Vérifier dans la BDD** que les URLs sont bien remplies après traitement :
   - Si 1 image : `image_url` et `thumbnail_url`
   - Si 2 images : `image_url`, `thumbnail_url`, `image2_url` et `thumbnail2_url`

3. **Créer un prompt PDF** :
```bash
POST /api/prompts
Content-Type: multipart/form-data
{
  "title": "Mon PDF",
  "contentType": "pdf",
  "pdf": <fichier.pdf>
}
```

4. **Vérifier dans la BDD** que `pdf_url` est bien rempli après traitement

---

## 📝 Notes importantes

1. **Traitement asynchrone** : Les uploads vers R2 se font en arrière-plan via BullMQ
2. **Pas de blocage** : L'utilisateur reçoit une réponse immédiate même si l'upload R2 n'est pas terminé
3. **Idempotence** : Les jobs sont retentés automatiquement en cas d'échec (jusqu'à 3 tentatives)
4. **Compatibilité** : Les anciens prompts avec chemins locaux continuent de fonctionner

---

## 🎉 Résultat

✅ **Images de prompts texte** (1 à 2 images facultatives) stockées sur R2 avec URLs publiques  
✅ **PDFs de prompts** stockés sur R2 avec URLs publiques  
✅ **Thumbnails** générés automatiquement pour toutes les images  
✅ **Nettoyage automatique** des fichiers locaux  
✅ **Performance optimisée** grâce au CDN Cloudflare  
✅ **Système flexible** : images totalement facultatives, 0, 1 ou 2 images acceptées  

---

## 📚 Fichiers modifiés

- ✅ `migrations/20251030000000-add-pdf-url-to-prompts.js` (créé)
- ✅ `migrations/20251030000001-add-second-image-to-prompts.js` (créé)
- ✅ `models/prompt.js`
- ✅ `schemas/prompt.schema.js`
- ✅ `workers/fileWorker.js`
- ✅ `modules/prompts/prompt.service.js`
- ✅ `middleware/conditionalUpload.js`

---

## 🚀 Prochaines étapes

1. Tester en production
2. Monitorer les logs pour vérifier que les URLs sont bien mises à jour
3. Vérifier que le frontend utilise correctement les nouvelles URLs
4. Optionnel : Ajouter une migration pour convertir les anciens prompts locaux vers R2

---

**Implémentation terminée le 30 Octobre 2024** ✅

