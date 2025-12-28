# 🚀 Quick Start Guide

## ⚠️ IMPORTANT: Start the Backend Server First!

The login requires the backend server to be running. Follow these steps:

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 2: Start the Backend Server

```bash
cd server
npm start
```

You should see:
```
Seeding database...
✓ Seeded users
✓ Seeded outlets
...
Server running on http://localhost:3001
Database: booklist.db
```

### Step 3: Start the Frontend (in a NEW terminal)

```bash
# In the project root directory
npm run dev
```

### Step 4: Login

- **Username:** `admin`
- **Password:** `admin123`
- No outlet selection needed for admin

## Troubleshooting

### "Invalid username, password, or outlet selection"

This usually means:
1. **Backend server is not running** - Start it with `cd server && npm start`
2. **Database not seeded** - The server automatically seeds on first start
3. **Port conflict** - Make sure port 3001 is available

### "Cannot connect to server"

- Check if backend is running: `curl http://localhost:3001/api/outlets`
- Check browser console (F12) for network errors
- Verify Vite proxy is configured in `vite.config.ts`

### Database Not Created

If `server/booklist.db` doesn't exist:
1. Make sure you're in the `server` directory
2. Run `npm start` - it will create the database automatically
3. Check for errors in the server console

## Development Workflow

**Terminal 1 (Backend):**
```bash
cd server
npm start
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Both should be running simultaneously!

