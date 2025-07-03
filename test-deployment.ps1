# Script de test pour vérifier la configuration avant déploiement
Write-Host "🧪 Test de configuration avant déploiement..." -ForegroundColor Green

$errors = @()

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non trouvé" -ForegroundColor Red
    $errors += "Node.js"
}

# Vérifier npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm non trouvé" -ForegroundColor Red
    $errors += "npm"
}

# Vérifier AWS CLI
try {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI non trouvé" -ForegroundColor Red
    $errors += "AWS CLI"
}

# Vérifier EB CLI
try {
    $ebVersion = eb --version
    Write-Host "✅ EB CLI: $ebVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ EB CLI non trouvé" -ForegroundColor Red
    $errors += "EB CLI"
}

# Vérifier les dépendances
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow

# Vérifier les dépendances du serveur
if (Test-Path "server/node_modules") {
    Write-Host "✅ Dépendances serveur installées" -ForegroundColor Green
} else {
    Write-Host "❌ Dépendances serveur manquantes" -ForegroundColor Red
    $errors += "Dépendances serveur"
}

# Vérifier les dépendances du client
if (Test-Path "client/node_modules") {
    Write-Host "✅ Dépendances client installées" -ForegroundColor Green
} else {
    Write-Host "❌ Dépendances client manquantes" -ForegroundColor Red
    $errors += "Dépendances client"
}

# Vérifier le build React
if (Test-Path "client/build") {
    Write-Host "✅ Build React trouvé" -ForegroundColor Green
} else {
    Write-Host "⚠️  Build React manquant - sera construit lors du déploiement" -ForegroundColor Yellow
}

# Vérifier les fichiers de configuration
$configFiles = @(
    ".ebextensions/01_nodecommand.config",
    ".ebextensions/02_environment.config",
    ".ebextensions/03_node_modules.config",
    "Dockerfile",
    "docker-compose.yml"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file manquant" -ForegroundColor Red
        $errors += $file
    }
}

# Résumé
Write-Host ""
if ($errors.Count -eq 0) {
    Write-Host "🎉 Configuration OK ! Prêt pour le déploiement." -ForegroundColor Green
    Write-Host "🚀 Lancez: .\deploy-aws.ps1" -ForegroundColor Cyan
} else {
    Write-Host "❌ Problèmes détectés:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "  - $err" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "🔧 Actions à effectuer:" -ForegroundColor Yellow
    if ($errors -contains "Node.js") {
        Write-Host "  - Installer Node.js: winget install OpenJS.NodeJS" -ForegroundColor Yellow
    }
    if ($errors -contains "AWS CLI") {
        Write-Host "  - Installer AWS CLI: winget install Amazon.AWSCLI" -ForegroundColor Yellow
    }
    if ($errors -contains "EB CLI") {
        Write-Host "  - Installer EB CLI: pip install awsebcli" -ForegroundColor Yellow
    }
    if ($errors -contains "Dépendances serveur") {
        Write-Host "  - Installer dépendances serveur: cd server; npm install; cd .." -ForegroundColor Yellow
    }
    if ($errors -contains "Dépendances client") {
        Write-Host "  - Installer dépendances client: cd client; npm install; cd .." -ForegroundColor Yellow
    }
} 