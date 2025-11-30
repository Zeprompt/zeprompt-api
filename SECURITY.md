# Politique de Sécurité

## 🔒 Versions supportées

Nous fournissons des mises à jour de sécurité pour les versions suivantes de ZePrompt API :

| Version | Supportée          |
| ------- | ------------------ |
| 1.x.x   | ✅ Oui             |
| < 1.0   | ❌ Non             |

## 🚨 Signaler une vulnérabilité

La sécurité de ZePrompt API est une priorité. Si vous découvrez une vulnérabilité de sécurité, nous apprécions votre aide pour la divulguer de manière responsable.

### ⚠️ NE PAS créer d'issue publique

**IMPORTANT** : Veuillez NE PAS créer d'issue GitHub publique pour les vulnérabilités de sécurité. Cela pourrait mettre en danger les utilisateurs actuels du projet.

### 📧 Processus de divulgation responsable

1. **Envoyez un email** à **security@zeprompt.com** avec :
   - Une description détaillée de la vulnérabilité
   - Les étapes pour reproduire le problème
   - L'impact potentiel
   - Les versions affectées
   - Votre suggestion de correction (si applicable)

2. **Attendez notre confirmation** (sous 48h)

3. **Nous travaillerons avec vous** pour :
   - Confirmer la vulnérabilité
   - Développer un correctif
   - Coordonner la divulgation publique

### 🎯 Ce qui constitue une vulnérabilité de sécurité

Exemples de vulnérabilités à signaler :

- ✅ Injection SQL
- ✅ Cross-Site Scripting (XSS)
- ✅ Cross-Site Request Forgery (CSRF)
- ✅ Contournement d'authentification
- ✅ Escalade de privilèges
- ✅ Exposition de données sensibles
- ✅ Exécution de code à distance (RCE)
- ✅ Déni de service (DoS) critique
- ✅ Failles de configuration de sécurité

### ❌ Ce qui ne constitue PAS une vulnérabilité

- ❌ Rapports de scanners automatiques sans preuve de concept
- ❌ Problèmes affectant uniquement des anciennes versions de navigateurs
- ❌ Problèmes d'UI/UX qui n'ont pas d'impact sur la sécurité
- ❌ Absence de bonnes pratiques sans impact démontrable
- ❌ DoS nécessitant un accès physique au serveur

## ⏱️ Délais de réponse

| Étape | Délai |
|-------|-------|
| Accusé de réception | 48 heures |
| Confirmation de la vulnérabilité | 7 jours |
| Publication du correctif | 30-90 jours (selon gravité) |

## 🏆 Reconnaissance

Nous reconnaissons publiquement (avec votre permission) :

- Les chercheurs qui ont signalé des vulnérabilités de manière responsable
- Leur contribution dans notre CHANGELOG
- Leur nom dans notre Hall of Fame (si applicable)

## 🔐 Bonnes pratiques de sécurité

### Pour les développeurs

Si vous contribuez au projet, suivez ces pratiques :

#### Authentification & Autorisation
```javascript
// ✅ BON : Vérifier les permissions
if (!user || user.id !== resource.ownerId) {
  throw new AppError('Non autorisé', 403);
}

// ❌ MAUVAIS : Faire confiance aux données client
const userId = req.body.userId; // Peut être modifié par le client
```

#### Validation des entrées
```javascript
// ✅ BON : Valider avec Zod
const validated = createUserSchema.parse(req.body);

// ❌ MAUVAIS : Utiliser les données non validées
const user = await User.create(req.body);
```

#### Gestion des secrets
```javascript
// ✅ BON : Utiliser les variables d'environnement
const secret = process.env.JWT_SECRET;

// ❌ MAUVAIS : Hardcoder les secrets
const secret = 'super_secret_key_123';
```

#### Requêtes SQL
```javascript
// ✅ BON : Utiliser l'ORM avec paramètres
await User.findOne({ where: { email } });

// ❌ MAUVAIS : Concaténation SQL directe
await sequelize.query(`SELECT * FROM users WHERE email = '${email}'`);
```

### Pour les utilisateurs

#### Configuration sécurisée

1. **Variables d'environnement** :
   - Changez TOUS les secrets par défaut
   - Utilisez un `JWT_SECRET` fort (min. 32 caractères aléatoires)
   - Ne commitez JAMAIS le fichier `.env`

2. **Base de données** :
   - Utilisez des mots de passe forts
   - Activez SSL pour PostgreSQL en production
   - Limitez les accès réseau à la base de données

3. **Redis** :
   - Configurez un mot de passe Redis
   - N'exposez pas Redis publiquement

4. **API** :
   - Activez les rate limits
   - Configurez CORS correctement
   - Utilisez HTTPS en production

5. **Mises à jour** :
   - Gardez Node.js à jour
   - Mettez à jour les dépendances régulièrement
   - Surveillez les alertes de sécurité GitHub

#### Checklist de déploiement sécurisé

- [ ] `NODE_ENV=production` en production
- [ ] Secrets forts et uniques dans `.env`
- [ ] HTTPS configuré (TLS/SSL)
- [ ] CORS limité aux domaines autorisés
- [ ] Rate limiting activé
- [ ] Logs de sécurité activés
- [ ] Base de données non accessible publiquement
- [ ] Backups réguliers configurés
- [ ] Monitoring en place
- [ ] Pare-feu configuré

## 🛡️ Mesures de sécurité en place

ZePrompt API implémente déjà :

- ✅ **Hachage de mots de passe** avec bcrypt
- ✅ **JWT** pour l'authentification
- ✅ **Rate limiting** contre les attaques par force brute
- ✅ **Helmet.js** pour les headers de sécurité HTTP
- ✅ **CORS** avec whitelist
- ✅ **Validation des entrées** avec Zod
- ✅ **ORM Sequelize** contre les injections SQL
- ✅ **Logging** avec Winston pour l'audit
- ✅ **Variables d'environnement** pour les secrets
- ✅ **Validation de fichiers** avec contraintes de taille/type

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## 📞 Contact Sécurité

- **Email** : security@zeprompt.com
- **PGP Key** : [À venir]
- **Response Time** : 48h maximum

---

**Merci de nous aider à garder ZePrompt API sécurisé !** 🙏
