# 🚀 Guide de Déploiement AWS

Ce guide vous accompagne étape par étape pour déployer votre application de gestion de tickets sur AWS Elastic Beanstalk.

## 📋 Prérequis

### 1. Compte AWS
- Créer un compte AWS : https://aws.amazon.com/
- Activer l'authentification à 2 facteurs
- Créer un utilisateur IAM avec les permissions suivantes :
  - `AWSElasticBeanstalkFullAccess`
  - `AWSElasticBeanstalkService`

### 2. Outils à installer

#### AWS CLI
```powershell
# Windows (avec winget)
winget install Amazon.AWSCLI

# Ou télécharger depuis : https://aws.amazon.com/cli/
```

#### EB CLI (Elastic Beanstalk CLI)
```powershell
pip install awsebcli
```

#### Python (si pas installé)
```powershell
winget install Python.Python.3.11
```

## 🔧 Configuration

### Étape 1 : Configuration AWS CLI

Exécutez le script de configuration :
```powershell
.\aws-setup.ps1
```

Vous devrez fournir :
- **AWS Access Key ID** : Clé d'accès de votre utilisateur IAM
- **AWS Secret Access Key** : Clé secrète de votre utilisateur IAM
- **Région AWS** : Région où déployer (ex: `us-east-1`, `eu-west-1`)

### Étape 2 : Configuration des variables d'environnement

Modifiez le fichier `.ebextensions/02_environment.config` :

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    JWT_SECRET: votre-super-secret-jwt-key-change-this-in-production
    EMAIL_USER: votre-email@gmail.com
    EMAIL_PASS: votre-mot-de-passe-app-gmail
```

**Important** :
- `JWT_SECRET` : Une chaîne aléatoire de 32+ caractères
- `EMAIL_USER` : Votre email Gmail
- `EMAIL_PASS` : Mot de passe d'application Gmail (pas votre mot de passe normal)

### Étape 3 : Configuration Gmail (optionnel)

Pour activer les notifications email :

1. Aller sur https://myaccount.google.com/
2. Sécurité → Authentification à 2 facteurs → Mots de passe d'application
3. Générer un mot de passe pour "Mail"
4. Utiliser ce mot de passe dans `EMAIL_PASS`

## 🚀 Déploiement

### Étape 1 : Vérification

Vérifiez que tout est prêt :
```powershell
# Vérifier AWS CLI
aws --version

# Vérifier EB CLI
eb --version

# Construire l'application
cd client; npm run build; cd ..
```

### Étape 2 : Déploiement

Lancez le déploiement :
```powershell
.\deploy-aws.ps1
```

Le script va :
1. ✅ Construire l'application React
2. 🔧 Initialiser Elastic Beanstalk (première fois)
3. 🌐 Déployer l'application
4. 📋 Afficher l'URL de votre application

### Étape 3 : Configuration Elastic Beanstalk (première fois)

Lors de la première exécution, `eb init` vous demandera :

```
Select a default region
1) us-east-1 : US East (N. Virginia)
2) us-west-1 : US West (N. California)
3) us-west-2 : US West (Oregon)
4) eu-west-1 : Europe (Ireland)
5) eu-central-1 : Europe (Frankfurt)
(default is 3): 4

Select an application to use
1) [ Create new Application ]
(default is 1): 1

Enter Application Name
(default is "ticket-cedric"): ticket-management-system

Do you want to set up SSH for your instances?
(Y/n): n
```

## 🌐 Accès à l'application

Après le déploiement, votre application sera accessible sur :
```
https://votre-app.elasticbeanstalk.com
```

### Comptes de test disponibles :
- **Admin** : admin@test.com / admin123
- **Technicien** : tech@test.com / tech123
- **Collaborateurs** : colab1@test.com à colab5@test.com / colab123

## 🔄 Mises à jour

Pour déployer une nouvelle version :

```powershell
# Modifier le code
# Puis déployer
.\deploy-aws.ps1
```

## 🛠️ Commandes utiles

### Gestion de l'application
```powershell
# Voir le statut
eb status

# Voir les logs
eb logs

# Ouvrir l'application
eb open

# Terminer l'environnement
eb terminate
```

### Gestion des variables d'environnement
```powershell
# Voir les variables
eb printenv

# Définir une variable
eb setenv JWT_SECRET=nouvelle-cle

# Supprimer une variable
eb unsetenv JWT_SECRET
```

## 🔍 Dépannage

### Erreur "EB CLI not found"
```powershell
pip install awsebcli
```

### Erreur "AWS CLI not found"
```powershell
winget install Amazon.AWSCLI
```

### Erreur de permissions
- Vérifiez que votre utilisateur IAM a les bonnes permissions
- Vérifiez que vos clés AWS sont correctes

### Erreur de build
```powershell
# Nettoyer et reconstruire
cd client
rm -rf node_modules build
npm install
npm run build
cd ..
```

### Erreur de déploiement
```powershell
# Voir les logs détaillés
eb logs --all
```

## 💰 Coûts AWS

**Estimation mensuelle** (pour un usage basique) :
- Elastic Beanstalk : ~$20-30/mois
- Données : ~$5-10/mois
- **Total estimé** : ~$25-40/mois

**Pour réduire les coûts** :
- Utiliser des instances t3.micro
- Configurer l'arrêt automatique en dehors des heures de travail
- Utiliser AWS Free Tier (12 mois gratuits)

## 🔒 Sécurité

### Recommandations
1. **Changer les mots de passe par défaut** après le premier déploiement
2. **Utiliser HTTPS** (activé par défaut sur Elastic Beanstalk)
3. **Configurer un domaine personnalisé** si nécessaire
4. **Sauvegarder régulièrement** la base de données

### Variables sensibles
- `JWT_SECRET` : Changez la valeur par défaut
- `EMAIL_PASS` : Utilisez un mot de passe d'application Gmail
- Ne committez jamais ces valeurs dans Git

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `eb logs`
2. Consultez la documentation AWS Elastic Beanstalk
3. Vérifiez les permissions IAM
4. Testez localement avant de déployer 