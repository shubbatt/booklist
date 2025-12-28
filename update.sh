#!/bin/bash

# Quick Update Script - Run this on your LOCAL machine
# This will push changes to GitHub and deploy to your server

set -e

echo "🚀 Book Voucher System - Quick Update"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this script from the booklist directory"
  exit 1
fi

# Get commit message
echo ""
read -p "📝 Enter commit message: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="Update $(date +%Y-%m-%d)"
fi

# Git operations
echo ""
echo "📤 Committing and pushing to GitHub..."
git add .
git commit -m "$COMMIT_MSG" || echo "No changes to commit"
git push origin main || git push origin master

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📡 Now SSH into your server and run:"
echo ""
echo "   ssh root@139.59.30.128"
echo "   cd /opt/booklist"
echo "   git pull"
echo "   ./deploy-server.sh"
echo ""
echo "Or run this one-liner:"
echo ""
echo "   ssh root@139.59.30.128 'cd /opt/booklist && git pull && ./deploy-server.sh'"
echo ""
