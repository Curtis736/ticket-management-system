# Script de configuration AWS pour le déploiement sur Windows
Write-Host "🔧 Configuration AWS pour le déploiement..." -ForegroundColor Green

# Vérifier que AWS CLI est installé
try {
    $null = Get-Command aws -ErrorAction Stop
    Write-Host "✅ AWS CLI trouvé" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI n'est pas installé." -ForegroundColor Red
    Write-Host "📥 Installez AWS CLI depuis: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Vérifier que EB CLI est installé
try {
    $null = Get-Command eb -ErrorAction Stop
    Write-Host "✅ EB CLI trouvé" -ForegroundColor Green
} catch {
    Write-Host "📥 Installation d'EB CLI..." -ForegroundColor Yellow
    pip install awsebcli
}

# Configuration AWS
Write-Host "🔑 Configuration AWS CLI..." -ForegroundColor Yellow
Write-Host "Veuillez entrer vos informations AWS:" -ForegroundColor Cyan
Write-Host ""

# Demander les informations AWS
$aws_access_key = Read-Host "AWS Access Key ID"
$aws_secret_key = Read-Host "AWS Secret Access Key" -AsSecureString
$aws_region = Read-Host "Région AWS (ex: us-east-1, eu-west-1)"

# Convertir le SecureString en texte
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($aws_secret_key)
$aws_secret_key_plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Configurer AWS CLI
aws configure set aws_access_key_id $aws_access_key
aws configure set aws_secret_access_key $aws_secret_key_plain
aws configure set default.region $aws_region
aws configure set default.output json

Write-Host "✅ Configuration AWS terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Modifiez les variables d'environnement dans .ebextensions/02_environment.config" -ForegroundColor Yellow
Write-Host "2. Lancez le déploiement avec: .\deploy-aws.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Variables à configurer:" -ForegroundColor Cyan
Write-Host "  - JWT_SECRET: Clé secrète pour JWT" -ForegroundColor Yellow
Write-Host "  - EMAIL_USER: Email Gmail pour les notifications" -ForegroundColor Yellow
Write-Host "  - EMAIL_PASS: Mot de passe d'application Gmail" -ForegroundColor Yellow 