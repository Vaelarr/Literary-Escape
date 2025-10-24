@echo off
REM PHP PDO MySQL Driver Fix Script
REM This script helps diagnose and fix PDO MySQL driver issues

echo ================================================
echo PHP PDO MySQL DRIVER FIX
echo ================================================
echo.

REM Check PHP version and location
echo Checking PHP installation...
php --version
echo.

REM Check if running from XAMPP
php -r "echo 'PHP Config File: ' . php_ini_loaded_file() . PHP_EOL;"
echo.

REM Check available PDO drivers
echo Checking available PDO drivers...
php -r "print_r(PDO::getAvailableDrivers());"
echo.

REM Check if MySQL extension is loaded
echo Checking MySQL extensions...
php -m | findstr /i "pdo mysql"
echo.

echo ================================================
echo DIAGNOSIS COMPLETE
echo ================================================
echo.
echo If you see "pdo_mysql" in the list above, the driver is enabled.
echo If NOT, you need to enable it in php.ini
echo.
echo QUICK FIX OPTIONS:
echo.
echo Option 1: Enable in php.ini (RECOMMENDED)
echo   1. Find php.ini location (shown above)
echo   2. Open php.ini in a text editor
echo   3. Find these lines and remove the semicolon (;) at the start:
echo      ;extension=pdo_mysql
echo      ;extension=mysqli
echo   4. Save the file
echo   5. Restart Apache in XAMPP
echo   6. Run setup.php again
echo.
echo Option 2: Use XAMPP PHP directly
echo   Run: C:\xampp\php\php.exe setup.php
echo   (Adjust path if XAMPP is installed elsewhere)
echo.
echo Option 3: Run auto-fix (attempts to enable extensions)
echo   Press 'A' to auto-fix, or any other key to exit
echo.

choice /C AX /N /M "Press A for Auto-fix, X to exit: "
if errorlevel 2 goto :EOF
if errorlevel 1 goto :AUTOFIX

:AUTOFIX
echo.
echo Attempting auto-fix...
echo.

REM Try to find php.ini
for %%i in (
    "C:\xampp\php\php.ini"
    "C:\xampp\php\php.ini-development"
    "%PROGRAMFILES%\xampp\php\php.ini"
    "%PROGRAMFILES(X86)%\xampp\php\php.ini"
) do (
    if exist %%i (
        echo Found php.ini at: %%i
        echo.
        echo Creating backup...
        copy %%i %%i.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
        echo.
        echo Enabling PDO MySQL extension...
        powershell -Command "(Get-Content %%i) -replace ';extension=pdo_mysql', 'extension=pdo_mysql' | Set-Content %%i"
        powershell -Command "(Get-Content %%i) -replace ';extension=mysqli', 'extension=mysqli' | Set-Content %%i"
        echo.
        echo Done! Please restart Apache in XAMPP and run setup.php again.
        goto :DONE
    )
)

echo Could not find php.ini automatically.
echo Please enable extensions manually.

:DONE
echo.
pause
