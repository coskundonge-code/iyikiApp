@echo off
chcp 65001 >nul
echo ==============================
echo   iyikiApp Deploy v4
echo ==============================
echo.

cd /d "%~dp0"

set GIT_EDITOR=true
set GIT_COMMITTER_NAME=Coskun Donge
set GIT_COMMITTER_EMAIL=coskun.donge@gmail.com
set GIT_AUTHOR_NAME=Coskun Donge
set GIT_AUTHOR_EMAIL=coskun.donge@gmail.com

echo [1/4] Workflow dosyasi cikariliyor...
git rm -r --cached .github/workflows/ci.yml 2>nul
echo .github/ >> .gitignore

echo [2/4] Yeni commit olusturuluyor...
git add -A
git commit -m "chore: remove ci workflow for deployment"

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
