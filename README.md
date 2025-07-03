# Système de Gestion de Tickets

Application web complète pour la gestion de tickets d'entreprise avec authentification, rôles utilisateurs et notifications par email.

## 🚀 Déploiement sur AWS

### Prérequis

1. **Compte AWS** avec accès aux services suivants :
   - Elastic Beanstalk
   - IAM (pour les clés d'accès)

2. **Outils installés** :
   - AWS CLI
   - EB CLI (Elastic Beanstalk CLI)
   - Node.js et npm

### Installation des outils

#### AWS CLI
```bash
# Windows (avec winget)
winget install Amazon.AWSCLI

# Ou télécharger depuis https://aws.amazon.com/cli/
```

#### EB CLI
```bash
pip install awsebcli
```

### Configuration

1. **Configurer AWS** :
```bash
./aws-setup.sh
```

2. **Modifier les variables d'environnement** dans `.ebextensions/02_environment.config` :
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    JWT_SECRET: votre-clé-secrète-jwt
    EMAIL_USER: votre-email@gmail.com
    EMAIL_PASS: votre-mot-de-passe-app-gmail
```

### Déploiement

```bash
# Déployer sur AWS Elastic Beanstalk
./deploy-aws.sh
```

### Accès à l'application

Après le déploiement, votre application sera accessible sur :
```
https://votre-app.elasticbeanstalk.com
```

## 🛠️ Développement Local

### Installation

```bash
# Installer toutes les dépendances
npm run install-all
```

### Démarrage

```bash
# Démarrer en mode développement
npm run dev
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000

### Comptes de test

- **Admin** : admin@test.com / admin123
- **Technicien** : tech@test.com / tech123
- **Collaborateurs** : colab1@test.com à colab5@test.com / colab123

## 📋 Fonctionnalités

### Pour tous les utilisateurs
- ✅ Authentification sécurisée
- ✅ Création de tickets
- ✅ Visualisation des tickets
- ✅ Filtrage et recherche

### Pour les admins
- ✅ Gestion complète des tickets
- ✅ Modification du statut des tickets
- ✅ **Estimation du temps de résolution**
- ✅ Assignation des tickets
- ✅ Statistiques détaillées
- ✅ Gestion des utilisateurs

### Pour les techniciens
- ✅ Modification du statut des tickets
- ✅ **Estimation du temps de résolution**
- ✅ Visualisation des tickets assignés

## 🔧 Configuration Email

Pour activer les notifications par email :

1. Créer un compte Gmail
2. Activer l'authentification à 2 facteurs
3. Générer un mot de passe d'application
4. Configurer les variables d'environnement :
   - `EMAIL_USER` : votre email Gmail
   - `EMAIL_PASS` : mot de passe d'application

## 🐳 Déploiement avec Docker

```bash
# Construire et démarrer avec Docker Compose
docker-compose up --build
```

## 📁 Structure du projet

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   └── contexts/       # Contextes React
│   └── public/
├── server/                 # Backend Node.js/Express
│   ├── routes/            # Routes API
│   ├── services/          # Services (email, etc.)
│   └── database/          # Configuration base de données
├── .ebextensions/         # Configuration AWS Elastic Beanstalk
├── Dockerfile             # Configuration Docker
└── docker-compose.yml     # Configuration Docker Compose
```

## 🔒 Sécurité

- Authentification JWT
- Rate limiting
- Helmet.js pour la sécurité
- Validation des données
- Protection CORS

## 📊 Base de données

SQLite avec les tables :
- `users` : Utilisateurs et rôles
- `tickets` : Tickets avec statuts et priorités

## 🚀 Technologies utilisées

- **Frontend** : React, Material-UI
- **Backend** : Node.js, Express
- **Base de données** : SQLite
- **Authentification** : JWT
- **Email** : Nodemailer
- **Déploiement** : AWS Elastic Beanstalk 