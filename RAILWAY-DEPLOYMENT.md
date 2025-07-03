# 🚀 Déploiement Railway - Guide Complet

Railway est une plateforme de déploiement moderne, simple et **très abordable** (~$5/mois) pour déployer ton application de gestion de tickets.

## 💰 **Avantages Railway vs AWS**

| Aspect | Railway | AWS |
|--------|---------|-----|
| **Prix** | $5/mois | $25-40/mois |
| **Complexité** | Très simple | Complexe |
| **Configuration** | Automatique | Manuelle |
| **Base de données** | Incluse | Payante |
| **HTTPS** | Automatique | Configuration requise |

## 📋 **Prérequis**

1. **Compte GitHub** (pour connecter ton repo)
2. **Compte Railway** : https://railway.app/
3. **Railway CLI** (optionnel, pour déploiement local)

## 🚀 **Méthode 1 : Déploiement via Interface Web (Recommandé)**

### Étape 1 : Préparer ton code
```bash
# Assure-toi que ton code est sur GitHub
git add .
git commit -m "Prêt pour déploiement Railway"
git push origin main
```

### Étape 2 : Connecter à Railway
1. Va sur https://railway.app/
2. Clique sur "Start a New Project"
3. Choisis "Deploy from GitHub repo"
4. Sélectionne ton repository
5. Clique sur "Deploy Now"

### Étape 3 : Configuration automatique
Railway va automatiquement :
- ✅ Détecter que c'est une app Node.js
- ✅ Installer les dépendances
- ✅ Construire l'application React
- ✅ Démarrer le serveur
- ✅ Générer une URL HTTPS

## 🛠️ **Méthode 2 : Déploiement via CLI**

### Installation Railway CLI
```powershell
# Installer Railway CLI
npm install -g @railway/cli

# Ou télécharger depuis : https://railway.app/cli
```

### Configuration
```powershell
# Se connecter à Railway
railway login

# Initialiser le projet
railway init

# Déployer
.\deploy-railway.ps1
```

## 🔧 **Configuration des variables d'environnement**

Dans l'interface Railway, va dans ton projet → Variables :

```env
NODE_ENV=production
JWT_SECRET=votre-super-secret-jwt-key-change-this
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app-gmail
```

## 🌐 **Accès à l'application**

Après le déploiement, ton application sera accessible sur :
```
https://votre-app-name.railway.app
```

### Comptes de test disponibles :
- **Admin** : admin@test.com / admin123
- **Technicien** : tech@test.com / tech123
- **Collaborateurs** : colab1@test.com à colab5@test.com / colab123

## 🔄 **Mises à jour**

### Via Interface Web
1. Pousse tes changements sur GitHub
2. Railway redéploie automatiquement

### Via CLI
```powershell
railway up
```

## 🛠️ **Commandes utiles**

```powershell
# Voir le statut
railway status

# Voir les logs
railway logs

# Ouvrir l'application
railway open

# Variables d'environnement
railway variables

# Redémarrer
railway restart
```

## 🔍 **Dépannage**

### Erreur de build
```powershell
# Voir les logs détaillés
railway logs --tail
```

### Erreur de port
- Railway utilise automatiquement `process.env.PORT`
- Le code est déjà configuré pour ça

### Erreur de base de données
- Railway fournit PostgreSQL automatiquement
- Pour SQLite, les fichiers sont persistants

## 💰 **Coûts Railway**

### Plan Gratuit (Développement)
- ✅ 500 heures/mois
- ✅ 1GB de stockage
- ✅ Déploiements illimités
- ❌ Pas de domaine personnalisé

### Plan Pro ($5/mois)
- ✅ Heures illimitées
- ✅ 10GB de stockage
- ✅ Domaine personnalisé
- ✅ Support prioritaire

## 🔒 **Sécurité**

### Recommandations
1. **Changer les mots de passe** après le premier déploiement
2. **HTTPS automatique** (inclus)
3. **Variables d'environnement** sécurisées
4. **Sauvegardes automatiques** (incluses)

## 📞 **Support**

- **Documentation** : https://docs.railway.app/
- **Discord** : https://discord.gg/railway
- **Email** : support@railway.app

## 🎯 **Avantages pour ton projet**

✅ **Prix** : 5x moins cher qu'AWS  
✅ **Simplicité** : Déploiement en 2 clics  
✅ **Performance** : CDN global automatique  
✅ **Sécurité** : HTTPS + variables sécurisées  
✅ **Monitoring** : Logs et métriques inclus  
✅ **Base de données** : PostgreSQL gratuit  

## 🚀 **Prêt à déployer ?**

1. **Pousse ton code sur GitHub**
2. **Va sur Railway.app**
3. **Connecte ton repo**
4. **Configure les variables d'environnement**
5. **C'est tout !** 🎉 