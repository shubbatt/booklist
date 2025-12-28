# Deploy to DigitalOcean - Single Droplet

This guide will help you deploy the Book Voucher System to a single DigitalOcean droplet.

## Prerequisites

- A DigitalOcean account
- SSH access to your droplet

## Step 1: Create a Droplet

1. Go to [DigitalOcean](https://cloud.digitalocean.com/)
2. Click **Create** → **Droplets**
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic → Regular → $6/mo (1GB RAM, 1 CPU) or higher
   - **Region**: Choose closest to your users
   - **Authentication**: SSH Key (recommended) or Password
4. Click **Create Droplet**
5. Note your droplet's IP address

## Step 2: Connect to Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

## Step 3: Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install build tools (for better-sqlite3)
apt install -y build-essential python3

# Verify installation
node -v  # Should show v20.x.x
npm -v
```

## Step 4: Upload Your Code

### Option A: Using Git (Recommended)

```bash
# Install git
apt install -y git

# Clone your repository
cd /opt
git clone https://github.com/YOUR_USERNAME/booklist.git
cd booklist
```

### Option B: Using SCP (from your local machine)

```bash
# Run this on your LOCAL machine, not the server
cd /Volumes/Backup/Development/booklist

# Create a tarball (excluding node_modules)
tar --exclude='node_modules' --exclude='.git' --exclude='dist' -czvf booklist.tar.gz .

# Upload to server
scp booklist.tar.gz root@YOUR_DROPLET_IP:/opt/

# SSH into server and extract
ssh root@YOUR_DROPLET_IP
cd /opt
mkdir -p booklist
tar -xzvf booklist.tar.gz -C booklist
cd booklist
```

## Step 5: Build and Install

```bash
cd /opt/booklist

# Install frontend dependencies
npm install

# Build frontend
npm run build

# Install server dependencies
cd server
npm install
cd ..
```

## Step 6: Create Systemd Service

```bash
cat > /etc/systemd/system/booklist.service << 'EOF'
[Unit]
Description=Book Voucher System
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/booklist
Environment=NODE_ENV=production
Environment=PORT=80
ExecStart=/usr/bin/node server/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

## Step 7: Start the Service

```bash
# Reload systemd
systemctl daemon-reload

# Enable service to start on boot
systemctl enable booklist

# Start the service
systemctl start booklist

# Check status
systemctl status booklist
```

## Step 8: Access Your App

Open your browser and go to:
```
http://YOUR_DROPLET_IP
```

Login with:
- **Username**: admin
- **Password**: admin123

## Useful Commands

```bash
# View logs
journalctl -u booklist -f

# Restart service
systemctl restart booklist

# Stop service
systemctl stop booklist

# Check status
systemctl status booklist

# View database
cd /opt/booklist/server
sqlite3 booklist.db ".tables"
```

## Optional: Setup Domain & HTTPS

### Install Nginx (for reverse proxy)

```bash
apt install -y nginx certbot python3-certbot-nginx

# Update service to use port 3001
sed -i 's/PORT=80/PORT=3001/' /etc/systemd/system/booklist.service
systemctl daemon-reload
systemctl restart booklist
```

### Configure Nginx

```bash
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

ln -s /etc/nginx/sites-available/booklist /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Setup SSL (HTTPS)

```bash
certbot --nginx -d YOUR_DOMAIN.com
```

## Updating the App

```bash
cd /opt/booklist

# If using Git
git pull

# Rebuild
npm install
npm run build
cd server && npm install && cd ..

# Restart
systemctl restart booklist
```

## Backup Database

```bash
# Create backup
cp /opt/booklist/server/booklist.db /root/booklist-backup-$(date +%Y%m%d).db

# Download to local machine (run on your local machine)
scp root@YOUR_DROPLET_IP:/root/booklist-backup-*.db ./
```

## Troubleshooting

### Service won't start
```bash
journalctl -u booklist -e --no-pager
```

### Port 80 in use
```bash
lsof -i :80
# Kill the process or use a different port
```

### Database errors
```bash
cd /opt/booklist/server
rm booklist.db  # Delete and recreate
systemctl restart booklist  # Will recreate with seed data
```

### Permission errors
```bash
chown -R root:root /opt/booklist
chmod +x /opt/booklist/deploy.sh
```

