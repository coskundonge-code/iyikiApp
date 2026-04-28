@echo off
chcp 65001 >nul
echo ==============================
echo   iyikiApp Deploy v2
echo ==============================
echo.

cd /d "%~dp0"

echo [1/4] Onceki islemler iptal ediliyor...
git rebase --abort 2>nul
git merge --abort 2>nul

echo [2/4] Remote degisiklikler aliniyor (force)...
git fetch origin master

echo [3/4] Force push ediliyor...
git push origin master --force-with-lease

echo.
echo ==============================
IF %ERRORLEVEL% EQU 0 (
    echo   BASARILI! Vercel deploy basladi.
    echo   https://iyiki-app.vercel.app
) ELSE (
    echo   HATA - ciktiyi yapistir
)
echo ==============================
echo.
pause
