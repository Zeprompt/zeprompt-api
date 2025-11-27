# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation complète pour l'open-source
- Guide de contribution (CONTRIBUTING.md)
- Code de conduite (CODE_OF_CONDUCT.md)
- Politique de sécurité (SECURITY.md)
- Templates GitHub pour issues et pull requests
- Licence MIT
- README.md enrichi avec badges et documentation

## [1.0.0] - 2025-11-27

### Added
- Gestion complète des utilisateurs avec authentification JWT
- Système de prompts (texte et PDF)
- Upload et optimisation automatique d'images
- Système de tags pour catégorisation
- Système de likes et de vues
- Système de commentaires avec signalements
- Versioning des prompts
- Intégration Cloudflare R2 pour le stockage
- Cache Redis pour optimisation
- Job queues avec BullMQ
- Workers asynchrones pour traitement de fichiers
- Emails transactionnels (vérification, reset password, welcome)
- Documentation Swagger/OpenAPI
- Rate limiting et sécurité (Helmet.js, CORS)
- Logging avec Winston
- Migrations et seeders Sequelize
- ESLint avec Husky hooks
- Scripts de migration vers R2
- Collection Postman pour tests

### Security
- Hachage bcrypt pour les mots de passe
- Tokens JWT avec expiration
- Validation Zod des entrées
- Protection contre injections SQL
- Headers de sécurité HTTP
- CORS configuré avec whitelist

---

## Types de changements

- `Added` : Nouvelles fonctionnalités
- `Changed` : Modifications de fonctionnalités existantes
- `Deprecated` : Fonctionnalités bientôt supprimées
- `Removed` : Fonctionnalités supprimées
- `Fixed` : Corrections de bugs
- `Security` : Corrections de vulnérabilités
