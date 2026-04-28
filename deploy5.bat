@echo off
chcp 65001 >nul
echo ==============================
echo   iyikiApp Deploy v5
echo ==============================
echo.

cd /d "%~dp0"

set GIT_EDITOR=true

echo [1/2] Force push ediliyor...
git push origin master --force

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
