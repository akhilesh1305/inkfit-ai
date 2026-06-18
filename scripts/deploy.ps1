@echo off
setlocal enabledelayedexpansion

echo === InkFit AI Deploy ===
echo.

where vercel >nul 2>&1
if errorlevel 1 (
  echo Installing Vercel CLI...
  call npm install -g vercel
)

echo [1/4] Provisioning Neon Postgres on Vercel...
call npx vercel integration add neon --name inkfit-db -e production -e preview -e development --non-interactive
if errorlevel 1 (
  echo.
  echo ACTION REQUIRED: Accept Neon terms in your browser:
  echo https://vercel.com/akhileshshamra1305-8650s-projects/~/integrations/accept-terms/neon?source=cli
  echo.
  echo Then run this script again.
  pause
  exit /b 1
)

echo [2/4] Pulling environment variables...
call npx vercel env pull .env.vercel.local --yes

echo [3/4] Deploying to production...
call npx vercel --prod --yes

echo [4/4] Done! Open your deployment URL above.
pause
