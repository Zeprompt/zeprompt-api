# 🚀 Migration Cloudflare R2 - Guide Visuel

## 📋 Résumé en 3 étapes

```
┌─────────────────────────────────────────────────────────┐
│  1. CONFIGURATION (5 min)                               │
│  ├─ Créer bucket R2                                     │
│  ├─ Générer credentials                                 │
│  └─ Configurer .env                                     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  2. VÉRIFICATION (1 min)                                │
│  └─ npm run r2:check                                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  3. MIGRATION (5-10 min)                                │
│  ├─ npm run migrate:r2:dry (test)                       │
│  └─ npm run migrate:r2 (migration réelle)               │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Commandes disponibles

### Vérification
```bash
npm run r2:check
```
✅ Teste la connexion R2  
✅ Vérifie les variables d'environnement  
✅ Valide les dépendances

### Migration (Test)
```bash
npm run migrate:r2:dry
```
✅ Simulation sans modification  
✅ Montre ce qui sera migré  
✅ Aucun fichier n'est touché

### Migration (Réelle)
```bash
npm run migrate:r2
```
⚠️ Migration complète  
📤 Upload vers R2  
🗑️ Supprime les fichiers locaux  
💾 Met à jour la DB

### Migration par type
```bash
npm run migrate:r2:profiles  # Photos de profil uniquement
npm run migrate:r2:prompts   # Images de prompts uniquement
npm run migrate:r2:pdfs      # PDFs uniquement
```

---

## 📊 Flux de migration

### Avant R2
```
┌──────────┐
│  Client  │
└────┬─────┘
     │ upload
     ▼
┌─────────────┐
│   Multer    │
└─────┬───────┘
      │ save
      ▼
┌──────────────────┐
│ uploads/ (local) │ ◄─ Fichiers restent ici
└──────────────────┘
      │
      ▼
┌─────────────┐
│  Database   │
│ (path local)│
└─────────────┘
```

### Après R2
```
┌──────────┐
│  Client  │
└────┬─────┘
     │ upload
     ▼
┌─────────────┐
│   Multer    │
└─────┬───────┘
      │ save temp
      ▼
┌──────────────────┐
│ uploads/ (temp)  │
└─────┬────────────┘
      │
      ▼
┌─────────────┐
│   Worker    │
└─────┬───────┘
      │
      ├─ optimize
      ├─ upload to R2
      └─ delete local
      │
      ▼
┌──────────────────┐
│ Cloudflare R2    │ ◄─ Stockage final
│ (CDN Global)     │
└─────┬────────────┘
      │
      ▼
┌─────────────┐
│  Database   │
│  (URL R2)   │
└─────────────┘
```

---

## 🏗️ Architecture des fichiers

### Structure locale (avant)
```
uploads/
├── profiles/
│   ├── user-123-photo.jpg
│   └── user-123-photo_thumb.jpg
├── prompts/
│   ├── images/
│   │   └── prompt-456.jpg
│   └── pdfs/
│       └── prompt-789.pdf
```

### Structure R2 (après)
```
zeprompt-storage/          ← Votre bucket
├── profiles/
│   ├── user-123-timestamp-photo.jpg
│   └── user-123-timestamp-photo_thumb.jpg
├── prompts/
│   ├── images/
│   │   ├── user-456-timestamp-image.jpg
│   │   └── user-456-timestamp-image_thumb.jpg
│   └── pdfs/
│       └── user-789-timestamp-document.pdf
```

---

## ⚙️ Variables d'environnement

### À configurer dans .env
```env
# ✅ À CONFIGURER
CLOUDFLARE_BUCKET_NAME=zeprompt-storage
CLOUDFLARE_ENDPOINT_URL=https://abc123.r2.cloudflarestorage.com
CLOUDFLARE_ACCESS_KEY_ID=votre_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=votre_secret_key

# ⚠️ OPTIONNEL (domaine custom)
CLOUDFLARE_PUBLIC_URL=https://cdn.zeprompt.com
```

### Comment obtenir ces valeurs ?

1. **BUCKET_NAME** : Le nom que vous donnez à votre bucket
2. **ENDPOINT_URL** : Fourni après création du token (ex: `https://abc123.r2.cloudflarestorage.com`)
3. **ACCESS_KEY_ID** : Généré lors de la création du token
4. **SECRET_ACCESS_KEY** : Généré lors de la création du token
5. **PUBLIC_URL** : Votre domaine custom (optionnel)

---

## 📈 Optimisations appliquées

### Photos de profil
```
Image originale
     ↓
Redimensionnement: 800x800px max
     ↓
Compression: JPEG 85%
     ↓
Thumbnail: 150x150px (80%)
     ↓
Upload vers R2
```

### Images de prompts
```
Image originale
     ↓
Redimensionnement: 1200x1200px max
     ↓
Compression: JPEG 90%
     ↓
Thumbnail: 300x300px (85%)
     ↓
Upload vers R2
```

### PDFs
```
PDF original
     ↓
Validation format
     ↓
Vérification signature %PDF
     ↓
Upload vers R2
```

---

## 💰 Coûts Cloudflare R2

### Gratuit
```
✅ 10 GB de stockage/mois
✅ 1 million d'opérations Class A/mois (write, list)
✅ 10 millions d'opérations Class B/mois (read)
✅ Bandwidth ILLIMITÉ (sortie gratuite)
```

### Au-delà du gratuit
```
💵 $0.015/GB de stockage/mois
💵 $4.50 par million d'opérations Class A
💵 $0.36 par million d'opérations Class B
💵 $0 pour le bandwidth (toujours gratuit)
```

### Comparaison avec AWS S3
```
R2:  10 GB + 100K requêtes + 10 TB bandwidth = $0
S3:  10 GB + 100K requêtes + 10 TB bandwidth = $920+
```

---

## ✅ Checklist avant migration

- [ ] Bucket Cloudflare R2 créé
- [ ] Token API généré (Read/Write/Delete)
- [ ] Variables .env configurées
- [ ] Test connexion : `npm run r2:check`
- [ ] Backup base de données effectué
- [ ] Test migration : `npm run migrate:r2:dry`

---

## 🚦 Ordre de migration recommandé

### Option 1 : Tout en une fois
```bash
npm run migrate:r2
```

### Option 2 : Progressif
```bash
# 1. D'abord les profils (plus petits)
npm run migrate:r2:profiles

# 2. Ensuite les images
npm run migrate:r2:prompts

# 3. Enfin les PDFs (plus gros)
npm run migrate:r2:pdfs
```

---

## 📖 Documentation

| Guide | Quand l'utiliser |
|-------|------------------|
| `R2_QUICK_START.md` | 🏃 Je veux commencer maintenant (10 min) |
| `R2_MIGRATION_GUIDE.md` | 📚 Je veux tous les détails |
| `R2_IMPLEMENTATION_SUMMARY.md` | 🔧 Je veux comprendre le code |
| `CLOUDFLARE_R2_README.md` | 📋 Je veux un récapitulatif |

---

## 🎯 Après la migration

### ✅ Vérifications
1. Dashboard Cloudflare → Voir les fichiers
2. Tester les URLs en base de données
3. Uploader un nouveau fichier
4. Vérifier qu'il va directement sur R2

### 🧹 Nettoyage
```bash
# Supprimer les dossiers uploads/ (optionnel)
rm -rf uploads/profiles
rm -rf uploads/prompts
```

### 🔒 Sécurité
- Ne commitez JAMAIS vos credentials
- Utilisez des tokens avec permissions minimales
- Configurez CORS sur votre bucket si nécessaire

---

## ❓ FAQ Express

**Q: Mes anciens liens vont-ils fonctionner ?**  
R: Non, mais le script met à jour automatiquement tous les liens en DB.

**Q: Puis-je annuler la migration ?**  
R: Oui, voir section "Rollback" dans `R2_MIGRATION_GUIDE.md`

**Q: Les fichiers sont publics ou privés ?**  
R: Ça dépend de votre config bucket. Utilisez `getSignedUrl()` pour des URLs privées temporaires.

**Q: Combien de temps prend la migration ?**  
R: 2-10 minutes selon le nombre de fichiers.

**Q: Que se passe-t-il en cas d'erreur ?**  
R: Le worker réessaie 3 fois automatiquement. Les erreurs sont loggées.

---

## 🎉 C'est parti !

```bash
# 1. Vérifier la config
npm run r2:check

# 2. Tester
npm run migrate:r2:dry

# 3. Migrer !
npm run migrate:r2
```

**Temps total estimé : 15-20 minutes** ⏱️
