# 🚀 Quick Start - Migration Cloudflare R2

Guide rapide pour configurer et migrer vers Cloudflare R2 en 10 minutes.

## ⚡ Étapes rapides

### 1️⃣ Créer le bucket R2 (2 min)

1. Allez sur https://dash.cloudflare.com/
2. Cliquez sur **R2 Object Storage** dans le menu de gauche
3. Créez un nouveau bucket :
   - Nom : `zeprompt-storage` (ou autre)
   - Localisation : Automatic (recommandé)
4. Cliquez sur **Create Bucket**

### 2️⃣ Générer les credentials (2 min)

1. Dans R2, cliquez sur **Manage R2 API Tokens**
2. Cliquez sur **Create API Token**
3. Configurez :
   - **Token Name** : `zeprompt-api`
   - **Permissions** : 
     - ✅ Object Read
     - ✅ Object Write  
     - ✅ Object Delete
   - **TTL** : Forever (ou selon vos besoins)
4. Cliquez sur **Create API Token**
5. **COPIEZ** et **SAUVEGARDEZ** :
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (ex: `https://abc123.r2.cloudflarestorage.com`)

⚠️ **Important** : Vous ne pourrez plus voir le Secret Access Key après cette étape !

### 3️⃣ Configurer l'environnement (1 min)

Éditez votre fichier `.env` et remplacez :

```env
CLOUDFLARE_BUCKET_NAME=zeprompt-storage
CLOUDFLARE_ENDPOINT_URL=https://ABC123.r2.cloudflarestorage.com
CLOUDFLARE_ACCESS_KEY_ID=paste_your_access_key_here
CLOUDFLARE_SECRET_ACCESS_KEY=paste_your_secret_key_here
```

### 4️⃣ Tester la connexion (1 min)

```bash
# Test en mode dry-run (simulation)
node scripts/migrate-to-r2.js --dry-run --type=profiles
```

Si vous voyez :
```
✅ Configuration R2 OK
✅ Connexion DB OK
```

C'est bon ! 🎉

### 5️⃣ Migrer les fichiers (2-10 min selon la quantité)

```bash
# Migration complète
node scripts/migrate-to-r2.js
```

Le script va :
1. Lire tous les fichiers dans `uploads/`
2. Les optimiser
3. Les uploader vers R2
4. Mettre à jour la base de données
5. Supprimer les fichiers locaux

### 6️⃣ Vérifier (2 min)

1. **Sur Cloudflare** :
   - Allez dans votre bucket
   - Vérifiez que les fichiers sont présents

2. **En base de données** :
   ```sql
   SELECT profile_picture FROM users WHERE profile_picture IS NOT NULL LIMIT 5;
   ```
   Les URLs doivent commencer par `https://...r2.cloudflarestorage.com/`

3. **Testez un nouvel upload** :
   - Uploadez une nouvelle photo de profil
   - Vérifiez qu'elle apparaît sur R2

---

## 🎯 Configuration optionnelle : Domaine custom

### Pourquoi ?

Au lieu de `https://abc123.r2.cloudflarestorage.com/bucket/file.jpg`
Vous aurez : `https://cdn.zeprompt.com/file.jpg`

### Comment ?

1. **Dans votre bucket R2** :
   - Settings → Custom Domains
   - Ajoutez `cdn.zeprompt.com` (ou votre domaine)

2. **Dans Cloudflare DNS** :
   - Ajoutez un enregistrement CNAME :
     - Name : `cdn`
     - Target : `abc123.r2.cloudflarestorage.com`
     - Proxy status : ✅ Proxied (orange cloud)

3. **Dans votre .env** :
   ```env
   CLOUDFLARE_PUBLIC_URL=https://cdn.zeprompt.com
   ```

4. **Redémarrez votre serveur**

---

## 📊 Vérifier l'usage

Dashboard Cloudflare → R2 → Votre bucket → Metrics

Vous verrez :
- 📦 Stockage utilisé (GB)
- 📊 Nombre de requêtes
- 📈 Bandwidth

**Gratuit jusqu'à** :
- 10 GB de stockage
- 1M opérations Class A/mois
- 10M opérations Class B/mois
- Bandwidth illimité ! 🎉

---

## ❓ Problèmes fréquents

### "Access Denied"

➡️ Vérifiez que votre token a les bonnes permissions (Read/Write/Delete)

### "Bucket not found"

➡️ Vérifiez `CLOUDFLARE_BUCKET_NAME` dans votre `.env`

### Les fichiers ne s'affichent pas

➡️ Allez dans votre bucket → Settings → Public Access
   - Activez si vous voulez des URLs publiques directes
   - Ou utilisez des URLs signées pour un accès privé

---

## ✅ Checklist

- [ ] Bucket R2 créé
- [ ] Token API créé
- [ ] Variables `.env` configurées
- [ ] Test dry-run réussi
- [ ] Migration lancée
- [ ] Fichiers visibles sur R2
- [ ] URLs en DB mises à jour
- [ ] Nouvel upload testé
- [ ] Domaine custom configuré (optionnel)

---

## 🎉 C'est fait !

Vos fichiers sont maintenant sur Cloudflare R2 !

**Prochaines étapes** :
1. Surveillez l'usage dans le dashboard
2. Configurez des alertes de quota
3. Nettoyez les anciens dossiers `uploads/` locaux (optionnel)

**Besoin d'aide ?** 
Consultez `docs/R2_MIGRATION_GUIDE.md` pour plus de détails.
