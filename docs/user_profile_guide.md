# 👤 Gestion du Profil Utilisateur - Guide Complet

## 📌 Vue d'ensemble

Ce système permet aux utilisateurs authentifiés de personnaliser leur profil en ajoutant :
- 📷 **Photo de profil** (JPEG, PNG, GIF, WebP)
- 🐙 **Lien GitHub**
- 💼 **Lien LinkedIn**
- 📱 **Numéro WhatsApp**
- 🐦 **Lien Twitter/X**

---

## 🗂️ Architecture

### Composants ajoutés

```
migrations/
  └── 20251006113225-add-profile-fields-to-users.js

models/
  └── user.js (+ profilePicture, githubUrl, linkedinUrl, whatsappNumber, twitterUrl)

middleware/
  └── uploadProfilePicture.js (nouveau)

schemas/
  └── user.schema.js (+ updateUserProfileSchema)

modules/users/
  ├── user.repository.js (+ updateUserProfile)
  ├── user.service.js (+ updateUserProfile)
  ├── user.controller.js (nouveau)
  └── user.routes.js (nouveau)

uploads/
  └── profiles/ (nouveau dossier)
```

---

## 📊 Modèle de données

### Table `users` - Nouveaux champs

| Champ | Type | Nullable | Validation | Description |
|-------|------|----------|------------|-------------|
| `profile_picture` | STRING | YES | - | Chemin de la photo de profil |
| `github_url` | STRING | YES | URL valide | https://github.com/username |
| `linkedin_url` | STRING | YES | URL valide | https://linkedin.com/in/username |
| `whatsapp_number` | STRING | YES | Format international | +33612345678 |
| `twitter_url` | STRING | YES | URL valide | https://twitter.com/username ou https://x.com/username |

---

## 🔧 Migration

### Fichier : `20251006113225-add-profile-fields-to-users.js`

```javascript
async up (queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'profile_picture', {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'URL ou chemin de la photo de profil'
  });

  await queryInterface.addColumn('users', 'github_url', {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'URL du profil GitHub'
  });

  await queryInterface.addColumn('users', 'linkedin_url', {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'URL du profil LinkedIn'
  });

  await queryInterface.addColumn('users', 'whatsapp_number', {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'Numéro WhatsApp'
  });

  await queryInterface.addColumn('users', 'twitter_url', {
    type: Sequelize.STRING,
    allowNull: true,
    comment: 'URL du profil Twitter/X'
  });
}
```

### Exécuter la migration

```bash
npx sequelize-cli db:migrate
```

---

## 🛡️ Validation (Zod)

### Schema : `updateUserProfileSchema`

```javascript
const updateUserProfileSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
      .max(50, "Le nom d'utilisateur ne peut pas dépasser 50 caractères")
      .optional(),
    githubUrl: z.string()
      .url("URL GitHub invalide")
      .regex(/^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/, "URL GitHub invalide (format: https://github.com/username)")
      .optional()
      .or(z.literal("")),
    linkedinUrl: z.string()
      .url("URL LinkedIn invalide")
      .regex(/^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/, "URL LinkedIn invalide (format: https://linkedin.com/in/username)")
      .optional()
      .or(z.literal("")),
    twitterUrl: z.string()
      .url("URL Twitter invalide")
      .regex(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[\w]+\/?$/, "URL Twitter/X invalide (format: https://twitter.com/username ou https://x.com/username)")
      .optional()
      .or(z.literal("")),
    whatsappNumber: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Numéro WhatsApp invalide (format international: +33612345678)")
      .optional()
      .or(z.literal("")),
  }),
});
```

**Caractéristiques** :
- ✅ Tous les champs optionnels
- ✅ Validation des formats URL (GitHub, LinkedIn, Twitter)
- ✅ Validation du format international pour WhatsApp
- ✅ Possibilité de passer une chaîne vide pour effacer une valeur

---

## 📤 Upload de photo de profil

### Middleware : `uploadProfilePicture.js`

**Configuration Multer** :
- 📁 **Dossier** : `uploads/profiles/`
- 📏 **Taille max** : 5 MB
- 🖼️ **Formats** : JPEG, JPG, PNG, GIF, WebP
- 📝 **Nomenclature** : `{userId}-{timestamp}-{originalName}.ext`

**Exemple de nom de fichier** :
```
abc123-user-id-1696512345678-profile_photo.jpg
```

---

## 🔌 API Endpoints

### 1️⃣ Récupérer le profil utilisateur

**Endpoint** : `GET /api/users/profile`

**Authentification** : ✅ Requise (Bearer Token)

**Réponse succès (200)** :
```json
{
  "message": "Profil récupéré avec succès",
  "statusCode": 200,
  "data": {
    "id": "abc-123-uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "profilePicture": "C:\\...\\uploads\\profiles\\abc-123-1696512345678-photo.jpg",
    "githubUrl": "https://github.com/johndoe",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "whatsappNumber": "+33612345678",
    "twitterUrl": "https://twitter.com/johndoe",
    "role": "user",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "Prompts": [...],
    "stats": {
      "totalPrompts": 15,
      "totalLikes": 42,
      "totalViews": 320
    }
  },
  "code": "PROFILE_FETCHED",
  "success": true
}
```

---

### 2️⃣ Mettre à jour le profil utilisateur

**Endpoint** : `PUT /api/users/profile`

**Authentification** : ✅ Requise (Bearer Token)

**Content-Type** : `multipart/form-data`

**Paramètres** :

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `profilePicture` | File | Non | Image (JPEG, PNG, GIF, WebP - max 5MB) |
| `username` | String | Non | Nouveau nom d'utilisateur (3-50 caractères) |
| `githubUrl` | String | Non | URL GitHub |
| `linkedinUrl` | String | Non | URL LinkedIn |
| `whatsappNumber` | String | Non | Numéro WhatsApp (format international) |
| `twitterUrl` | String | Non | URL Twitter/X |

**Réponse succès (200)** :
```json
{
  "message": "Profil mis à jour avec succès",
  "statusCode": 200,
  "data": {
    "id": "abc-123-uuid",
    "username": "johndoe_updated",
    "email": "john@example.com",
    "profilePicture": "C:\\...\\uploads\\profiles\\abc-123-1696512345678-photo.jpg",
    "githubUrl": "https://github.com/johndoe",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "whatsappNumber": "+33612345678",
    "twitterUrl": "https://twitter.com/johndoe",
    "role": "user",
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "code": "PROFILE_UPDATED",
  "success": true
}
```

**Erreurs possibles** :
- `400` : Données invalides (URL mal formée, image trop grande, etc.)
- `401` : Non authentifié
- `404` : Utilisateur non trouvé

---

## 🧪 Tests avec cURL

### Récupérer le profil

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Mettre à jour le profil (sans photo)

```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe_updated",
    "githubUrl": "https://github.com/johndoe",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "whatsappNumber": "+33612345678",
    "twitterUrl": "https://twitter.com/johndoe"
  }'
```

### Mettre à jour le profil (avec photo)

```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePicture=@/path/to/photo.jpg" \
  -F "username=johndoe_updated" \
  -F "githubUrl=https://github.com/johndoe" \
  -F "linkedinUrl=https://linkedin.com/in/johndoe" \
  -F "whatsappNumber=+33612345678" \
  -F "twitterUrl=https://twitter.com/johndoe"
```

---

## 📋 Exemples avec Postman

### 1. Récupérer le profil

**Configuration** :
- **Method** : GET
- **URL** : `http://localhost:3000/api/users/profile`
- **Headers** :
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

---

### 2. Mettre à jour le profil (avec photo)

**Configuration** :
- **Method** : PUT
- **URL** : `http://localhost:3000/api/users/profile`
- **Headers** :
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Body** : `form-data`
  - `profilePicture` (file) : Sélectionner l'image
  - `username` (text) : `johndoe_updated`
  - `githubUrl` (text) : `https://github.com/johndoe`
  - `linkedinUrl` (text) : `https://linkedin.com/in/johndoe`
  - `whatsappNumber` (text) : `+33612345678`
  - `twitterUrl` (text) : `https://twitter.com/johndoe`

---

## 🎨 Intégration frontend

### Exemple React

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    githubUrl: '',
    linkedinUrl: '',
    whatsappNumber: '',
    twitterUrl: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);

  // Récupérer le profil
  useEffect(() => {
    const fetchProfile = async () => {
      const response = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.data);
      setFormData({
        username: response.data.data.username,
        githubUrl: response.data.data.githubUrl || '',
        linkedinUrl: response.data.data.linkedinUrl || '',
        whatsappNumber: response.data.data.whatsappNumber || '',
        twitterUrl: response.data.data.twitterUrl || '',
      });
    };
    fetchProfile();
  }, []);

  // Mettre à jour le profil
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    if (profilePicture) {
      data.append('profilePicture', profilePicture);
    }
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.put('/api/users/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Profil mis à jour !');
      setProfile(response.data.data);
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Photo de profil</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setProfilePicture(e.target.files[0])}
        />
      </div>
      
      <input 
        type="text"
        placeholder="Nom d'utilisateur"
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
      />
      
      <input 
        type="url"
        placeholder="GitHub URL"
        value={formData.githubUrl}
        onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
      />
      
      <input 
        type="url"
        placeholder="LinkedIn URL"
        value={formData.linkedinUrl}
        onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
      />
      
      <input 
        type="tel"
        placeholder="WhatsApp (+33612345678)"
        value={formData.whatsappNumber}
        onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
      />
      
      <input 
        type="url"
        placeholder="Twitter URL"
        value={formData.twitterUrl}
        onChange={(e) => setFormData({...formData, twitterUrl: e.target.value})}
      />
      
      <button type="submit">Mettre à jour</button>
    </form>
  );
}
```

---

## 🖼️ Affichage de la photo de profil

### Servir les images statiques

Ajouter dans `index.js` :

```javascript
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

### URL d'accès

```
http://localhost:3000/uploads/profiles/abc-123-1696512345678-photo.jpg
```

### Exemple frontend

```jsx
<img 
  src={`http://localhost:3000${profile.profilePicture}`}
  alt="Photo de profil"
  width="150"
  height="150"
/>
```

---

## 🛡️ Sécurité

### ✅ Implémenté
- Authentification JWT requise
- Validation stricte des URLs (regex)
- Filtrage des types de fichiers (images uniquement)
- Limite de taille (5 MB)
- Nettoyage des noms de fichiers
- Seul l'utilisateur peut modifier son propre profil

### ⚠️ Recommandations
- Implémenter la suppression de l'ancienne photo lors de l'upload d'une nouvelle
- Ajouter un système de redimensionnement d'images (sharp, jimp)
- Stocker les images sur un CDN (Cloudinary, AWS S3)
- Ajouter un watermark ou protection anti-scraping

---

## 🧹 Nettoyage des anciennes photos

### Script de nettoyage (à implémenter)

```javascript
// scripts/clean-profile-pictures.js
const fs = require('fs');
const path = require('path');
const { User } = require('../models');

async function cleanOrphanProfilePictures() {
  const profileDir = path.resolve(process.cwd(), 'uploads', 'profiles');
  const files = fs.readdirSync(profileDir);
  
  const users = await User.findAll({
    attributes: ['profilePicture']
  });
  
  const validPaths = users
    .map(u => u.profilePicture)
    .filter(Boolean);
  
  files.forEach(file => {
    const filePath = path.join(profileDir, file);
    if (!validPaths.some(p => p.includes(file))) {
      console.log(`Suppression fichier orphelin: ${file}`);
      fs.unlinkSync(filePath);
    }
  });
}

cleanOrphanProfilePictures();
```

---

## 📊 Requêtes SQL utiles

### Utilisateurs avec profil complet

```sql
SELECT id, username, email, 
       profile_picture, github_url, linkedin_url, whatsapp_number, twitter_url
FROM users
WHERE profile_picture IS NOT NULL 
  AND github_url IS NOT NULL 
  AND linkedin_url IS NOT NULL;
```

### Utilisateurs sans photo de profil

```sql
SELECT id, username, email
FROM users
WHERE profile_picture IS NULL;
```

### Statistiques des profils

```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(profile_picture) as with_photo,
  COUNT(github_url) as with_github,
  COUNT(linkedin_url) as with_linkedin,
  COUNT(whatsapp_number) as with_whatsapp,
  COUNT(twitter_url) as with_twitter
FROM users;
```

---

## ✅ Checklist de mise en production

- [ ] Exécuter la migration
- [ ] Créer le dossier `uploads/profiles/`
- [ ] Ajouter la route user dans `index.js`
- [ ] Tester l'upload de photo
- [ ] Tester la validation des URLs
- [ ] Configurer le serveur de fichiers statiques
- [ ] Implémenter le nettoyage des anciennes photos
- [ ] Ajouter le redimensionnement d'images
- [ ] Documenter l'API dans Swagger
- [ ] Créer des tests unitaires

---

## 📚 Résumé

| Feature | Endpoint | Method | Auth |
|---------|----------|--------|------|
| Récupérer profil | `/api/users/profile` | GET | ✅ |
| Mettre à jour profil | `/api/users/profile` | PUT | ✅ |

**Champs disponibles** :
- ✅ Photo de profil (5MB max)
- ✅ GitHub URL
- ✅ LinkedIn URL
- ✅ WhatsApp (format international)
- ✅ Twitter/X URL

---

**Date de création** : 6 octobre 2025  
**Version** : 1.0.0  
**Auteur** : Équipe Zeprompt
