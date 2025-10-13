# 🧪 Tests - Images facultatives pour prompts textes

## 📋 Récapitulatif de l'implémentation

### ✅ Fichiers créés
- `migrations/20251013000000-add-image-fields-to-prompts.js` - Migration DB
- `middleware/uploadPromptImage.js` - Middleware d'upload d'images
- `docs/prompt_image_guide.md` - Documentation complète
- `scripts/add-image-fields-migration.js` - Script de migration manuelle
- `.sequelizerc` - Configuration Sequelize CLI

### ✅ Fichiers modifiés
- `models/prompt.js` - Ajout des champs imagePath, imageFileSize, imageOriginalName
- `middleware/conditionalUpload.js` - Support PDF + images en multipart
- `schemas/prompt.schema.js` - Validation des champs image (facultatifs)
- `workers/fileWorker.js` - Nouveau type de job "prompt_image"
- `services/fileUploadService.js` - Méthode processPromptImage()
- `modules/prompts/prompt.service.js` - Intégration de la queue pour images

### ✅ Fonctionnalités
- Upload d'image facultatif pour prompts texte
- Formats supportés : JPEG, PNG, WebP, GIF
- Taille max : 5MB
- Optimisation automatique : 1200x1200px (qualité 90%)
- Thumbnail automatique : 300x300px (qualité 85%)
- Traitement asynchrone via BullMQ

---

## 🧪 Tests à effectuer

### Test 1 : Prompt texte SANS image (JSON)

**Description** : Créer un prompt texte simple sans image (comme avant).

**Endpoint** : `POST /api/prompts`

**Headers** :
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body** :
```json
{
  "title": "Mon prompt texte simple",
  "content": "Ceci est un prompt de test sans image",
  "contentType": "text",
  "tags": ["test", "javascript"],
  "isPublic": true
}
```

**Résultat attendu** :
- ✅ Status 201 Created
- ✅ Prompt créé avec `imagePath: null`
- ✅ Aucune erreur

**Commande cURL** :
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mon prompt texte simple",
    "content": "Ceci est un prompt de test sans image",
    "contentType": "text",
    "tags": ["test", "javascript"],
    "isPublic": true
  }'
```

---

### Test 2 : Prompt texte AVEC image (Form-Data)

**Description** : Créer un prompt texte avec une image illustrative.

**Endpoint** : `POST /api/prompts`

**Headers** :
```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Body (Form-Data)** :
```
title: Mon prompt avec image
content: Voici un prompt illustré avec une belle image
contentType: text
tags: design,frontend,react
isPublic: true
image: [FICHIER] test-image.jpg
```

**Résultat attendu** :
- ✅ Status 201 Created
- ✅ Prompt créé avec `imagePath`, `imageFileSize`, `imageOriginalName`
- ✅ Fichier sauvegardé dans `uploads/prompts/images/`
- ✅ Job ajouté à la fileQueue (type: prompt_image)
- ✅ Après ~2-5 secondes : image optimisée et thumbnail créé

**Commande cURL** :
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Mon prompt avec image" \
  -F "content=Voici un prompt illustré avec une belle image" \
  -F "contentType=text" \
  -F "tags=design,frontend,react" \
  -F "isPublic=true" \
  -F "image=@C:\Users\DELL\Pictures\test-image.jpg"
```

**Vérifications** :
1. Vérifier la réponse du serveur (imagePath présent)
2. Vérifier le fichier dans `uploads/prompts/images/`
3. Attendre 5 secondes
4. Vérifier que le thumbnail existe (`*_thumb.jpg`)
5. Vérifier les logs du worker (`🖼️ Traitement de l'image de prompt`)

---

### Test 3 : Image trop volumineuse (>5MB)

**Description** : Tester la limite de taille de fichier.

**Endpoint** : `POST /api/prompts`

**Action** : Envoyer une image de plus de 5MB.

**Résultat attendu** :
- ❌ Status 400 Bad Request
- ❌ Message : "Fichier trop volumineux. Taille maximale : 20MB pour PDF, 5MB pour images"
- ❌ Code : "FILE_TOO_LARGE"

---

### Test 4 : Fichier invalide (pas une image)

**Description** : Tester avec un fichier qui n'est pas une image.

**Endpoint** : `POST /api/prompts`

**Action** : Envoyer un fichier .txt ou .pdf dans le champ `image`.

**Résultat attendu** :
- ❌ Status 400 Bad Request
- ❌ Message : "Type de fichier non supporté"
- ❌ Code : "INVALID_FILE_TYPE"

---

### Test 5 : Prompt PDF (pas d'image)

**Description** : S'assurer que les prompts PDF fonctionnent toujours normalement.

**Endpoint** : `POST /api/prompts`

**Headers** :
```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Body (Form-Data)** :
```
title: Mon document PDF
contentType: pdf
tags: documentation,guide
isPublic: true
pdf: [FICHIER] document.pdf
```

**Résultat attendu** :
- ✅ Status 201 Created
- ✅ Prompt créé avec `pdfFilePath` et `contentType: pdf`
- ✅ `imagePath: null` (pas d'image pour les PDF)
- ✅ PDF validé par le worker

**Commande cURL** :
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Mon document PDF" \
  -F "contentType=pdf" \
  -F "tags=documentation,guide" \
  -F "isPublic=true" \
  -F "pdf=@C:\Users\DELL\Documents\test-document.pdf"
```

---

### Test 6 : Récupérer un prompt avec image

**Description** : Vérifier que les champs d'image sont retournés.

**Endpoint** : `GET /api/prompts/:id`

**Headers** :
```
Authorization: Bearer YOUR_TOKEN
```

**Résultat attendu** :
```json
{
  "message": "Prompt récupéré avec succès",
  "data": {
    "prompt": {
      "id": "uuid-123",
      "title": "Mon prompt avec image",
      "content": "...",
      "contentType": "text",
      "imagePath": "C:\\uploads\\prompts\\images\\1728825600000-test-image.jpg",
      "imageFileSize": 245678,
      "imageOriginalName": "test-image.jpg",
      "...": "..."
    }
  }
}
```

---

### Test 7 : Monitoring de la queue

**Description** : Vérifier le statut d'un job d'optimisation d'image.

**Endpoint** : `GET /api/files/queue/stats`

**Headers** :
```
Authorization: Bearer YOUR_TOKEN
```

**Résultat attendu** :
```json
{
  "message": "Statistiques de la queue récupérées",
  "data": {
    "waiting": 0,
    "active": 0,
    "completed": 3,
    "failed": 0,
    "total": 3
  }
}
```

**Commande cURL** :
```bash
curl -X GET http://localhost:3000/api/files/queue/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Test 8 : Prompt texte avec PDF ET image (devrait échouer ou ignorer l'image)

**Description** : Tester le comportement si on envoie les deux fichiers.

**Endpoint** : `POST /api/prompts`

**Body (Form-Data)** :
```
title: Test mixte
content: Test de contenu
contentType: text
pdf: [FICHIER] document.pdf
image: [FICHIER] test-image.jpg
```

**Comportement attendu** :
- Si `contentType=text` : l'image devrait être traitée, le PDF ignoré
- Si `contentType=pdf` : le PDF devrait être traité, l'image ignorée

---

## 📊 Checklist de validation

### Base de données
- [ ] Table `prompts` contient les colonnes `image_path`, `image_file_size`, `image_original_name`
- [ ] Les colonnes acceptent `NULL`

### Upload de fichiers
- [ ] Dossier `uploads/prompts/images/` existe
- [ ] Les images sont sauvegardées avec le bon format de nom (timestamp-nom.jpg)
- [ ] Les permissions du dossier permettent l'écriture

### Middleware
- [ ] Le middleware accepte `multipart/form-data` avec champ `image`
- [ ] La validation refuse les fichiers > 5MB
- [ ] La validation refuse les fichiers non-image
- [ ] Les champs `imagePath`, `imageFileSize`, `imageOriginalName` sont ajoutés au body

### Worker
- [ ] Le worker traite les jobs de type `prompt_image`
- [ ] L'image est redimensionnée à 1200x1200px max
- [ ] Un thumbnail 300x300px est créé
- [ ] L'image originale est remplacée par la version optimisée
- [ ] Les logs contiennent `🖼️ Traitement de l'image de prompt`

### API
- [ ] Créer un prompt texte sans image fonctionne
- [ ] Créer un prompt texte avec image fonctionne
- [ ] Les champs d'image sont retournés dans les réponses
- [ ] Les prompts PDF ne sont pas affectés

### Performance
- [ ] L'upload ne bloque pas la requête HTTP
- [ ] Le traitement se fait en arrière-plan
- [ ] Les jobs échoués sont retentés 3 fois
- [ ] Les stats de la queue sont accessibles

---

## 🐛 Débogage

### Les images ne sont pas optimisées

**Symptôme** : L'image est uploadée mais pas optimisée.

**Vérifications** :
1. Le worker est-il démarré ? → Vérifier les logs au démarrage du serveur
2. Redis est-il accessible ? → Tester la connexion
3. Y a-t-il des jobs en erreur ? → Consulter `/api/files/queue/stats`

**Solution** :
```bash
# Vérifier les logs du worker
grep "File worker" logs/combined-*.log

# Vérifier la queue
curl http://localhost:3000/api/files/queue/stats -H "Authorization: Bearer TOKEN"
```

---

### Erreur "Field name inconnu"

**Symptôme** : Upload échoue avec erreur de field name.

**Cause** : Le champ du formulaire n'est pas `image` ou `pdf`.

**Solution** : S'assurer que le champ s'appelle exactement `image` pour les images de prompt.

```html
<input type="file" name="image" accept="image/*" />
```

---

### Thumbnail non créé

**Symptôme** : L'image optimisée existe mais pas le thumbnail.

**Vérifications** :
1. Sharp est-il installé ? → `npm list sharp`
2. Le worker a-t-il des erreurs ? → Consulter les logs

**Solution** :
```bash
# Réinstaller Sharp
npm uninstall sharp
npm install sharp --force
```

---

## 🎯 Prochaines étapes

1. **Frontend** : Créer un composant pour uploader l'image
2. **Preview** : Afficher l'image dans les détails du prompt
3. **Galerie** : Afficher les thumbnails dans la liste des prompts
4. **Suppression** : Endpoint pour supprimer l'image d'un prompt
5. **Mise à jour** : Permettre de changer l'image d'un prompt existant

---

**Date** : 13 octobre 2025  
**Status** : ✅ Implémentation complète  
**Prêt pour tests** : OUI
