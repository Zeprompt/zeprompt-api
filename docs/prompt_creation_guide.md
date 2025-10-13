# Guide de création de Prompts

## 🎯 Vue d'ensemble

L'API permet de créer deux types de prompts :
1. **Prompts texte** (contentType: "text")
2. **Prompts PDF** (contentType: "pdf")

---

## 📝 1. Création d'un Prompt TEXTE

### Endpoint
```
POST /api/prompts
```

### Headers
```
Authorization: Bearer {votre_token_jwt}
Content-Type: application/json
```

### Body (JSON)
```json
{
  "title": "Mon premier prompt texte",
  "content": "Ceci est le contenu de mon prompt. Il doit contenir au moins quelques caractères.",
  "contentType": "text",
  "tags": ["javascript", "nodejs"],
  "isPublic": true,
  "status": "activé",
  "imageUrl": "https://example.com/image.jpg"
}
```

### Exemple cURL
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mon premier prompt texte",
    "content": "Ceci est le contenu de mon prompt texte avec plus de détails.",
    "contentType": "text",
    "tags": ["test", "demo"],
    "isPublic": true,
    "status": "activé"
  }'
```

### Validation
- ✅ `title` : 5-100 caractères (requis)
- ✅ `content` : max 5000 caractères (requis pour type "text")
- ✅ `contentType` : "text" (requis)
- ✅ `tags` : tableau de strings (optionnel)
- ✅ `isPublic` : boolean (optionnel, défaut: true)
- ✅ `status` : "activé" ou "désactivé" (optionnel, défaut: "activé")
- ✅ `imageUrl` : URL valide (optionnel)

---

## 📄 2. Création d'un Prompt PDF

### Endpoint
```
POST /api/prompts
```

### Headers
```
Authorization: Bearer {votre_token_jwt}
Content-Type: multipart/form-data
```

### Body (Form Data)
- `title` (text) : "Mon premier prompt PDF"
- `contentType` (text) : "pdf"
- `pdf` (file) : [fichier PDF, max 20MB]
- `tags` (text) : "javascript,nodejs" (séparés par des virgules)
- `isPublic` (text) : "true" ou "false"
- `status` (text) : "activé" ou "désactivé"
- `imageUrl` (text) : URL de l'image (optionnel)

### Exemple cURL
```bash
curl -X POST http://localhost:3000/api/prompts \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "title=Mon premier prompt PDF" \
  -F "contentType=pdf" \
  -F "pdf=@/chemin/vers/fichier.pdf" \
  -F "tags=pdf,test,demo" \
  -F "isPublic=true" \
  -F "status=activé"
```

### Exemple avec Postman
1. Sélectionner POST `/api/prompts`
2. Onglet **Headers** :
   - `Authorization: Bearer {token}`
3. Onglet **Body** :
   - Sélectionner `form-data`
   - Ajouter les champs :
     - `title` (text) : "Mon prompt PDF"
     - `contentType` (text) : "pdf"
     - `pdf` (file) : Sélectionner le fichier
     - `tags` (text) : "test,demo"
     - `isPublic` (text) : "true"
     - `status` (text) : "activé"

### Validation
- ✅ `title` : 5-100 caractères (requis)
- ✅ `contentType` : "pdf" (requis)
- ✅ `pdf` : Fichier PDF valide, max 20MB (requis)
- ✅ `tags` : tableau de strings ou string séparé par virgules (optionnel)
- ✅ `isPublic` : boolean ou string "true"/"false" (optionnel, défaut: true)
- ✅ `status` : "activé" ou "désactivé" (optionnel, défaut: "activé")

---

## 🧪 Tests avec JavaScript/Fetch

### Test Prompt Texte
```javascript
const token = "votre_token_jwt";

fetch("http://localhost:3000/api/prompts", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    title: "Test prompt texte",
    content: "Contenu du prompt texte pour tester l'API",
    contentType: "text",
    tags: ["test", "javascript"],
    isPublic: true,
    status: "activé"
  })
})
.then(res => res.json())
.then(data => console.log("Succès:", data))
.catch(err => console.error("Erreur:", err));
```

### Test Prompt PDF
```javascript
const token = "votre_token_jwt";
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const formData = new FormData();
formData.append("title", "Test prompt PDF");
formData.append("contentType", "pdf");
formData.append("pdf", file);
formData.append("tags", "pdf,test");
formData.append("isPublic", "true");
formData.append("status", "activé");

fetch("http://localhost:3000/api/prompts", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  },
  body: formData
})
.then(res => res.json())
.then(data => console.log("Succès:", data))
.catch(err => console.error("Erreur:", err));
```

---

## ⚠️ Erreurs possibles

### Erreur 400 - Validation
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Le titre doit contenir au moins 5 caractères"
}
```

### Erreur 400 - Upload PDF
```json
{
  "success": false,
  "message": "Upload error",
  "code": "LIMIT_FILE_SIZE"
}
```

### Erreur 409 - Doublon
```json
{
  "success": false,
  "code": "DUPLICATE_PROMPT",
  "message": "Un prompt similaire existe déjà"
}
```

### Erreur 401 - Non authentifié
```json
{
  "success": false,
  "code": "UNAUTHORIZED",
  "message": "Token invalide ou expiré"
}
```

---

## 📊 Réponse de succès

### Status Code: 201 Created

```json
{
  "success": true,
  "code": "PROMPT_CREATED",
  "message": "Prompt créé avec succès.",
  "data": {
    "prompt": {
      "id": "uuid-du-prompt",
      "title": "Titre du prompt",
      "content": "Contenu...",
      "contentType": "text",
      "pdfFilePath": null,
      "pdfFileSize": null,
      "pdfOriginalName": null,
      "imageUrl": null,
      "isPublic": true,
      "status": "activé",
      "views": 0,
      "userId": "uuid-de-l-utilisateur",
      "hash": "hash-unique",
      "createdAt": "2025-10-04T...",
      "updatedAt": "2025-10-04T..."
    }
  }
}
```

---

## 🔧 Notes techniques

1. **Content-Type** :
   - Prompts **texte** : `application/json`
   - Prompts **PDF** : `multipart/form-data`

2. **Tags** :
   - En JSON : tableau `["tag1", "tag2"]`
   - En Form-Data : string `"tag1,tag2"`

3. **Upload PDF** :
   - Formats acceptés : `.pdf`
   - Taille max : 20MB
   - Les fichiers sont stockés dans `/uploads/pdfs/`

4. **Status** :
   - Par défaut : `"activé"`
   - Seuls les prompts "activés" sont visibles publiquement
   - Les admins voient tous les statuts

5. **Hash** :
   - Généré automatiquement (SHA256)
   - Basé sur : title + content + contentType
   - Empêche les doublons exacts
