# Script de déploiement AWS Elastic Beanstalk pour Windows
Write-Host "🚀 Déploiement sur AWS Elastic Beanstalk..." -ForegroundColor Green

# Vérifier que l'EB CLI est installé
try {
    $null = Get-Command eb -ErrorAction Stop
    Write-Host "✅ EB CLI trouvé" -ForegroundColor Green
} catch {
    Write-Host "❌ EB CLI n'est pas installé. Installez-le avec: pip install awsebcli" -ForegroundColor Red
    exit 1
}

# Construire l'application React
Write-Host "📦 Construction de l'application React..." -ForegroundColor Yellow
Set-Location client
npm run build
Set-Location ..

# Initialiser EB si ce n'est pas déjà fait
if (-not (Test-Path ".elasticbeanstalk/config.yml")) {
    Write-Host "🔧 Initialisation d'Elastic Beanstalk..." -ForegroundColor Yellow
    eb init
}

# Déployer l'application
Write-Host "🌐 Déploiement de l'application..." -ForegroundColor Yellow
eb deploy

Write-Host "✅ Déploiement terminé !" -ForegroundColor Green
Write-Host "🌍 Votre application est accessible sur: $(eb status | Select-String 'CNAME' | ForEach-Object { $_.ToString().Split()[1] })" -ForegroundColor Cyan 