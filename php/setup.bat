@echo off
REM Quick Start Script for PHP Backend Setup
REM Run this file by double-clicking or from command prompt

echo ================================================
echo LITERARY ESCAPE - PHP BACKEND QUICK SETUP
echo ================================================
echo.

REM Check if PHP is available
php --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: PHP is not installed or not in PATH
    echo.
    echo Please install XAMPP and ensure PHP is in your system PATH
    echo Or run this script from XAMPP's PHP directory
    echo.
    pause
    exit /b 1
)

echo PHP is installed!
php --version
echo.

REM Navigate to PHP directory
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Run the setup script
echo Running setup script...
echo ================================================
php setup.php
echo ================================================
echo.

REM Check if setup was successful
if errorlevel 1 (
    echo.
    echo ERROR: Setup failed!
    echo Please check the error messages above.
    echo.
    echo Common issues:
    echo 1. XAMPP MySQL is not running
    echo 2. Database 'literary_escape' does not exist
    echo 3. Wrong database credentials in config.php
    echo.
) else (
    echo.
    echo SUCCESS! Setup completed successfully!
    echo.
    echo You can now:
    echo 1. Access test page: http://localhost/php/test.php
    echo 2. Test API: http://localhost/php/api/test-db
    echo 3. Start using the backend with your frontend
    echo.
)

echo.
echo Press any key to exit...
pause >nul
