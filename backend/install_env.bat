@echo off
echo [LONDON VIP] Setting up your environment...

echo [1/3] Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js not found. Installing Node.js via Winget...
    winget install -e --id OpenJS.NodeJS
    echo Please restart this script after installation if it closes.
) else (
    echo Node.js is already installed.
)

echo.
echo [2/3] Checking for MySQL...
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo MySQL not found. Installing XAMPP (Includes MySQL/MariaDB) via Winget...
    echo Note: This is a large download.
    winget install -e --id ApacheFriends.Xampp.8.2
) else (
    echo MySQL is already installed.
)

echo.
echo [3/3] Checking dependencies...
if exist "package.json" (
    echo Installing project dependencies...
    call npm install
)

echo.
echo ===================================================
echo SETUP COMPLETE!
echo.
echo 1. If you installed XAMPP, open "XAMPP Control Panel" and Start "MySQL".
echo 2. Run "npm start" to start the server.
echo.
pause
