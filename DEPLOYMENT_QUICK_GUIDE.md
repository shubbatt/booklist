# Quick Deployment Guide - DigitalOcean

This is a simplified guide to get your Book Voucher System running on DigitalOcean in minutes.

## 🚀 Quick Start (3 Steps)

### Step 1: Create a Droplet

1. Go to [DigitalOcean](https://cloud.digitalocean.com/)
2. Click **Create** → **Droplets**
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic $6/mo (1GB RAM) or higher
   - **Region**: Closest to you
   - **Authentication**: SSH Key or Password
4. Click **Create Droplet**
5. **Copy your droplet's IP address**

### Step 2: Upload Your Code

**On your local machine**, run:

```bash
cd /Volumes/Backup/Development/booklist

# Create a package (excluding node_modules)
tar --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='server/booklist.db' -czvf booklist.tar.gz .

# Upload to your droplet (replace YOUR_IP with your droplet IP)
scp booklist.tar.gz root@YOUR_IP:/root/

# Also upload the deploy script
scp deploy.sh root@YOUR_IP:/root/
```

### Step 3: Deploy on Server

**SSH into your droplet**:

```bash
ssh root@YOUR_IP
```

**Then run these commands**:

```bash
# Extract the files
mkdir -p /opt/booklist
tar -xzvf /root/booklist.tar.gz -C /opt/booklist

# Make deploy script executable
chmod +x /root/deploy.sh

# Run deployment (this will install everything and start the app)
cd /opt/booklist
/root/deploy.sh
```

That's it! Your app will be running at `http://YOUR_IP`

## 📱 Default Login

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after first login!

## 🔧 Common Commands

```bash
# View live logs
journalctl -u booklist -f

# Restart the app
systemctl restart booklist

# Check status
systemctl status booklist

# Stop the app
systemctl stop booklist
```

## 🔄 Updating Your App

When you make changes locally:

```bash
# On your local machine
cd /Volumes/Backup/Development/booklist
tar --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='server/booklist.db' -czvf booklist.tar.gz .
scp booklist.tar.gz root@YOUR_IP:/root/

# On the server
ssh root@YOUR_IP
cd /opt/booklist
systemctl stop booklist
tar -xzvf /root/booklist.tar.gz -C /opt/booklist
npm install
npm run build
cd server && npm install && cd ..
systemctl start booklist
```

## 🌐 Setup Custom Domain (Optional)

If you have a domain name:

### 1. Point your domain to your droplet IP

In your domain registrar (e.g., Namecheap, GoDaddy):
- Create an **A Record** pointing to your droplet IP
- Wait 5-10 minutes for DNS propagation

### 2. Install Nginx and SSL

```bash
# Install Nginx
apt install -y nginx certbot python3-certbot-nginx

# Update service to use port 3001
sed -i 's/PORT=80/PORT=3001/' /etc/systemd/system/booklist.service
systemctl daemon-reload
systemctl restart booklist

# Create Nginx config (replace YOUR_DOMAIN.com)
cat > /etc/nginx/sites-available/booklist << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/booklist /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Setup SSL (replace YOUR_DOMAIN.com)
certbot --nginx -d YOUR_DOMAIN.com
```

Now your app will be available at `https://YOUR_DOMAIN.com` 🎉

## 💾 Backup Your Database

```bash
# Create backup
cp /opt/booklist/server/booklist.db /root/booklist-backup-$(date +%Y%m%d).db

# Download to your local machine (run on your local machine)
scp root@YOUR_IP:/root/booklist-backup-*.db ./backups/
```

## 🆘 Troubleshooting

### App won't start
```bash
journalctl -u booklist -e --no-pager
```

### Port 80 already in use
```bash
# Check what's using port 80
lsof -i :80

# Either kill that process or change the port in the service file
nano /etc/systemd/system/booklist.service
# Change PORT=80 to PORT=3001
systemctl daemon-reload
systemctl restart booklist
```

### Database issues
```bash
cd /opt/booklist/server
# Backup first!
cp booklist.db booklist.db.backup
# Delete and recreate
rm booklist.db
systemctl restart booklist  # Will recreate with seed data
```

## 📚 Full Documentation

For more detailed information, see:
- `DEPLOY_DIGITALOCEAN.md` - Complete deployment guide
- `QUICK_START.md` - Local development guide
- `TROUBLESHOOTING.md` - Common issues and solutions

## 🔐 Security Recommendations

1. **Change default password** immediately after first login
2. **Setup firewall**:
   ```bash
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw enable
   ```
3. **Regular backups**: Schedule daily database backups
4. **Keep system updated**: Run `apt update && apt upgrade` regularly
5. **Use SSH keys** instead of passwords for server access

---

Need help? Check the full `DEPLOY_DIGITALOCEAN.md` guide or open an issue on GitHub.
