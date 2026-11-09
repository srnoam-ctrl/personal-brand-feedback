@echo off
chcp 65001 >nul
title Deploy Personal Brand Feedback to GitHub Pages

set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%LOCALAPPDATA%\Programs\MinGit\ucrt64\bin;%PATH%"

echo ========================================================
echo   Pushing Personal Brand Feedback to GitHub...
echo   Repository: https://github.com/srnoam-ctrl/personal-brand-feedback.git
echo ========================================================
echo.

git add .
git commit -m "Deploy personal brand feedback web app"

git remote remove origin 2>nul
git remote add origin https://github.com/srnoam-ctrl/personal-brand-feedback.git
git branch -M main

echo.
echo If a GitHub sign-in window opens in your browser,
echo please click 'Sign in with your browser' to authorize.
echo.

git push -u origin main --force

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   SUCCESS! Files pushed to GitHub!
    echo ========================================================
    echo.
    echo Next Step:
    echo 1. Open: https://github.com/srnoam-ctrl/personal-brand-feedback/settings/pages
    echo 2. Set Branch: 'main', Folder: '/ (root)' and click Save.
    echo 3. Your Live URL will be:
    echo    https://srnoam-ctrl.github.io/personal-brand-feedback/
    echo ========================================================
) else (
    echo ========================================================
    echo   Push did not complete. 
    echo   Make sure you created the repo 'personal-brand-feedback' on GitHub first.
    echo ========================================================
)
echo.
pause
