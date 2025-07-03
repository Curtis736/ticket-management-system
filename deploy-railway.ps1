# Script de déploiement Railway
Write-Host "🚀 Déploiement sur Railway..." -ForegroundColor Green

# Vérifier que Railway CLI est installé
try {
    $null = Get-Command railway -ErrorAction Stop
    Write-Host "✅ Railway CLI trouvé" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI n'est pas installé." -ForegroundColor Red
    Write-Host "📥 Installez Railway CLI avec: npm install -g @railway/cli" -ForegroundColor Yellow
    Write-Host "🔗 Ou téléchargez depuis: https://railway.app/cli" -ForegroundColor Yellow
    exit 1
}

# Vérifier que l'utilisateur est connecté
try {
    $user = railway whoami
    Write-Host "✅ Connecté à Railway en tant que: $user" -ForegroundColor Green
} catch {
    Write-Host "❌ Non connecté à Railway" -ForegroundColor Red
    Write-Host "🔑 Connectez-vous avec: railway login" -ForegroundColor Yellow
    exit 1
}

# Construire l'application React
Write-Host "📦 Construction de l'application React..." -ForegroundColor Yellow
cd client
npm run build
cd ..

# Déployer sur Railway
Write-Host "🌐 Déploiement sur Railway..." -ForegroundColor Yellow
railway up

Write-Host "✅ Déploiement terminé !" -ForegroundColor Green
Write-Host "🌍 Votre application est accessible sur: $(railway status | Select-String 'URL' | ForEach-Object { $_.ToString().Split()[1] })" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Commandes utiles:" -ForegroundColor Yellow
Write-Host "  - Voir les logs: railway logs" -ForegroundColor White
Write-Host "  - Ouvrir l'app: railway open" -ForegroundColor White
Write-Host "  - Voir le statut: railway status" -ForegroundColor White 