@echo off
echo Setting Git Identity...
git config user.email "kk3163019@gmail.com"
git config user.name "krishna.0858"

if not exist .git (
    echo Initializing Git repository...
    git init
)

echo Staging files...
git add .

echo Creating commit...
git commit -m "feat: social interactions & comprehensive dark theme migration"

echo Setting branch to main...
git branch -M main

echo Connecting to GitHub...
git remote add origin https://github.com/krishna3163/Super-App-Core.git || git remote set-url origin https://github.com/krishna3163/Super-App-Core.git

echo Pushing to GitHub...
git push -u origin main

echo Done! Everything is synced to GitHub.
