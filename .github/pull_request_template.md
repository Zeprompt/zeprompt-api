## 📋 Description

<!-- Décrivez vos changements de manière claire et concise -->

## 🔗 Issue liée

<!-- Référencez l'issue liée si applicable -->
Closes #(numéro de l'issue)

## 🎯 Type de changement

<!-- Cochez les cases appropriées -->

- [ ] 🐛 Bug fix (changement non-breaking qui corrige un bug)
- [ ] ✨ Nouvelle fonctionnalité (changement non-breaking qui ajoute une fonctionnalité)
- [ ] 💥 Breaking change (fix ou feature qui causerait un dysfonctionnement de fonctionnalités existantes)
- [ ] 📝 Documentation (changements uniquement dans la documentation)
- [ ] ♻️ Refactoring (ni fix ni feature)
- [ ] ⚡ Performance (amélioration des performances)
- [ ] ✅ Tests (ajout ou modification de tests)
- [ ] 🔧 Chore (mise à jour de dépendances, config, etc.)

## 🧪 Comment tester ?

<!-- Décrivez les étapes pour tester vos changements -->

1.
2.
3.

## 📸 Screenshots (si applicable)

<!-- Ajoutez des captures d'écran pour illustrer vos changements -->

## ✅ Checklist

<!-- Vérifiez toutes les cases avant de soumettre votre PR -->

### Code
- [ ] Mon code suit le style du projet (ESLint sans erreurs)
- [ ] J'ai exécuté `npm run lint` sans erreurs
- [ ] J'ai commenté les parties complexes de mon code
- [ ] Mon code ne génère pas de nouveaux warnings
- [ ] J'ai supprimé les console.log de debug

### Documentation
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] J'ai ajouté/mis à jour les commentaires JSDoc
- [ ] J'ai mis à jour la documentation Swagger pour les nouveaux endpoints

### Tests
- [ ] J'ai ajouté des tests qui prouvent que ma correction fonctionne
- [ ] J'ai ajouté des tests pour les nouvelles fonctionnalités
- [ ] Les tests existants passent localement
- [ ] J'ai testé avec différents scénarios (succès et erreurs)

### Base de données
- [ ] J'ai créé une migration si j'ai modifié le schéma de la base de données
- [ ] La migration est réversible (down fonctionne)
- [ ] J'ai testé la migration sur une base de données vierge

### Git
- [ ] Ma branche est à jour avec `dev`
- [ ] Mes commits suivent la convention [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] J'ai résolu tous les conflits de merge
- [ ] Ma branche part de `dev` (pas de `main` ou `prod`)

### Sécurité
- [ ] Mon code ne crée pas de failles de sécurité
- [ ] J'ai validé toutes les entrées utilisateur
- [ ] Je n'ai pas committé de secrets ou de credentials
- [ ] J'ai utilisé des pratiques sécurisées (pas d'injection SQL, XSS, etc.)

## 📝 Notes pour les reviewers

<!-- Ajoutez des informations importantes pour les reviewers -->

## 🚀 Déploiement

<!-- Cette PR nécessite-t-elle des actions spéciales pour le déploiement ? -->

- [ ] Nécessite des variables d'environnement supplémentaires
- [ ] Nécessite des migrations de base de données
- [ ] Nécessite des changements de configuration
- [ ] Nécessite une mise à jour de dépendances externes

<!-- Si oui, décrivez les actions nécessaires -->

## 📚 Ressources additionnelles

<!-- Liens vers des ressources, articles, ou documentations pertinentes -->
