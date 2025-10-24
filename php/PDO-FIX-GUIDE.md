# 🔧 PDO MySQL Driver Not Found - Fix Guide

## Error: "could not find driver"

This error means the PDO MySQL extension is not enabled in your PHP installation.

## 🚀 Quick Fix (Choose One Method)

### Method 1: Enable in php.ini (RECOMMENDED)

1. **Find your php.ini file:**
   ```powershell
   php --ini
   ```
   
2. **Open php.ini in a text editor** (as Administrator)

3. **Find and uncomment these lines** (remove the semicolon `;` at the start):
   ```ini
   ;extension=pdo_mysql
   ;extension=mysqli
   ```
   
   Change to:
   ```ini
   extension=pdo_mysql
   extension=mysqli
   ```

4. **Save the file**

5. **Restart Apache** in XAMPP Control Panel

6. **Run setup again:**
   ```powershell
   php setup.php
   ```

---

### Method 2: Use XAMPP's PHP Directly

If you have multiple PHP installations, use XAMPP's PHP:

```powershell
# Navigate to php folder
cd d:\Development\Websites\Literary-Escape\php

# Run setup with XAMPP's PHP
C:\xampp\php\php.exe setup.php
```

**Note:** Adjust the path if XAMPP is installed elsewhere:
- Common paths: `C:\xampp\php\php.exe` or `D:\xampp\php\php.exe`

---

### Method 3: Automated Fix Script

Run the automated fix script:

```powershell
# Double-click this file:
fix-pdo.bat

# Or run from PowerShell:
.\fix-pdo.bat
```

This script will:
- ✅ Detect your PHP installation
- ✅ Find php.ini location
- ✅ Show available PDO drivers
- ✅ Optionally enable extensions automatically
- ✅ Create backup before changes

---

## 🔍 Verify the Fix

After enabling the extension, verify it's working:

```powershell
# Check available PDO drivers
php -r "print_r(PDO::getAvailableDrivers());"

# Should show: Array ( [0] => mysql [1] => sqlite ... )
```

Or check loaded extensions:

```powershell
php -m | Select-String "pdo|mysql"

# Should show:
# pdo_mysql
# mysqli
```

---

## 📍 Common php.ini Locations

- **XAMPP Windows:** `C:\xampp\php\php.ini`
- **XAMPP Other Drive:** `D:\xampp\php\php.ini`
- **Standalone PHP:** Check with `php --ini`

---

## ⚠️ Troubleshooting

### Problem: Can't find php.ini

**Solution:** Check which php.ini is loaded:
```powershell
php -r "echo php_ini_loaded_file();"
```

### Problem: Extensions already uncommented but still not working

**Solution:** Check if the extension file exists:
```powershell
# Check for extension file
Test-Path C:\xampp\php\ext\php_pdo_mysql.dll
```

If it doesn't exist, your PHP installation might be incomplete. Reinstall XAMPP.

### Problem: Multiple PHP installations

**Solution:** Make sure you're using XAMPP's PHP:
```powershell
# Check which PHP you're using
Get-Command php | Select-Object Source

# Use XAMPP PHP explicitly
C:\xampp\php\php.exe setup.php
```

### Problem: Changes not taking effect

**Solution:** 
1. Restart Apache in XAMPP (not just stop/start, use restart)
2. Check you edited the correct php.ini
3. Verify changes were saved
4. Run PHP from command line (closes existing sessions)

---

## 🎯 Alternative: Check if MySQL is Running

Ensure MySQL is running in XAMPP:

1. Open XAMPP Control Panel
2. Check that **MySQL** shows "Running" (green)
3. If not, click "Start" next to MySQL

---

## 📝 Complete Setup Checklist

- [ ] XAMPP is installed
- [ ] Apache is running (green in XAMPP)
- [ ] MySQL is running (green in XAMPP)
- [ ] PHP extensions enabled in php.ini
- [ ] Apache restarted after php.ini changes
- [ ] Database `literary_escape` created
- [ ] Run `php setup.php`

---

## 🆘 Still Not Working?

If you've tried everything above:

1. **Verify PHP version:**
   ```powershell
   php --version
   # Should be PHP 7.4 or higher
   ```

2. **Reinstall XAMPP:**
   - Download latest from https://www.apachefriends.org/
   - Install with all components
   - Start Apache and MySQL

3. **Use the test script:**
   ```powershell
   php -r "var_dump(extension_loaded('pdo_mysql'));"
   # Should output: bool(true)
   ```

4. **Check error logs:**
   - XAMPP: `C:\xampp\apache\logs\error.log`
   - PHP: Look for php_error.log

---

## ✅ Success!

Once fixed, you should see:

```
=================================================
LITERARY ESCAPE - PHP BACKEND SETUP
=================================================

Step 1: Testing database connection...
✅ Successfully connected to MySQL

Step 2: Creating database tables...
✅ All database tables created successfully
...
```

---

## 💡 Quick Command Reference

```powershell
# Check PHP version
php --version

# Check loaded extensions
php -m

# Check PDO drivers
php -r "print_r(PDO::getAvailableDrivers());"

# Find php.ini location
php --ini

# Test PDO MySQL
php -r "var_dump(extension_loaded('pdo_mysql'));"

# Run setup with XAMPP PHP
C:\xampp\php\php.exe setup.php
```

---

**Need more help?** Check the error logs or run the diagnostic script: `fix-pdo.bat`
