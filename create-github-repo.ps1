# Script pour créer le repository GitHub
Write-Host "🔧 Création du repository GitHub..." -ForegroundColor Green

Write-Host ""
Write-Host "📋 Étapes à suivre :" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Va sur https://github.com/new" -ForegroundColor Cyan
Write-Host "2. Repository name: ticket-management-system" -ForegroundColor White
Write-Host "3. Description: Système de gestion de tickets avec estimation de temps" -ForegroundColor White
Write-Host "4. Public ou Private (selon tes préférences)" -ForegroundColor White
Write-Host "5. NE PAS cocher 'Add a README file' (nous en avons déjà un)" -ForegroundColor White
Write-Host "6. Clique 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "Une fois le repository créé, copie l'URL et lance:" -ForegroundColor Yellow
Write-Host "git remote add origin https://github.com/TON-USERNAME/ticket-management-system.git" -ForegroundColor Cyan
Write-Host "git branch -M main" -ForegroundColor Cyan
Write-Host "git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "Puis va sur https://railway.app/ pour déployer !" -ForegroundColor Green 