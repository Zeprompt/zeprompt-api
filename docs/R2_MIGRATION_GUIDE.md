# 🚀 Migration vers Cloudflare R2

Ce guide vous explique comment migrer le stockage de fichiers local vers Cloudflare R2.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration](#configuration)
3. [Installation des dépendances](#installation)
4. [Migration](#migration)
5. [Vérification](#vérification)
6. [Rollback](#rollback)

---

## 🔧 Prérequis

### Créer un bucket Cloudflare R2

1. Connectez-vous à [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Allez dans **R2 Object Storage**
3. Créez un nouveau bucket (ex: `zeprompt-storage`)
4. Configurez les permissions (public ou privé selon vos besoins)

### Obtenir les credentials

1. Dans R2, allez dans **Manage R2 API Tokens**
2. Créez un nouveau token avec les permissions :
   - Object Read
   - Object Write
   - Object Delete
3. Notez :
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (ex: `https://<account_id>.r2.cloudflarestorage.com`)

---

## ⚙️ Configuration

Ajoutez ces variables dans votre fichier `.env` :

```env
# Cloudflare R2 Configuration
CLOUDFLARE_BUCKET_NAME=zeprompt-storage
CLOUDFLARE_ENDPOINT_URL=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
CLOUDFLARE_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_access_key

# URL publique du bucket (si configuré avec un domaine custom)
CLOUDFLARE_PUBLIC_URL=https://cdn.zeprompt.com
# OU si pas de domaine custom, laisser vide (utilisera l'endpoint R2)
```

### Configuration du domaine public (optionnel)

Pour servir vos fichiers via un domaine custom :

1. Dans votre bucket R2, allez dans **Settings**
2. Configurez un **Custom Domain** (ex: `cdn.zeprompt.com`)
3. Ajoutez un enregistrement CNAME dans votre DNS Cloudflare
4. Mettez à jour `CLOUDFLARE_PUBLIC_URL` dans votre `.env`

---

## 📦 Installation

Installer les dépendances S3 SDK :

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## 🚀 Migration

### Étape 1 : Test en mode dry-run

Testez la migration sans modifier les fichiers :

```bash
# Tester tous les types de fichiers
node scripts/migrate-to-r2.js --dry-run

# Tester uniquement les photos de profil
node scripts/migrate-to-r2.js --dry-run --type=profiles

# Tester uniquement les images de prompts
node scripts/migrate-to-r2.js --dry-run --type=prompts

# Tester uniquement les PDFs
node scripts/migrate-to-r2.js --dry-run --type=pdfs
```

### Étape 2 : Migration réelle

Une fois satisfait du dry-run, lancez la vraie migration :

```bash
# Migrer tous les fichiers
node scripts/migrate-to-r2.js

# Ou par type
node scripts/migrate-to-r2.js --type=profiles
node scripts/migrate-to-r2.js --type=prompts
node scripts/migrate-to-r2.js --type=pdfs
```

### Ce que fait le script :

1. ✅ Lit tous les fichiers dans `uploads/`
2. ✅ Optimise les images (redimensionnement, compression)
3. ✅ Crée les thumbnails
4. ✅ Upload vers Cloudflare R2
5. ✅ Met à jour les URLs en base de données
6. ✅ Supprime les fichiers locaux après succès

---

## 🔍 Vérification

### Vérifier les fichiers sur R2

1. Allez dans votre bucket R2 sur le dashboard Cloudflare
2. Vérifiez que les fichiers sont présents dans :
   - `profiles/` - Photos de profil
   - `prompts/images/` - Images de prompts
   - `prompts/pdfs/` - PDFs de prompts

### Vérifier les URLs en base de données

```sql
-- Vérifier les photos de profil
SELECT id, username, profile_picture 
FROM users 
WHERE profile_picture IS NOT NULL 
LIMIT 10;

-- Vérifier les images de prompts
SELECT id, title, image_path 
FROM prompts 
WHERE image_path IS NOT NULL 
LIMIT 10;

-- Vérifier les PDFs
SELECT id, title, pdf_file_path 
FROM prompts 
WHERE pdf_file_path IS NOT NULL 
LIMIT 10;
```

Les URLs devraient ressembler à :
- `https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com/zeprompt-storage/profiles/user-123-timestamp-photo.jpg`
- Ou `https://cdn.zeprompt.com/profiles/user-123-timestamp-photo.jpg` (si domaine custom)

### Tester l'upload de nouveaux fichiers

1. Créez un nouveau prompt avec une image
2. Uploadez une nouvelle photo de profil
3. Vérifiez que les fichiers vont directement sur R2 (sans passer par uploads/)

---

## 🔄 Architecture après migration

### Avant (Stockage local)

```
Client Upload
     ↓
Multer → uploads/ (local)
     ↓
Queue → Worker
     ↓
Optimisation locale
     ↓
Fichier reste sur disque
```

### Après (Cloudflare R2)

```
Client Upload
     ↓
Multer → uploads/ (temporaire)
     ↓
Queue → Worker
     ↓
Optimisation + Upload R2
     ↓
Suppression fichier local
     ↓
URL stockée en DB
```

---

## 📊 Structures des dossiers R2

```
zeprompt-storage/
├── profiles/
│   ├── userId-timestamp-photo.jpg
│   └── userId-timestamp-photo_thumb.jpg
├── prompts/
│   ├── images/
│   │   ├── userId-timestamp-image.jpg
│   │   └── userId-timestamp-image_thumb.jpg
│   └── pdfs/
│       └── userId-timestamp-document.pdf
```

---

## ⚠️ Points importants

### Sécurité

- ✅ Les credentials R2 ne doivent **jamais** être commitées
- ✅ Utilisez des tokens avec permissions minimales
- ✅ Configurez les CORS sur votre bucket R2 si nécessaire

### Performance

- ✅ Les fichiers sont servis depuis le CDN Cloudflare (ultra rapide)
- ✅ Cache automatique avec `Cache-Control: max-age=31536000` (1 an)
- ✅ Pas de charge sur votre serveur API

### Coûts

Cloudflare R2 offre :
- ✅ **10 GB de stockage gratuit/mois**
- ✅ **Sortie gratuite** (pas de frais de bandwidth)
- ✅ **1 million d'opérations Class A gratuite/mois**
- ✅ **10 millions d'opérations Class B gratuite/mois**

Au-delà :
- $0.015 par GB de stockage/mois
- Opérations Class A : $4.50 par million
- Opérations Class B : $0.36 par million

---

## 🔙 Rollback (en cas de problème)

Si vous devez revenir en arrière :

### 1. Restaurer la base de données

```sql
-- Backup avant migration (à faire AVANT)
pg_dump -U postgres -h host -d database > backup_before_r2.sql

-- Restaurer si nécessaire
psql -U postgres -h host -d database < backup_before_r2.sql
```

### 2. Télécharger les fichiers depuis R2

Utilisez la CLI AWS S3 (compatible R2) :

```bash
# Configurer les credentials
aws configure --profile r2

# Télécharger tous les fichiers
aws s3 sync s3://zeprompt-storage/profiles ./uploads/profiles --endpoint-url=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com --profile r2
aws s3 sync s3://zeprompt-storage/prompts ./uploads/prompts --endpoint-url=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com --profile r2
```

---

## 🆘 Troubleshooting

### Erreur : "Access Denied"

➡️ Vérifiez que votre token R2 a les bonnes permissions (Read/Write/Delete)

### Erreur : "Bucket not found"

➡️ Vérifiez `CLOUDFLARE_BUCKET_NAME` et `CLOUDFLARE_ENDPOINT_URL` dans votre `.env`

### Images ne s'affichent pas

➡️ Vérifiez :
1. Les permissions du bucket (public/privé)
2. La configuration CORS si vous servez depuis un autre domaine
3. Les URLs dans la base de données

### Migration lente

➡️ Le script traite 3 fichiers en parallèle. Vous pouvez augmenter dans `workers/fileWorker.js` :

```javascript
concurrency: 5, // Au lieu de 3
```

---

## ✅ Checklist finale

- [ ] Variables d'environnement configurées
- [ ] Bucket R2 créé et accessible
- [ ] Dépendances installées (`@aws-sdk/client-s3`)
- [ ] Test en mode `--dry-run` effectué
- [ ] Backup de la base de données fait
- [ ] Migration réelle lancée
- [ ] Vérification des fichiers sur R2
- [ ] Vérification des URLs en DB
- [ ] Test d'upload de nouveaux fichiers
- [ ] Dossiers locaux `uploads/` nettoyés

---

## 🎉 Succès !

Votre stockage est maintenant migré vers Cloudflare R2. Tous les nouveaux fichiers seront automatiquement uploadés vers R2 au lieu du stockage local.

**Avantages** :
- ⚡ Performance CDN globale
- 💰 Coûts réduits (pas de frais de bandwidth)
- 📈 Scalabilité illimitée
- 🔒 Sécurité Cloudflare
- 🌍 Distribution mondiale
