# 🚩 Système de Signalement - Guide Complet

## 📌 Vue d'ensemble

Le système de signalement permet aux utilisateurs authentifiés de signaler des **prompts** et des **commentaires** inappropriés. Chaque signalement incrémente un compteur qui peut être utilisé pour la modération.

---

## 🗂️ Architecture

### Composants ajoutés

```
migrations/
  ├── 20251005061622-add-report-count-to-prompts.js
  └── 20251005061911-add-report-count-to-comments.js

models/
  ├── prompt.js (+ reportCount)
  └── comment.js (+ reportCount)

schemas/
  └── report.schema.js (nouveau)

modules/
  ├── prompts/
  │   ├── prompt.repository.js (+ reportPrompt)
  │   ├── prompt.service.js (+ reportPrompt)
  │   ├── prompt.controller.js (+ reportPrompt)
  │   └── prompt.routes.js (+ POST /:id/report)
  └── comment/
      ├── comment.repository.js (+ reportComment)
      ├── comment.service.js (+ reportComment)
      └── comment.controller.js (+ reportComment)
```

---

## 📊 Modèle de données

### Table `prompts`

Nouveau champ ajouté :

| Champ | Type | Default | Nullable | Description |
|-------|------|---------|----------|-------------|
| `report_count` | INTEGER | 0 | NO | Nombre de signalements reçus |

**Contraintes** :
- ✅ Valeur minimale : 0
- ✅ Auto-incrémenté à chaque signalement
- ✅ Conservé en base de données

### Table `comments`

Nouveau champ ajouté :

| Champ | Type | Default | Nullable | Description |
|-------|------|---------|----------|-------------|
| `report_count` | INTEGER | 0 | NO | Nombre de signalements reçus |

**Contraintes** :
- ✅ Valeur minimale : 0
- ✅ Auto-incrémenté à chaque signalement
- ✅ Conservé en base de données

---

## 🔧 Migrations

### Migration 1 : Ajout reportCount aux prompts

**Fichier** : `20251005061622-add-report-count-to-prompts.js`

```javascript
async up (queryInterface, Sequelize) {
  await queryInterface.addColumn('prompts', 'report_count', {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Nombre de signalements reçus pour ce prompt'
  });
}
```

### Migration 2 : Ajout reportCount aux commentaires

**Fichier** : `20251005061911-add-report-count-to-comments.js`

```javascript
async up (queryInterface, Sequelize) {
  await queryInterface.addColumn('comments', 'report_count', {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Nombre de signalements reçus pour ce commentaire'
  });
}
```

### Exécuter les migrations

```bash
npx sequelize-cli db:migrate
```

---

## 🛠️ Validation (Zod)

**Fichier** : `schemas/report.schema.js`

### Schema pour signaler un prompt

```javascript
const reportPromptSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .min(3, "La raison doit contenir au moins 3 caractères")
      .max(500, "La raison ne peut pas dépasser 500 caractères")
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid("L'identifiant du prompt doit être un UUID valide"),
  }),
});
```

### Schema pour signaler un commentaire

```javascript
const reportCommentSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .min(3, "La raison doit contenir au moins 3 caractères")
      .max(500, "La raison ne peut pas dépasser 500 caractères")
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid("L'identifiant du commentaire doit être un UUID valide"),
  }),
});
```

**Caractéristiques** :
- ✅ Raison du signalement **optionnelle**
- ✅ Si fournie : entre 3 et 500 caractères
- ✅ Validation UUID stricte pour l'ID

---

## 🔌 API Endpoints

### 1️⃣ Signaler un prompt

**Endpoint** : `POST /api/prompts/:id/report`

**Authentification** : ✅ Requise (Bearer Token)

**Paramètres** :
- `id` (path) : UUID du prompt à signaler

**Body (optionnel)** :
```json
{
  "reason": "Contenu inapproprié"
}
```

**Réponse succès (200)** :
```json
{
  "message": "Prompt signalé avec succès",
  "statusCode": 200,
  "data": {
    "reportCount": 3
  },
  "code": "PROMPT_REPORTED",
  "success": true
}
```

**Erreurs possibles** :
- `400` : ID invalide (pas un UUID)
- `401` : Non authentifié
- `404` : Prompt non trouvé

### 2️⃣ Signaler un commentaire

**Endpoint** : `POST /api/prompts/comments/:id/report`

**Authentification** : ✅ Requise (Bearer Token)

**Paramètres** :
- `id` (path) : UUID du commentaire à signaler

**Body (optionnel)** :
```json
{
  "reason": "Commentaire offensant"
}
```

**Réponse succès (200)** :
```json
{
  "message": "Commentaire signalé avec succès",
  "statusCode": 200,
  "data": {
    "reportCount": 5
  },
  "code": "COMMENT_REPORTED",
  "success": true
}
```

**Erreurs possibles** :
- `400` : ID invalide (pas un UUID)
- `401` : Non authentifié
- `404` : Commentaire non trouvé

---

## 🧪 Tests avec cURL

### Signaler un prompt

```bash
curl -X POST http://localhost:3000/api/prompts/79f96ce1-3132-458a-ac72-bf16a0f78f41/report \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Contenu inapproprié"
  }'
```

### Signaler un commentaire

```bash
curl -X POST http://localhost:3000/api/prompts/comments/abc123-comment-uuid/report \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Spam"
  }'
```

### Signaler sans raison (optionnel)

```bash
curl -X POST http://localhost:3000/api/prompts/79f96ce1-3132-458a-ac72-bf16a0f78f41/report \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📋 Exemples avec Postman

### 1. Signaler un prompt

**Configuration** :
- **Method** : POST
- **URL** : `http://localhost:3000/api/prompts/{prompt_id}/report`
- **Headers** :
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  ```
- **Body (raw JSON)** :
  ```json
  {
    "reason": "Ce prompt contient du spam publicitaire"
  }
  ```

### 2. Signaler un commentaire

**Configuration** :
- **Method** : POST
- **URL** : `http://localhost:3000/api/prompts/comments/{comment_id}/report`
- **Headers** :
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  ```
- **Body (raw JSON)** :
  ```json
  {
    "reason": "Commentaire inapproprié et offensant"
  }
  ```

---

## 🔍 Logging et Tracking

### Logs générés

**Pour les prompts** :
```javascript
logger.info(`Prompt ${id} signalé par l'utilisateur ${userId}. Raison: ${reason || 'Non spécifiée'}. Total signalements: ${updatedPrompt.reportCount}`);
```

**Pour les commentaires** :
```javascript
console.log(`Commentaire ${id} signalé par l'utilisateur ${userId}. Raison: ${reason || 'Non spécifiée'}. Total signalements: ${updatedComment.reportCount}`);
```

### Exemple de log

```
2025-10-05 08:15:23 [info] : Prompt 79f96ce1-3132-458a-ac72-bf16a0f78f41 signalé par l'utilisateur user-uuid-123. Raison: Contenu inapproprié. Total signalements: 3
```

---

## 🎯 Cas d'usage

### 1. Modération automatique

Créer un système qui désactive automatiquement les contenus fortement signalés :

```javascript
// Dans prompt.service.js ou un worker dédié
async checkAndModerate(promptId) {
  const prompt = await Prompt.findByPk(promptId);
  
  // Si plus de 10 signalements, désactiver automatiquement
  if (prompt.reportCount >= 10) {
    prompt.status = 'désactivé';
    await prompt.save();
    
    // Notifier l'admin
    await emailService.sendAdminAlert({
      type: 'auto_moderation',
      promptId,
      reportCount: prompt.reportCount
    });
  }
}
```

### 2. Dashboard admin

Afficher les contenus les plus signalés :

```javascript
// Récupérer les prompts avec le plus de signalements
async getMostReportedPrompts(limit = 10) {
  return await Prompt.findAll({
    order: [['reportCount', 'DESC']],
    limit,
    where: {
      reportCount: { [Op.gt]: 0 }
    }
  });
}

// Récupérer les commentaires avec le plus de signalements
async getMostReportedComments(limit = 10) {
  return await Comment.findAll({
    order: [['reportCount', 'DESC']],
    limit,
    where: {
      reportCount: { [Op.gt]: 0 }
    }
  });
}
```

### 3. Notification aux modérateurs

Envoyer un email quand un seuil est atteint :

```javascript
async reportPrompt(id, userId, reason = null) {
  // ... code existant ...
  
  const updatedPrompt = await promptRepository.reportPrompt(id);
  
  // Notification si seuil critique atteint
  if (updatedPrompt.reportCount === 5) {
    await emailService.sendToModerators({
      subject: 'Prompt nécessite une révision',
      promptId: id,
      reportCount: 5,
      reason
    });
  }
  
  return { message: "Prompt signalé avec succès", reportCount: updatedPrompt.reportCount };
}
```

---

## 📈 Statistiques et requêtes utiles

### Nombre total de signalements

```sql
-- Signalements sur les prompts
SELECT SUM(report_count) as total_reports_prompts FROM prompts;

-- Signalements sur les commentaires
SELECT SUM(report_count) as total_reports_comments FROM comments;
```

### Top 10 des contenus signalés

```sql
-- Prompts les plus signalés
SELECT id, title, report_count 
FROM prompts 
WHERE report_count > 0 
ORDER BY report_count DESC 
LIMIT 10;

-- Commentaires les plus signalés
SELECT c.id, c.content, c.report_count, p.title as prompt_title
FROM comments c
JOIN prompts p ON c.prompt_id = p.id
WHERE c.report_count > 0
ORDER BY c.report_count DESC
LIMIT 10;
```

### Utilisateurs avec le plus de contenus signalés

```sql
-- Prompts
SELECT u.username, u.email, COUNT(*) as prompts_signales, SUM(p.report_count) as total_signalements
FROM users u
JOIN prompts p ON u.id = p.user_id
WHERE p.report_count > 0
GROUP BY u.id
ORDER BY total_signalements DESC
LIMIT 10;

-- Commentaires
SELECT u.username, u.email, COUNT(*) as comments_signales, SUM(c.report_count) as total_signalements
FROM users u
JOIN comments c ON u.id = c.user_id
WHERE c.report_count > 0
GROUP BY u.id
ORDER BY total_signalements DESC
LIMIT 10;
```

---

## 🛡️ Sécurité

### Protection contre les abus

**Limitation de signalement** (à implémenter) :

```javascript
// Empêcher un utilisateur de signaler plusieurs fois le même contenu
async reportPrompt(id, userId, reason = null) {
  // Vérifier dans une table de tracking
  const alreadyReported = await ReportTracking.findOne({
    where: { 
      userId, 
      promptId: id,
      type: 'prompt'
    }
  });
  
  if (alreadyReported) {
    throw new Error('Vous avez déjà signalé ce prompt');
  }
  
  // Enregistrer le signalement
  await ReportTracking.create({
    userId,
    promptId: id,
    type: 'prompt',
    reason
  });
  
  // Incrémenter le compteur
  const updatedPrompt = await promptRepository.reportPrompt(id);
  
  return { message: "Prompt signalé avec succès", reportCount: updatedPrompt.reportCount };
}
```

### Table de tracking (optionnel)

```javascript
// Migration pour créer la table report_tracking
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('report_tracking', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      promptId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'prompts', key: 'id' }
      },
      commentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'comments', key: 'id' }
      },
      type: {
        type: Sequelize.ENUM('prompt', 'comment'),
        allowNull: false
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
    
    // Index pour éviter les doublons
    await queryInterface.addIndex('report_tracking', ['userId', 'promptId', 'type'], {
      unique: true,
      name: 'unique_user_prompt_report'
    });
  }
};
```

---

## 🔄 Invalidation du cache

**Après chaque signalement** :
- ✅ Cache des prompts publics invalidé
- ✅ Cache du leaderboard invalidé
- ✅ Force le rechargement des données

**Méthode utilisée** :
```javascript
await this._invalidateCache();
```

---

## 📱 Intégration frontend

### Exemple React

```jsx
import { useState } from 'react';
import axios from 'axios';

function ReportButton({ promptId, type = 'prompt' }) {
  const [isReporting, setIsReporting] = useState(false);
  const [reason, setReason] = useState('');

  const handleReport = async () => {
    setIsReporting(true);
    try {
      const endpoint = type === 'prompt' 
        ? `/api/prompts/${promptId}/report`
        : `/api/prompts/comments/${promptId}/report`;
        
      const response = await axios.post(endpoint, 
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(response.data.message);
    } catch (error) {
      alert('Erreur lors du signalement');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div>
      <textarea 
        placeholder="Raison du signalement (optionnel)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button onClick={handleReport} disabled={isReporting}>
        {isReporting ? 'Signalement...' : '🚩 Signaler'}
      </button>
    </div>
  );
}
```

---

## 📚 Résumé des endpoints

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/prompts/:id/report` | ✅ | Signaler un prompt |
| POST | `/api/prompts/comments/:id/report` | ✅ | Signaler un commentaire |

---

## ✅ Checklist de mise en production

- [ ] Exécuter les migrations
- [ ] Tester les endpoints avec Postman
- [ ] Implémenter la limitation anti-spam (optionnel)
- [ ] Créer un dashboard admin pour la modération
- [ ] Configurer les notifications email
- [ ] Définir les seuils de modération automatique
- [ ] Documenter l'API dans Swagger
- [ ] Créer des tests unitaires
- [ ] Monitorer les logs de signalement

---

**Date de création** : 5 octobre 2025  
**Version** : 1.0.0  
**Auteur** : Équipe Zeprompt
