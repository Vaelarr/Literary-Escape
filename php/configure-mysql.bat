@echo off
REM Interactive MySQL Configuration Script
REM This will help you configure the correct MySQL credentials

echo ================================================
echo MYSQL CREDENTIALS CONFIGURATION
echo ================================================
echo.

echo This script will help you configure MySQL credentials.
echo.
echo Common scenarios:
echo 1. Fresh XAMPP install - password is usually empty (just press Enter)
echo 2. Configured MySQL - enter your root password
echo 3. Different user - enter custom username and password
echo.

:ASK_USER
set /p DB_USER="Enter MySQL username (default: root): "
if "%DB_USER%"=="" set DB_USER=root

:ASK_PASSWORD
set /p DB_PASS="Enter MySQL password (press Enter if empty): "

:ASK_DATABASE
set /p DB_NAME="Enter database name (default: literary_escape): "
if "%DB_NAME%"=="" set DB_NAME=literary_escape

echo.
echo Testing connection with:
echo   Host: localhost
echo   User: %DB_USER%
echo   Password: %DB_PASS%
echo   Database: %DB_NAME%
echo.

REM Test the connection using PHP
php -r "try { $pdo = new PDO('mysql:host=localhost;charset=utf8mb4', '%DB_USER%', '%DB_PASS%'); echo 'SUCCESS: Connection works!\n'; } catch(PDOException $e) { echo 'ERROR: ' . $e->getMessage() . '\n'; exit(1); }"

if errorlevel 1 (
    echo.
    echo Connection FAILED. Please check your credentials.
    echo.
    set /p RETRY="Try again? (Y/N): "
    if /i "%RETRY%"=="Y" goto ASK_USER
    echo.
    echo Exiting without saving.
    pause
    exit /b 1
)

echo.
echo Connection successful!
echo.

REM Create backup of config.php
if exist config.php (
    echo Creating backup of config.php...
    copy config.php config.php.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2% >nul
    echo Backup created.
    echo.
)

REM Update config.php with correct credentials
echo Updating config.php...

powershell -Command "(Get-Content config.php) -replace \"define\('DB_USER', '.*?'\);\", \"define('DB_USER', '%DB_USER%');\" | Set-Content config.php.tmp"
powershell -Command "(Get-Content config.php.tmp) -replace \"define\('DB_PASS', '.*?'\);\", \"define('DB_PASS', '%DB_PASS%');\" | Set-Content config.php.tmp2"
powershell -Command "(Get-Content config.php.tmp2) -replace \"define\('DB_NAME', '.*?'\);\", \"define('DB_NAME', '%DB_NAME%');\" | Set-Content config.php"
del config.php.tmp >nul 2>&1
del config.php.tmp2 >nul 2>&1

echo Configuration updated!
echo.

echo ================================================
echo CONFIGURATION COMPLETE
echo ================================================
echo.
echo Updated credentials in config.php:
echo   User: %DB_USER%
echo   Database: %DB_NAME%
echo.
echo Next steps:
echo 1. Make sure database '%DB_NAME%' exists
echo 2. Run: php setup.php
echo.

set /p CREATE_DB="Create database '%DB_NAME%' now? (Y/N): "
if /i "%CREATE_DB%"=="Y" (
    echo.
    echo Creating database...
    php -r "$pdo = new PDO('mysql:host=localhost;charset=utf8mb4', '%DB_USER%', '%DB_PASS%'); $pdo->exec('CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'); echo 'Database created successfully!\n';"
    echo.
    echo Now run: php setup.php
) else (
    echo.
    echo Please create the database manually, then run: php setup.php
)

echo.
pause
