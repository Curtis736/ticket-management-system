#!/bin/bash

# Script de configuration AWS pour le déploiement
echo "🔧 Configuration AWS pour le déploiement..."

# Vérifier que AWS CLI est installé
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI n'est pas installé."
    echo "📥 Installez AWS CLI depuis: https://aws.amazon.com/cli/"
    exit 1
fi

# Vérifier que EB CLI est installé
if ! command -v eb &> /dev/null; then
    echo "📥 Installation d'EB CLI..."
    pip install awsebcli
fi

# Configuration AWS
echo "🔑 Configuration AWS CLI..."
echo "Veuillez entrer vos informations AWS:"
echo ""

# Demander les informations AWS
read -p "AWS Access Key ID: " aws_access_key
read -s -p "AWS Secret Access Key: " aws_secret_key
echo ""
read -p "Région AWS (ex: us-east-1, eu-west-1): " aws_region

# Configurer AWS CLI
aws configure set aws_access_key_id $aws_access_key
aws configure set aws_secret_access_key $aws_secret_key
aws configure set default.region $aws_region
aws configure set default.output json

echo "✅ Configuration AWS terminée !"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Modifiez les variables d'environnement dans .ebextensions/02_environment.config"
echo "2. Lancez le déploiement avec: ./deploy-aws.sh"
echo ""
echo "🔧 Variables à configurer:"
echo "  - JWT_SECRET: Clé secrète pour JWT"
echo "  - EMAIL_USER: Email Gmail pour les notifications"
echo "  - EMAIL_PASS: Mot de passe d'application Gmail" 