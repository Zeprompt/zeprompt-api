# 🎯 Migration Cloudflare R2 - Récapitulatif

## ✅ Modifications effectuées

### 1. **Nouveau service R2** (`services/r2StorageService.js`)

Service centralisé pour gérer tous les uploads vers Cloudflare R2 :

**Méthodes principales :**
- `uploadFile()` - Upload un fichier brut
- `uploadOptimizedImage()` - Upload une image optimisée
- `uploadImageWithThumbnail()` - Upload image + thumbnail
- `uploadPDF()` - Upload un PDF avec validation
- `deleteFile()` - Supprimer un fichier de R2
- `getSignedUrl()` - Générer une URL signée (fichiers privés)
- `getPublicUrl()` - Obtenir l'URL publique
- `generateKey()` - Générer une clé unique

### 2. **Worker mis à jour** (`workers/fileWorker.js`)

Le worker traite maintenant les fichiers en 3 étapes :
1. **Optimisation** (Sharp)
2. **Upload vers R2** (via r2StorageService)
3. **Suppression locale** (nettoyage)

**Résultats retournés :**
- Photos de profil : `{ imageUrl, thumbnailUrl, r2Key, thumbnailKey }`
- Images de prompts : `{ imageUrl, thumbnailUrl, r2Key, thumbnailKey }`
- PDFs : `{ pdfUrl, r2Key, sizeInMB }`

### 3. **Configuration S3 étendue** (`config/s3.js`)

Ajout des commandes S3 nécessaires :
- `DeleteObjectCommand`
- `GetObjectCommand`
- `HeadObjectCommand`

### 4. **Script de migration** (`scripts/migrate-to-r2.js`)

Script Node.js pour migrer les fichiers existants :

```bash
# Test (simulation)
node scripts/migrate-to-r2.js --dry-run

# Migration réelle
node scripts/migrate-to-r2.js

# Par type
node scripts/migrate-to-r2.js --type=profiles
node scripts/migrate-to-r2.js --type=prompts
node scripts/migrate-to-r2.js --type=pdfs
```

**Fonctionnalités :**
- ✅ Mode dry-run pour tester
- ✅ Migration par type de fichier
- ✅ Mise à jour automatique de la DB
- ✅ Suppression des fichiers locaux
- ✅ Statistiques de migration

### 5. **Documentation** (`docs/R2_MIGRATION_GUIDE.md`)

Guide complet de migration avec :
- Prérequis et configuration
- Instructions étape par étape
- Vérification et rollback
- Troubleshooting

### 6. **Variables d'environnement** (`.env.example`)

Nouvelles variables ajoutées :
```env
CLOUDFLARE_BUCKET_NAME=your-bucket-name
CLOUDFLARE_ENDPOINT_URL=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
CLOUDFLARE_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_PUBLIC_URL=https://cdn.yourdomain.com  # Optionnel
```

### 7. **Dépendances installées**

```json
{
  "@aws-sdk/client-s3": "^3.x.x",
  "@aws-sdk/s3-request-presigner": "^3.x.x"
}
```

---

## 🔄 Flux de fonctionnement

### **AVANT (Stockage local)**

```
1. Client upload fichier
2. Multer → uploads/ (local)
3. Queue → Job créé
4. Worker optimise localement
5. Fichier reste dans uploads/
6. Chemin local stocké en DB
```

### **APRÈS (Cloudflare R2)**

```
1. Client upload fichier
2. Multer → uploads/ (temporaire)
3. Queue → Job créé
4. Worker :
   - Optimise l'image
   - Upload vers R2
   - Supprime le fichier local
5. URL R2 stockée en DB
6. CDN Cloudflare sert les fichiers
```

---

## 📁 Structure R2

```
zeprompt-storage/  (votre bucket)
│
├── profiles/
│   ├── userId-timestamp-photo.jpg
│   └── userId-timestamp-photo_thumb.jpg
│
├── prompts/
│   ├── images/
│   │   ├── userId-timestamp-image.jpg
│   │   └── userId-timestamp-image_thumb.jpg
│   │
│   └── pdfs/
│       └── userId-timestamp-document.pdf
```

---

## 🎯 Prochaines étapes

### 1. Configuration Cloudflare R2

1. **Créer un bucket** :
   - Allez sur https://dash.cloudflare.com/
   - Naviguez vers R2 Object Storage
   - Créez un nouveau bucket (ex: `zeprompt-storage`)

2. **Générer les credentials** :
   - Dans R2 → Manage R2 API Tokens
   - Créez un token avec permissions Read/Write/Delete
   - Notez Access Key ID et Secret Access Key

3. **Configuration du domaine public (optionnel)** :
   - Dans votre bucket → Settings
   - Configurez un Custom Domain (ex: `cdn.zeprompt.com`)
   - Ajoutez un CNAME dans votre DNS Cloudflare

### 2. Configurer les variables d'environnement

Ajoutez dans votre `.env` :

```env
CLOUDFLARE_BUCKET_NAME=zeprompt-storage
CLOUDFLARE_ENDPOINT_URL=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
CLOUDFLARE_ACCESS_KEY_ID=your_access_key_here
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key_here
CLOUDFLARE_PUBLIC_URL=https://cdn.zeprompt.com
```

### 3. Tester la configuration

```bash
# Tester avec dry-run
node scripts/migrate-to-r2.js --dry-run --type=profiles
```

### 4. Migrer les fichiers existants

```bash
# Migrer tous les fichiers
node scripts/migrate-to-r2.js

# Ou par type
node scripts/migrate-to-r2.js --type=profiles
node scripts/migrate-to-r2.js --type=prompts
node scripts/migrate-to-r2.js --type=pdfs
```

### 5. Tester les nouveaux uploads

1. Uploadez une nouvelle photo de profil
2. Créez un prompt avec une image
3. Uploadez un PDF
4. Vérifiez que les fichiers apparaissent sur R2

### 6. Nettoyer (optionnel)

Une fois que tout fonctionne, vous pouvez :
- Supprimer les dossiers `uploads/` locaux
- Ou les garder comme backup temporaire

---

## ⚡ Avantages de cette migration

### Performance
- ✅ **CDN Global** : Fichiers servis depuis le edge le plus proche
- ✅ **Cache automatique** : Headers `Cache-Control` configurés
- ✅ **Pas de charge serveur** : Le serveur API ne sert plus les fichiers

### Coûts
- ✅ **10 GB gratuits/mois**
- ✅ **Sortie gratuite** : Pas de frais de bandwidth (contrairement à S3)
- ✅ **Opérations gratuites** : 1M Class A + 10M Class B/mois

### Scalabilité
- ✅ **Illimité** : Pas de limite de stockage
- ✅ **Haute disponibilité** : Infrastructure Cloudflare
- ✅ **Géo-distribution** : Réplication mondiale automatique

### Sécurité
- ✅ **DDoS Protection** : Protection Cloudflare incluse
- ✅ **URLs signées** : Pour fichiers privés
- ✅ **Encryption** : Au repos et en transit

---

## 🔧 Maintenance

### Surveiller l'utilisation

Dashboard Cloudflare R2 :
- Stockage utilisé
- Nombre de requêtes
- Bandwidth

### Nettoyer les anciens fichiers

Créez des lifecycle rules dans R2 pour supprimer automatiquement :
- Fichiers temporaires
- Anciennes versions
- Fichiers orphelins

### Monitoring

Ajoutez des logs dans le worker :
- Succès d'upload
- Échecs
- Temps de traitement

---

## ❓ Questions fréquentes

### Les anciens liens fonctionnent-ils encore ?

Non, les liens locaux (`uploads/...`) ne fonctionneront plus après migration.
Le script met à jour automatiquement tous les liens en base de données.

### Puis-je rollback ?

Oui, voir la section "Rollback" dans `docs/R2_MIGRATION_GUIDE.md`

### Les fichiers sont-ils publics ?

Ça dépend de votre configuration bucket :
- **Public** : URL directe fonctionne
- **Privé** : Utilisez `getSignedUrl()` pour générer des URLs temporaires

### Combien ça coûte ?

Pour un usage moyen :
- **0-10 GB** : Gratuit
- **10-100 GB** : ~$1.50/mois
- **100-1000 GB** : ~$15/mois

Pas de frais de bandwidth ! 🎉

---

## 🎉 Conclusion

Votre API est maintenant prête pour Cloudflare R2 !

**Fichiers modifiés** : 7
**Fichiers créés** : 4
**Dépendances ajoutées** : 2

**Status** : ✅ Prêt pour la migration

Suivez le guide `docs/R2_MIGRATION_GUIDE.md` pour migrer vos fichiers existants.
