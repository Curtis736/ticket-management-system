#!/bin/bash

# Script de déploiement AWS Elastic Beanstalk
echo "🚀 Déploiement sur AWS Elastic Beanstalk..."

# Vérifier que l'EB CLI est installé
if ! command -v eb &> /dev/null; then
    echo "❌ EB CLI n'est pas installé. Installez-le avec: pip install awsebcli"
    exit 1
fi

# Construire l'application React
echo "📦 Construction de l'application React..."
cd client
npm run build
cd ..

# Initialiser EB si ce n'est pas déjà fait
if [ ! -f ".elasticbeanstalk/config.yml" ]; then
    echo "🔧 Initialisation d'Elastic Beanstalk..."
    eb init
fi

# Déployer l'application
echo "🌐 Déploiement de l'application..."
eb deploy

echo "✅ Déploiement terminé !"
echo "🌍 Votre application est accessible sur: $(eb status | grep CNAME | awk '{print $2}')" 