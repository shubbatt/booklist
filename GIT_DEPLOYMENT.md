# Git Deployment Setup

This guide will help you set up Git-based deployment so you can update your server with a simple `git pull` instead of using `scp`.

## 🎯 One-Time Setup

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `booklist` (or whatever you prefer)
3. Make it **Private** (recommended for production code)
4. **Don't** initialize with README (we already have code)

### Step 2: Connect Local Repository to GitHub

```bash
# On your local machine
cd /Volumes/Backup/Development/booklist

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/booklist.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

You'll be prompted for your GitHub username and password. 

**Note:** GitHub now requires a Personal Access Token instead of password:
- Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token with `repo` scope
- Use this token as your password

### Step 3: Setup Server to Use Git

```bash
# SSH into your server
ssh root@139.59.30.128

# Navigate to app directory
cd /opt

# Backup current installation
mv booklist booklist-backup

# Clone from GitHub (replace YOUR_USERNAME)
git clone https://github.com/YOUR_USERNAME/booklist.git

# Enter the directory
cd booklist

# Make deployment script executable
chmod +x deploy-server.sh

# Run initial deployment
./deploy-server.sh
```

## 🚀 Daily Workflow (After Setup)

### Making Changes and Deploying

#### Option 1: Using the Update Script (Easiest)

```bash
# On your local machine
cd /Volumes/Backup/Development/booklist

# Make your changes to the code...

# Run the update script
chmod +x update.sh
./update.sh
```

This will:
1. Ask for a commit message
2. Commit and push to GitHub
3. Show you the command to deploy on server

Then on your server:
```bash
ssh root@139.59.30.128 'cd /opt/booklist && git pull && ./deploy-server.sh'
```

#### Option 2: Manual Steps

**On Local Machine:**
```bash
cd /Volumes/Backup/Development/booklist

# Stage changes
git add .

# Commit
git commit -m "Your commit message"

# Push to GitHub
git push
```

**On Server:**
```bash
ssh root@139.59.30.128

cd /opt/booklist

# Pull latest changes
git pull

# Deploy
./deploy-server.sh
```

## 📋 Common Commands

### Check Status
```bash
git status                    # See what's changed
git log --oneline -5         # View recent commits
```

### Undo Changes
```bash
git checkout -- filename     # Discard changes to a file
git reset --hard HEAD        # Discard ALL local changes
```

### View Differences
```bash
git diff                     # See what changed
git diff filename           # See changes in specific file
```

## 🔧 Troubleshooting

### "Permission denied" when pushing to GitHub

**Solution:** Use a Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic) with `repo` scope
3. Use token as password when prompted

### "Already up to date" but server has old code

**Solution:** Force pull on server:
```bash
cd /opt/booklist
git fetch origin
git reset --hard origin/main
./deploy-server.sh
```

### Merge conflicts on server

**Solution:** Server should never have local changes. Reset it:
```bash
cd /opt/booklist
git reset --hard origin/main
git pull
./deploy-server.sh
```

### Database gets reset after deployment

**Solution:** The database file is in `.gitignore`, so it won't be affected by git operations. It's safe!

## 🎁 Benefits of Git Deployment

✅ **Fast updates** - Just `git pull` instead of `scp`
✅ **Version control** - Track all changes
✅ **Easy rollback** - Revert to any previous version
✅ **Collaboration** - Multiple developers can work together
✅ **Backup** - Code is backed up on GitHub
✅ **No manual file transfers** - Everything automated

## 📦 What's Ignored (Won't be pushed to Git)

These files are in `.gitignore`:
- `node_modules/` - Dependencies (reinstalled on server)
- `dist/` - Build files (rebuilt on server)
- `server/booklist.db` - Your database (stays on server)
- `*.log` - Log files

## 🔐 Security Note

**Never commit:**
- Passwords or API keys
- Database files with real data
- `.env` files with secrets

If you need environment variables, create `.env.example` with dummy values and add `.env` to `.gitignore`.

## 🎯 Quick Reference

```bash
# Local: Make changes and push
git add .
git commit -m "Description of changes"
git push

# Server: Pull and deploy
ssh root@139.59.30.128 'cd /opt/booklist && git pull && ./deploy-server.sh'

# Or use the update script:
./update.sh
```

---

**That's it!** You now have a professional deployment workflow. 🚀
