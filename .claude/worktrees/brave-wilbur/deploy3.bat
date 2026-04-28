@echo off
chcp 65001 >nul
echo ==============================
echo   iyikiApp Deploy v3
echo ==============================
echo.

cd /d "%~dp0"

set GIT_EDITOR=true

echo [1/4] Rebase iptal ediliyor...
git rebase --abort

echo [2/4] Bizim commit korunuyor...
git log --oneline -1

echo [3/4] Force push ediliyor...
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
