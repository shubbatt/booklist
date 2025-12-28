#!/bin/bash

# Git Deployment Script for Book Voucher System
# This script should be run on the SERVER after git pull

set -e

echo "🚀 Deploying Book Voucher System..."
echo "======================================"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Stop the service
echo "⏸️  Stopping service..."
systemctl stop booklist 2>/dev/null || true

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Start the service
echo "▶️  Starting service..."
systemctl start booklist

# Wait a moment for service to start
sleep 2

# Check status
if systemctl is-active --quiet booklist; then
  echo ""
  echo "✅ Deployment successful!"
  echo ""
  echo "📊 Service Status:"
  systemctl status booklist --no-pager -l
  echo ""
  echo "🌐 Your app is running at: http://$(curl -s ifconfig.me)"
  echo ""
  echo "📋 Useful commands:"
  echo "   View logs:    journalctl -u booklist -f"
  echo "   Restart:      systemctl restart booklist"
  echo "   Stop:         systemctl stop booklist"
else
  echo ""
  echo "❌ Service failed to start!"
  echo "Check logs with: journalctl -u booklist -e"
  exit 1
fi
