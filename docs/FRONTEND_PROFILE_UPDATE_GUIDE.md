# 📱 Guide Frontend - Mise à jour du Profil avec Cloudflare R2

## 🎯 Objectif

Ce guide explique comment intégrer la mise à jour du profil utilisateur avec upload d'image vers **Cloudflare R2** (stockage cloud) depuis le frontend.

**⚠️ IMPORTANT** : Les images **DOIVENT** être envoyées en tant que fichiers (multipart/form-data), **JAMAIS** en base64.

---

## 🔌 API Endpoints

### URL de base
```
Production:  https://api-v2.zeprompt.com/api/users/profile
Développement: http://localhost:3000/api/users/profile
```

### Méthodes disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/users/profile` | Récupérer le profil de l'utilisateur connecté |
| `PUT` | `/api/users/profile` | Mettre à jour le profil (avec upload image) |

---

## 🔐 Authentification

**Toutes les requêtes nécessitent un JWT Bearer Token** :

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 📋 Structure de données

### Réponse GET /profile

```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;  // URL Cloudflare R2
  githubUrl: string | null;
  linkedinUrl: string | null;
  whatsappNumber: string | null;
  twitterUrl: string | null;
  role: 'user' | 'admin';
  createdAt: string;
  Prompts: Prompt[];
  stats: {
    totalPrompts: number;
    totalLikes: number;
    totalViews: number;
  };
}

interface APIResponse {
  message: string;
  statusCode: number;
  data: UserProfile;
  code: string;
  success: boolean;
}
```

---

## 🖼️ Upload d'image de profil

### ⚠️ RÈGLES CRITIQUES

1. **❌ INTERDIT** : Envoyer l'image en base64 (`data:image/...`)
2. **✅ OBLIGATOIRE** : Envoyer le fichier via `multipart/form-data`
3. **Format** : `FormData` en JavaScript

### Types de fichiers acceptés

- ✅ JPEG / JPG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- ❌ Taille max : **5 MB**

---

## 💻 Implémentation Frontend

### Exemple React avec Axios

```jsx
import { useState } from 'react';
import axios from 'axios';

function ProfileUpdateForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Autres champs du formulaire
  const [username, setUsername] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Gérer la sélection d'image
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    // Vérifier la taille (5 MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 5 MB)');
      return;
    }

    // Vérifier le type MIME
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Format non supporté (JPEG, PNG, GIF, WebP uniquement)');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Créer une preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ CRÉER UN FormData - OBLIGATOIRE
      const formData = new FormData();
      
      // Ajouter le fichier image si sélectionné
      if (file) {
        formData.append('profilePicture', file);
      }

      // Ajouter les autres champs (tous optionnels)
      if (username) formData.append('username', username);
      if (githubUrl) formData.append('githubUrl', githubUrl);
      if (linkedinUrl) formData.append('linkedinUrl', linkedinUrl);

      // Faire la requête PUT
      const response = await axios.put(
        'http://localhost:3000/api/users/profile',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            // ⚠️ NE PAS définir 'Content-Type' manuellement !
            // Axios le fera automatiquement pour FormData
          },
        }
      );

      console.log('✅ Profil mis à jour:', response.data);
      alert('Profil mis à jour avec succès !');

      // Réinitialiser le formulaire
      setFile(null);
      setPreview(null);
      
    } catch (err) {
      console.error('❌ Erreur:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Mettre à jour mon profil</h2>

      {/* Upload de l'image */}
      <div>
        <label>Photo de profil</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
        />
        
        {preview && (
          <img 
            src={preview} 
            alt="Aperçu" 
            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Autres champs */}
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="url"
        placeholder="GitHub (https://github.com/username)"
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
      />

      <input
        type="url"
        placeholder="LinkedIn (https://linkedin.com/in/username)"
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
      />

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Envoi...' : 'Mettre à jour'}
      </button>
    </form>
  );
}

export default ProfileUpdateForm;
```

---

### Exemple React avec Fetch API

```javascript
const updateProfile = async (file, otherFields) => {
  const token = localStorage.getItem('token');
  
  // ✅ CRÉER FormData
  const formData = new FormData();
  
  // Ajouter le fichier
  if (file) {
    formData.append('profilePicture', file);
  }
  
  // Ajouter les autres champs
  Object.entries(otherFields).forEach(([key, value]) => {
    if (value) {
      formData.append(key, value);
    }
  });

  try {
    const response = await fetch('http://localhost:3000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // ⚠️ NE PAS définir 'Content-Type' manuellement !
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    console.log('✅ Succès:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
};
```

---

## 🖼️ Affichage de l'image

### URL de l'image R2

L'URL retournée par l'API est une **URL Cloudflare R2 publique** :

```typescript
profilePicture: "https://your-bucket.r2.dev/profiles/user-123-1696512345678-profile.jpg"
```

### Affichage dans React

```jsx
<img 
  src={profile?.profilePicture || '/default-avatar.png'}
  alt="Photo de profil"
  style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
  onError={(e) => {
    // Fallback si l'image ne charge pas
    e.target.src = '/default-avatar.png';
  }}
/>
```

---

## 🧪 Tests avec cURL

### Test 1: Récupérer le profil

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test 2: Mettre à jour avec image

```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePicture=@./photo.jpg" \
  -F "username=johndoe" \
  -F "githubUrl=https://github.com/johndoe"
```

---

## ⚠️ Erreurs courantes

### ❌ Erreur 400 : "Les images base64 ne sont pas autorisées"

**Cause** : Vous envoyez l'image en base64 au lieu d'un fichier.

**Solution** :
```javascript
// ❌ MAUVAIS
const data = JSON.stringify({
  profilePicture: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
});

// ✅ BON
const formData = new FormData();
formData.append('profilePicture', file); // File object du <input type="file">
```

### ❌ Erreur 400 : Upload Error

**Cause** : Fichier trop volumineux ou format incorrect.

**Solution** : Vérifier la taille (max 5 MB) et le format (JPEG, PNG, GIF, WebP uniquement).

### ❌ Erreur 401 : Non authentifié

**Cause** : Token manquant ou invalide.

**Solution** : Vérifier que le header `Authorization: Bearer <token>` est présent.

### ❌ Erreur 500 : Database error

**Cause** : Problème côté serveur (rare).

**Solution** : Contacter l'équipe backend ou vérifier les logs serveur.

---

## 📊 Réponses API

### Succès (200)

```json
{
  "message": "Profil mis à jour avec succès",
  "statusCode": 200,
  "data": {
    "id": "abc-123-uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "profilePicture": "https://your-bucket.r2.dev/profiles/abc-123-1696512345678-profile.jpg",
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

### Erreur 400 : Base64 non autorisé

```json
{
  "message": "Les images base64 ne sont pas autorisées. Utilisez multipart/form-data avec un fichier.",
  "statusCode": 400,
  "code": "BASE64_NOT_ALLOWED",
  "success": false
}
```

### Erreur 401 : Non authentifié

```json
{
  "message": "Token manquant ou invalide",
  "statusCode": 401,
  "code": "UNAUTHORIZED",
  "success": false
}
```

---

## ✅ Checklist d'intégration

- [ ] Authentification JWT fonctionnelle
- [ ] Composant de sélection de fichier avec validation (taille, type)
- [ ] Création de `FormData` pour l'upload
- [ ] Pas de conversion en base64
- [ ] Preview de l'image avant upload
- [ ] Gestion des erreurs (400, 401, 500)
- [ ] Affichage du loader pendant l'upload
- [ ] Affichage de l'image R2 retournée
- [ ] Tests avec de vraies images

---

## 🚀 Flow complet

```
1. Utilisateur sélectionne une image
   ↓
2. Frontend valide le fichier (taille, type)
   ↓
3. Frontend crée un FormData avec le fichier
   ↓
4. Frontend envoie PUT /api/users/profile avec FormData
   ↓
5. Backend reçoit le fichier via Multer
   ↓
6. Backend enregistre en local temporairement
   ↓
7. Backend ajoute le fichier à la queue (BullMQ)
   ↓
8. Worker traite l'image (redimensionnement, optimisation)
   ↓
9. Worker upload vers Cloudflare R2
   ↓
10. Worker supprime le fichier local temporaire
    ↓
11. Backend met à jour la DB avec l'URL R2
    ↓
12. Backend retourne la réponse au frontend
    ↓
13. Frontend affiche l'image R2 dans l'interface
```

---

## 📝 Code TypeScript

```typescript
// types/profile.ts
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  whatsappNumber: string | null;
  twitterUrl: string | null;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface UpdateProfileData {
  username?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  whatsappNumber?: string;
  twitterUrl?: string;
}

export interface UpdateProfileResponse {
  message: string;
  statusCode: number;
  data: UserProfile;
  code: string;
  success: boolean;
}

// services/profileService.ts
import axios from 'axios';

export const profileService = {
  async getProfile(token: string): Promise<UserProfile> {
    const response = await axios.get<UserProfile>(
      'http://localhost:3000/api/users/profile',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  async updateProfile(
    token: string,
    data: UpdateProfileData,
    file?: File
  ): Promise<UserProfile> {
    const formData = new FormData();
    
    if (file) {
      formData.append('profilePicture', file);
    }
    
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    const response = await axios.put<UpdateProfileResponse>(
      'http://localhost:3000/api/users/profile',
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    return response.data.data;
  },
};
```

---

## 🔗 Ressources

- [Documentation Cloudflare R2](https://developers.cloudflare.com/r2/)
- [MDN - FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [MDN - File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [Axios - FormData upload](https://axios-http.com/docs/post_example)

---

**Version** : 2.0.0  
**Date** : Janvier 2025  
**Migration R2** : ✅ Complète  
**Support base64** : ❌ Supprimé

