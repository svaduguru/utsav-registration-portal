#!/bin/bash
# ============================================================
#  deploy.sh  —  GCP VM Setup for utsav-registration-portal
#  Run this script ON the GCP VM after SSH-ing into it
# ============================================================

set -e  # Exit immediately on any error

REPO_URL="https://github.com/svaduguru/utsav-registration-portal.git"
APP_DIR="utsav-registration-portal"
APP_PORT=3000

echo "=============================================="
echo " Step 1: Update system packages"
echo "=============================================="
sudo apt-get update -y

echo "=============================================="
echo " Step 2: Install Node.js (v18 LTS)"
echo "=============================================="
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Node version: $(node -v)"
echo "NPM  version: $(npm -v)"

echo "=============================================="
echo " Step 3: Install Git"
echo "=============================================="
sudo apt-get install -y git

echo "=============================================="
echo " Step 4: Clone the repository"
echo "=============================================="
if [ -d "$APP_DIR" ]; then
  echo "Directory '$APP_DIR' already exists — pulling latest changes..."
  cd "$APP_DIR" && git pull && cd ..
else
  git clone "$REPO_URL"
fi

echo "=============================================="
echo " Step 5: Install app dependencies"
echo "=============================================="
cd "$APP_DIR"
npm install

echo "=============================================="
echo " Step 6: Install PM2 (process manager)"
echo "=============================================="
sudo npm install -g pm2

echo "=============================================="
echo " Step 7: Start the app with PM2"
echo "=============================================="
# Stop any existing instance first
pm2 stop "$APP_DIR" 2>/dev/null || true
pm2 delete "$APP_DIR" 2>/dev/null || true

npm start
