@echo off
title LaporRembang - Local Development Server
echo ====================================================
echo   Menjalankan Server Lokal Portal LaporRembang...
echo ====================================================
echo.
echo Membuka browser di http://localhost:5500
echo Tekan Ctrl+C di jendela ini untuk menghentikan server.
echo.

start "" "http://localhost:5500"

where python >nul 2>&1
if %errorlevel%==0 (
    python -m http.server 5500
    goto :eof
)

where npx >nul 2>&1
if %errorlevel%==0 (
    npx --yes serve -l 5500 .
    goto :eof
)

echo [ERROR] Python atau Node.js (npx) tidak ditemukan di komputer ini.
echo Silakan install Python atau Node.js terlebih dahulu.
pause
