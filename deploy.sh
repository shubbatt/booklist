#!/bin/bash

# DigitalOcean Deployment Script for Book Voucher System
# Run this script on your DigitalOcean droplet

set -e

echo "🚀 Book Voucher System - Deployment Script"
echo "============================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo ./deploy.sh)"
  exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 20.x (LTS)
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Install build essentials for better-sqlite3
echo "📦 Installing build tools..."
apt install -y build-essential python3

# Create app directory
APP_DIR="/opt/booklist"
echo "📁 Setting up application directory: $APP_DIR"
mkdir -p $APP_DIR

# Check if we're in the project directory or need to copy files
if [ -f "package.json" ]; then
  echo "📋 Copying files to $APP_DIR..."
  cp -r . $APP_DIR/
fi

cd $APP_DIR

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
npm install

echo "🔨 Building frontend..."
npm run build

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Create systemd service
echo "⚙️ Creating systemd service..."
cat > /etc/systemd/system/booklist.service << EOF
[Unit]
Description=Book Voucher System
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=80
ExecStart=/usr/bin/node server/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
echo "🔄 Starting service..."
systemctl daemon-reload
systemctl enable booklist
systemctl restart booklist

# Check status
sleep 2
if systemctl is-active --quiet booklist; then
  echo ""
  echo "✅ Deployment successful!"
  echo ""
  echo "📊 Service Status:"
  systemctl status booklist --no-pager
  echo ""
  echo "🌐 Your app is now running at: http://$(curl -s ifconfig.me)"
  echo ""
  echo "📋 Useful commands:"
  echo "   View logs:    journalctl -u booklist -f"
  echo "   Restart:      systemctl restart booklist"
  echo "   Stop:         systemctl stop booklist"
  echo "   Status:       systemctl status booklist"
else
  echo "❌ Service failed to start. Check logs with: journalctl -u booklist -e"
  exit 1
fi

