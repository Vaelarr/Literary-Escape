# MySQL Configuration Script for Literary Escape
# This script helps you configure the correct MySQL credentials

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "MYSQL CREDENTIALS CONFIGURATION" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Common MySQL default passwords:" -ForegroundColor Yellow
Write-Host "  - XAMPP: Usually empty (no password)" -ForegroundColor Gray
Write-Host "  - WAMP: Usually 'root' or empty" -ForegroundColor Gray
Write-Host "  - Custom: Check your MySQL configuration" -ForegroundColor Gray
Write-Host ""

# Get credentials
$dbUser = Read-Host "Enter MySQL username (default: root)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "root" }

$dbPassSecure = Read-Host "Enter MySQL password (press Enter if empty)" -AsSecureString
$dbPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassSecure))

$dbName = Read-Host "Enter database name (default: literary_escape)"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "literary_escape" }

Write-Host ""
Write-Host "Testing connection..." -ForegroundColor Yellow
Write-Host "  Host: localhost"
Write-Host "  User: $dbUser"
Write-Host "  Database: $dbName"
Write-Host ""

# Test connection
$testScript = @"
try {
    `$pdo = new PDO('mysql:host=localhost;charset=utf8mb4', '$dbUser', '$dbPass');
    echo 'SUCCESS';
} catch(PDOException `$e) {
    echo 'ERROR: ' . `$e->getMessage();
    exit(1);
}
"@

$result = php -r $testScript 2>&1

if ($LASTEXITCODE -eq 0 -and $result -like "*SUCCESS*") {
    Write-Host "✅ Connection successful!" -ForegroundColor Green
    Write-Host ""
    
    # Backup config.php
    if (Test-Path "config.php") {
        $backupName = "config.php.backup." + (Get-Date -Format "yyyyMMdd_HHmmss")
        Copy-Item "config.php" $backupName
        Write-Host "✅ Backup created: $backupName" -ForegroundColor Green
    }
    
    # Update config.php
    $configContent = Get-Content "config.php" -Raw
    $configContent = $configContent -replace "define\('DB_USER', '.*?'\);", "define('DB_USER', '$dbUser');"
    $configContent = $configContent -replace "define\('DB_PASS', '.*?'\);", "define('DB_PASS', '$dbPass');"
    $configContent = $configContent -replace "define\('DB_NAME', '.*?'\);", "define('DB_NAME', '$dbName');"
    Set-Content "config.php" $configContent
    
    Write-Host "✅ Configuration updated in config.php" -ForegroundColor Green
    Write-Host ""
    
    # Offer to create database
    $createDb = Read-Host "Create database '$dbName' now? (Y/N)"
    if ($createDb -eq "Y" -or $createDb -eq "y") {
        Write-Host ""
        Write-Host "Creating database..." -ForegroundColor Yellow
        
        $createDbScript = @"
try {
    `$pdo = new PDO('mysql:host=localhost;charset=utf8mb4', '$dbUser', '$dbPass');
    `$pdo->exec('CREATE DATABASE IF NOT EXISTS $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    echo 'Database created successfully!';
} catch(PDOException `$e) {
    echo 'Error: ' . `$e->getMessage();
    exit(1);
}
"@
        
        $dbResult = php -r $createDbScript 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $dbResult" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to create database: $dbResult" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "CONFIGURATION COMPLETE!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next step: Run setup script" -ForegroundColor Yellow
    Write-Host "  php setup.php" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "❌ Connection FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $result -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Wrong password - Check XAMPP/MySQL configuration" -ForegroundColor Gray
    Write-Host "  2. MySQL not running - Start MySQL in XAMPP Control Panel" -ForegroundColor Gray
    Write-Host "  3. Wrong username - Try 'root' or check your MySQL setup" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To reset MySQL password in XAMPP:" -ForegroundColor Yellow
    Write-Host "  1. Stop MySQL in XAMPP" -ForegroundColor Gray
    Write-Host "  2. Open XAMPP Shell" -ForegroundColor Gray
    Write-Host "  3. Run: mysqladmin -u root password" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Read-Host "Press Enter to exit"
