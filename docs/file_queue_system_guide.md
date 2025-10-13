# 📦 Système de Queue et Workers pour les Fichiers

## 📌 Vue d'ensemble

Ce système utilise **BullMQ** et **Redis** pour traiter les fichiers (PDF et images) de manière asynchrone. Les fichiers sont ajoutés à une queue après l'upload, puis traités par des workers en arrière-plan.

---

## 🏗️ Architecture

```
Upload de fichier
     ↓
Middleware Multer
     ↓
Service (Prompt/User)
     ↓
Ajout à FileQueue (BullMQ)
     ↓
FileWorker traite le job
     ↓
Optimisation/Validation
     ↓
Job complété
```

---

## 📁 Structure des fichiers

```
queues/
  ├── emailQueue.js       # Queue pour les emails
  └── fileQueue.js        # Queue pour les fichiers (nouveau)

workers/
  ├── emailWorker.js      # Worker pour les emails
  └── fileWorker.js       # Worker pour les fichiers (nouveau)

services/
  └── fileUploadService.js # Service pour gérer la queue

modules/
  └── files/
      ├── file.controller.js # Controller pour les endpoints de monitoring
      └── file.routes.js     # Routes pour les endpoints de monitoring
```

---

## 🔧 Configuration de la Queue

### `queues/fileQueue.js`

```javascript
const { Queue } = require('bullmq');
const redisConnection = require("../config/redis");

const fileQueue = new Queue('fileQueue', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,                    // 3 tentatives max
        backoff: {
            type: 'exponential',        // Délai exponentiel entre les tentatives
            delay: 2000,                // Délai initial de 2s
        },
        removeOnComplete: {
            age: 3600,                  // Garder les jobs complétés 1h
            count: 100,
        },
        removeOnFail: {
            age: 24 * 3600,            // Garder les jobs échoués 24h
        },
    },
});
```

---

## ⚙️ Worker de traitement

### `workers/fileWorker.js`

Le worker traite 2 types de fichiers :

#### 1️⃣ Images de profil (`profile_picture`)

**Traitements effectués** :
- ✅ Vérification de l'existence du fichier
- ✅ Redimensionnement à 800x800px max (conserve les proportions)
- ✅ Optimisation JPEG qualité 85%
- ✅ Création d'un thumbnail 150x150px
- ✅ Remplacement de l'original par la version optimisée

**Résultat** :
```javascript
{
  originalPath: "C:\\uploads\\profiles\\user-123-photo.jpg",
  thumbnailPath: "C:\\uploads\\profiles\\user-123-photo_thumb.jpg",
  optimized: true
}
```

#### 2️⃣ PDFs de prompt (`pdf_prompt`)

**Traitements effectués** :
- ✅ Vérification de l'existence du fichier
- ✅ Validation du format PDF (signature `%PDF`)
- ✅ Calcul de la taille du fichier
- ✅ Suppression du fichier si invalide

**Résultat** :
```javascript
{
  filePath: "C:\\uploads\\pdfs\\prompt-123.pdf",
  validated: true,
  sizeInMB: 2.45,
  metadata: { promptId, title, ... }
}
```

---

## 🔌 Service FileUploadService

### Méthodes disponibles

#### 1. `processProfilePicture(filePath, userId, metadata)`

Ajoute un job pour traiter une image de profil.

```javascript
const fileUploadService = require('./services/fileUploadService');

const result = await fileUploadService.processProfilePicture(
  'C:\\uploads\\profiles\\user-123-photo.jpg',
  'user-123',
  {
    username: 'johndoe',
    uploadedAt: new Date().toISOString()
  }
);

// Retourne
{
  jobId: "1234567890",
  type: "profile_picture",
  status: "queued"
}
```

#### 2. `processPdfPrompt(filePath, userId, metadata)`

Ajoute un job pour traiter un PDF de prompt.

```javascript
const result = await fileUploadService.processPdfPrompt(
  'C:\\uploads\\pdfs\\prompt-123.pdf',
  'user-123',
  {
    promptId: 'prompt-uuid-123',
    title: 'Mon Prompt',
    originalName: 'document.pdf',
    fileSize: 1024000
  }
);

// Retourne
{
  jobId: "9876543210",
  type: "pdf_prompt",
  status: "queued"
}
```

#### 3. `getJobStatus(jobId)`

Vérifie le statut d'un job.

```javascript
const status = await fileUploadService.getJobStatus('1234567890');

// Retourne
{
  found: true,
  jobId: "1234567890",
  state: "completed",       // waiting, active, completed, failed, delayed
  progress: 100,
  data: { type, filePath, userId, metadata },
  result: { originalPath, thumbnailPath, optimized },
  failedReason: null,
  attemptsMade: 1
}
```

#### 4. `getQueueStats()`

Obtient les statistiques de la queue.

```javascript
const stats = await fileUploadService.getQueueStats();

// Retourne
{
  waiting: 5,     // Jobs en attente
  active: 2,      // Jobs en cours de traitement
  completed: 150, // Jobs complétés
  failed: 3,      // Jobs échoués
  total: 160      // Total
}
```

---

## 🔄 Intégration dans les services

### Prompt Service (`modules/prompts/prompt.service.js`)

```javascript
// Après la création d'un prompt PDF
if (data.contentType === 'pdf' && data.pdfFilePath) {
  await fileUploadService.processPdfPrompt(
    data.pdfFilePath,
    data.userId,
    {
      promptId: prompt.id,
      title: prompt.title,
      originalName: data.pdfOriginalName,
      fileSize: data.pdfFileSize,
    }
  );
  logger.info(`📄 PDF ajouté à la queue pour traitement: ${prompt.id}`);
}
```

### User Service (`modules/users/user.service.js`)

```javascript
// Après l'upload d'une photo de profil
if (profilePicturePath) {
  updateData.profilePicture = profilePicturePath;
  
  try {
    await fileUploadService.processProfilePicture(
      profilePicturePath,
      userId,
      {
        username: profileData.username || updateData.username,
        uploadedAt: new Date().toISOString(),
      }
    );
    logger.info(`📸 Image de profil ajoutée à la queue pour traitement: ${userId}`);
  } catch (error) {
    logger.error(`❌ Erreur lors de l'ajout de l'image à la queue: ${error.message}`);
    // Continue quand même, l'image sera utilisée même si le traitement échoue
  }
}
```

---

## 📡 API Endpoints

### 1. Vérifier le statut d'un job

**Endpoint** : `GET /api/files/job/:jobId`

**Authentification** : ✅ Requise

```bash
curl -X GET http://localhost:3000/api/files/job/1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse** :
```json
{
  "message": "Statut du job récupéré",
  "statusCode": 200,
  "data": {
    "found": true,
    "jobId": "1234567890",
    "state": "completed",
    "progress": 100,
    "data": {
      "type": "profile_picture",
      "filePath": "C:\\uploads\\profiles\\user-123-photo.jpg",
      "userId": "user-123",
      "metadata": {
        "username": "johndoe",
        "uploadedAt": "2025-10-06T10:30:00.000Z"
      }
    },
    "result": {
      "originalPath": "C:\\uploads\\profiles\\user-123-photo.jpg",
      "thumbnailPath": "C:\\uploads\\profiles\\user-123-photo_thumb.jpg",
      "optimized": true
    },
    "failedReason": null,
    "attemptsMade": 1
  },
  "code": "JOB_STATUS_FETCHED",
  "success": true
}
```

---

### 2. Statistiques de la queue

**Endpoint** : `GET /api/files/queue/stats`

**Authentification** : ✅ Requise

```bash
curl -X GET http://localhost:3000/api/files/queue/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse** :
```json
{
  "message": "Statistiques de la queue récupérées",
  "statusCode": 200,
  "data": {
    "waiting": 5,
    "active": 2,
    "completed": 150,
    "failed": 3,
    "total": 160
  },
  "code": "QUEUE_STATS_FETCHED",
  "success": true
}
```

---

## 🎯 Cas d'usage

### 1. Upload d'une image de profil avec monitoring

```javascript
// Frontend
const uploadProfilePicture = async (file) => {
  // 1. Upload du fichier
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  
  const result = await response.json();
  
  // 2. L'image est maintenant uploadée et en cours de traitement
  console.log('Image uploadée, traitement en cours...');
  
  // 3. Optionnel : Vérifier le statut du traitement
  // (Le jobId pourrait être retourné dans la réponse)
  setTimeout(async () => {
    const statsResponse = await fetch('/api/files/queue/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const stats = await statsResponse.json();
    console.log('Queue stats:', stats.data);
  }, 2000);
};
```

### 2. Création de prompt PDF avec suivi

```javascript
// Frontend
const createPdfPrompt = async (title, pdfFile, tags) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('contentType', 'pdf');
  formData.append('pdf', pdfFile);
  formData.append('tags', tags.join(','));
  
  const response = await fetch('/api/prompts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  
  const result = await response.json();
  const promptId = result.data.prompt.id;
  
  console.log('Prompt créé, PDF en cours de validation...');
  
  // Le PDF est maintenant en cours de validation dans la queue
  // Si la validation échoue, vous pourriez ajouter une notification
};
```

---

## 📊 Monitoring et Logs

### Logs du Worker

Le worker génère des logs détaillés :

```
2025-10-06 10:30:15 [info] : 🚀 File worker started for type: profile_picture
2025-10-06 10:30:15 [info] : 📸 Traitement de l'image de profil pour l'utilisateur user-123
2025-10-06 10:30:16 [info] : ✅ Image optimisée et thumbnail créé
2025-10-06 10:30:16 [info] : ✅ Fichier traité avec succès: C:\uploads\profiles\user-123-photo.jpg
2025-10-06 10:30:16 [info] : ✅ Job 1234567890 complété avec succès
```

### Logs d'erreur

```
2025-10-06 10:35:20 [error] : ❌ Erreur lors du traitement du fichier: Fichier introuvable
2025-10-06 10:35:20 [info] : 🗑️ Fichier PDF invalide supprimé
2025-10-06 10:35:20 [error] : ❌ Job 9876543210 échoué: Le fichier n'est pas un PDF valide
```

---

## 🛡️ Gestion des erreurs

### Retry automatique

La queue est configurée pour réessayer 3 fois avec un délai exponentiel :

```javascript
attempts: 3,
backoff: {
  type: 'exponential',
  delay: 2000,  // 2s, puis 4s, puis 8s
}
```

### Nettoyage automatique

- Jobs complétés : gardés 1 heure
- Jobs échoués : gardés 24 heures

### Gestion des fichiers invalides

Si un PDF est invalide, il est automatiquement supprimé :

```javascript
if (!isPdf) {
  throw new Error("Le fichier n'est pas un PDF valide");
}
// ... si erreur
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
  logger.info(`🗑️ Fichier PDF invalide supprimé`);
}
```

---

## 🚀 Améliorations futures

### 1. Notifications en temps réel

Utiliser Socket.io pour notifier l'utilisateur quand le traitement est terminé :

```javascript
// Dans fileWorker.js
fileWorker.on("completed", (job) => {
  const io = require("../config/socket").getIO();
  io.to(job.data.userId).emit('file:processed', {
    jobId: job.id,
    type: job.data.type,
    status: 'completed'
  });
});
```

### 2. Extraction de texte des PDFs

```bash
npm install pdf-parse
```

```javascript
const pdfParse = require('pdf-parse');

async function extractPdfText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}
```

### 3. Génération de miniatures de PDF

```bash
npm install pdf-thumbnail
```

```javascript
const { PdfThumbnail } = require('pdf-thumbnail');

async function generatePdfThumbnail(pdfPath, outputPath) {
  await PdfThumbnail.generate(pdfPath, outputPath);
}
```

### 4. Scan antivirus

```bash
npm install node-clamav
```

```javascript
const clamav = require('node-clamav');

async function scanFile(filePath) {
  const result = await clamav.scan(filePath);
  return result.isInfected;
}
```

---

## ✅ Checklist

- [x] Queue BullMQ configurée
- [x] Worker créé et fonctionnel
- [x] Service FileUploadService implémenté
- [x] Intégration dans Prompt Service
- [x] Intégration dans User Service
- [x] Endpoints de monitoring créés
- [x] Worker initialisé dans index.js
- [x] Package sharp installé
- [x] Documentation complète
- [ ] Tests unitaires
- [ ] Notifications Socket.io (optionnel)
- [ ] Extraction de texte PDF (optionnel)
- [ ] Scan antivirus (optionnel)

---

**Date** : 6 octobre 2025  
**Version** : 1.0.0  
**Auteur** : Équipe Zeprompt
