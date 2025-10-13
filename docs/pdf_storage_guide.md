# 📄 Gestion des fichiers PDF - Stockage et Organisation

## 📍 Emplacement de stockage

### Dossier principal
Les fichiers PDF uploadés sont stockés dans :
```
/uploads/pdfs/
```

**Chemin absolu** : `C:\Users\DELL\Documents\projects\zeprompt-api\uploads\pdfs\`

---

## 🔧 Configuration du stockage

### Middleware d'upload (`middleware/uploadPDF.js`)

```javascript
const uploadDir = path.resolve(process.cwd(), 'uploads', 'pdfs');
```

**Caractéristiques** :
- ✅ Création automatique du dossier s'il n'existe pas
- ✅ Taille maximale : **20 MB** par fichier
- ✅ Format accepté : **PDF uniquement** (`.pdf`)
- ✅ Validation MIME type : `application/pdf`

---

## 📝 Nomenclature des fichiers

### Format du nom de fichier
```
{timestamp}-{nom_original_sécurisé}.pdf
```

### Exemple
Fichier uploadé : `Mon Document (2024).pdf`  
Fichier enregistré : `1728067810491-Mon_Document__2024_.pdf`

### Logique de renommage
```javascript
const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
const ts = Date.now();
const filename = `${ts}-${safeName}`;
```

**Avantages** :
- ✅ Évite les conflits de noms (timestamp unique)
- ✅ Sécurisé (caractères spéciaux remplacés)
- ✅ Traçabilité (date d'upload dans le nom)

---

## 💾 Stockage en base de données

### Champs dans la table `prompts`

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `pdf_file_path` | STRING | Chemin complet du fichier | `C:\Users\...\uploads\pdfs\1728067810491-document.pdf` |
| `pdf_original_name` | STRING | Nom original du fichier | `Mon Document.pdf` |
| `pdf_file_size` | INTEGER | Taille en bytes | `245678` (≈ 240 KB) |

### Exemple d'enregistrement

```json
{
  "id": "uuid-prompt",
  "title": "Guide Marketing",
  "contentType": "pdf",
  "pdfFilePath": "C:\\Users\\DELL\\Documents\\projects\\zeprompt-api\\uploads\\pdfs\\1728067810491-guide.pdf",
  "pdfOriginalName": "Guide Marketing 2024.pdf",
  "pdfFileSize": 1048576,
  "content": null
}
```

---

## 🔄 Flux de création d'un prompt PDF

### 1. Upload du fichier
```
POST /api/prompts
Content-Type: multipart/form-data

FormData:
  - pdf: [fichier]
  - title: "Mon prompt"
  - contentType: "pdf"
  - tags: "pdf,guide"
```

### 2. Traitement par le middleware
```javascript
// conditionalUpload.js détecte multipart/form-data
↓
// uploadPDF.js traite le fichier
↓
// Fichier sauvegardé dans /uploads/pdfs/
↓
// req.body enrichi avec:
{
  pdfFilePath: "path/to/file.pdf",
  pdfOriginalName: "original.pdf",
  pdfFileSize: 123456
}
```

### 3. Création en base de données
```javascript
// prompt.service.js crée le prompt
const prompt = await Prompt.create({
  title,
  contentType: "pdf",
  pdfFilePath,
  pdfOriginalName,
  pdfFileSize,
  userId,
  // ...autres champs
});
```

---

## 📂 Structure du système de fichiers

```
zeprompt-api/
├── uploads/
│   └── pdfs/
│       ├── 1728067810491-guide_marketing.pdf
│       ├── 1728067815234-strategie_2024.pdf
│       ├── 1728067820987-rapport_annuel.pdf
│       └── ... (autres fichiers PDF)
├── middleware/
│   ├── uploadPDF.js          # Configuration Multer
│   └── conditionalUpload.js  # Middleware conditionnel
└── ...
```

---

## 🛡️ Sécurité et validation

### 1. Validation du type de fichier

**Méthode 1 : MIME Type**
```javascript
if (file.mimetype === 'application/pdf')
```

**Méthode 2 : Extension**
```javascript
if (file.originalname.toLowerCase().endsWith('.pdf'))
```

### 2. Taille maximale
```javascript
limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
```

### 3. Caractères dangereux
```javascript
// Suppression des caractères spéciaux
const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
```

---

## 🔍 Récupération d'un PDF

### Endpoint (à créer)
```
GET /api/prompts/:id/download
```

### Exemple d'implémentation
```javascript
async downloadPDF(req, res, next) {
  try {
    const { id } = req.params;
    const prompt = await Prompt.findByPk(id);
    
    if (!prompt || prompt.contentType !== 'pdf') {
      throw new Error('PDF non trouvé');
    }
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(prompt.pdfFilePath)) {
      throw new Error('Fichier physique introuvable');
    }
    
    // Téléchargement
    res.download(prompt.pdfFilePath, prompt.pdfOriginalName);
  } catch (error) {
    next(error);
  }
}
```

---

## 🧹 Gestion de l'espace disque

### Suppression d'un prompt PDF

**Important** : Quand vous supprimez un prompt PDF, pensez à supprimer aussi le fichier physique !

```javascript
async deletePrompt(id) {
  const prompt = await Prompt.findByPk(id);
  
  // Si c'est un PDF, supprimer le fichier
  if (prompt.contentType === 'pdf' && prompt.pdfFilePath) {
    try {
      fs.unlinkSync(prompt.pdfFilePath);
    } catch (error) {
      console.error('Erreur suppression fichier:', error);
    }
  }
  
  // Supprimer le prompt de la DB
  await prompt.destroy();
}
```

### Script de nettoyage (optionnel)

Créer un script pour nettoyer les fichiers orphelins :

```javascript
// scripts/clean-orphan-pdfs.js
const fs = require('fs');
const path = require('path');
const { Prompt } = require('../models');

async function cleanOrphanPDFs() {
  const pdfDir = path.resolve(process.cwd(), 'uploads', 'pdfs');
  const files = fs.readdirSync(pdfDir);
  
  const prompts = await Prompt.findAll({
    where: { contentType: 'pdf' },
    attributes: ['pdfFilePath']
  });
  
  const validPaths = prompts.map(p => p.pdfFilePath);
  
  files.forEach(file => {
    const filePath = path.join(pdfDir, file);
    if (!validPaths.includes(filePath)) {
      console.log(`Suppression fichier orphelin: ${file}`);
      fs.unlinkSync(filePath);
    }
  });
}

cleanOrphanPDFs();
```

---

## 📊 Monitoring et statistiques

### Espace disque utilisé

```javascript
// Calculer l'espace total utilisé
const prompts = await Prompt.findAll({
  where: { contentType: 'pdf' },
  attributes: ['pdfFileSize']
});

const totalSize = prompts.reduce((sum, p) => sum + (p.pdfFileSize || 0), 0);
const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

console.log(`Espace utilisé: ${totalMB} MB`);
```

### Statistiques par taille

```javascript
SELECT 
  COUNT(*) as total_pdfs,
  AVG(pdf_file_size) as taille_moyenne,
  MIN(pdf_file_size) as plus_petit,
  MAX(pdf_file_size) as plus_grand,
  SUM(pdf_file_size) as espace_total
FROM prompts 
WHERE content_type = 'pdf';
```

---

## ⚠️ Points d'attention

### 1. Sauvegarde
❗ Le dossier `uploads/pdfs/` contient des données utilisateur importantes.  
✅ Inclure dans les sauvegardes régulières du serveur.

### 2. Performance
- Pour un grand nombre de fichiers, considérer une organisation en sous-dossiers par date
- Exemple : `/uploads/pdfs/2025/10/04/`

### 3. CDN (optionnel)
Pour de meilleures performances :
- Migrer vers un stockage cloud (AWS S3, Azure Blob, etc.)
- Utiliser un CDN pour la distribution
- Modifier `pdfFilePath` pour stocker l'URL cloud

### 4. Permissions
Vérifier les permissions du dossier :
```bash
# Linux/Mac
chmod 755 uploads/pdfs/

# Windows
# Vérifier via Propriétés > Sécurité
```

---

## 🧪 Test de l'upload PDF

### Test manuel avec cURL

```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test PDF Upload" \
  -F "contentType=pdf" \
  -F "pdf=@/chemin/vers/fichier.pdf" \
  -F "tags=test,pdf" \
  -F "status=activé"
```

### Test avec Postman

1. **Méthode** : POST
2. **URL** : `http://localhost:3000/api/prompts`
3. **Headers** :
   - `Authorization: Bearer {token}`
4. **Body** : `form-data`
   - `title` (text) : "Mon PDF Test"
   - `contentType` (text) : "pdf"
   - `pdf` (file) : Sélectionner le fichier
   - `tags` (text) : "test,demo"
   - `status` (text) : "activé"

### Vérification après upload

```bash
# Lister les fichiers uploadés
ls -la uploads/pdfs/

# Vérifier en base de données
SELECT id, title, pdf_file_path, pdf_file_size 
FROM prompts 
WHERE content_type = 'pdf' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 📚 Résumé

| Aspect | Détail |
|--------|--------|
| **Dossier** | `/uploads/pdfs/` |
| **Taille max** | 20 MB |
| **Format** | PDF uniquement |
| **Nomenclature** | `{timestamp}-{nom_sécurisé}.pdf` |
| **Middleware** | `conditionalUpload` + `uploadPDF` |
| **Stockage DB** | `pdfFilePath`, `pdfOriginalName`, `pdfFileSize` |
| **Sécurité** | Validation MIME + extension + caractères |

---

**Date** : 5 octobre 2025  
**Version** : 1.0.0  
**Auteur** : Équipe Zeprompt
