# Quick Start Guide

## Prerequisites

Make sure you have Node.js installed (v18 or higher).

## Setup Steps

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 3. Start the Backend Server

In one terminal:
```bash
cd server
npm start
```

The server will:
- Create the database file (`booklist.db`) automatically
- Run seeders to populate initial data
- Start on `http://localhost:3001`

### 4. Start the Frontend

In another terminal:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Default Login Credentials

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator (no outlet selection needed)

## Troubleshooting

### "Invalid username, password, or outlet selection" Error

1. **Make sure the backend server is running:**
   ```bash
   cd server
   npm start
   ```

2. **Check if the database was seeded:**
   - Look for "Seeding database..." messages in the server console
   - The database file should exist at `server/booklist.db`

3. **If database is empty, manually run seeders:**
   ```bash
   cd server
   npm run seed
   ```

4. **Check browser console for API errors:**
   - Open browser DevTools (F12)
   - Check the Network tab for failed API calls
   - Make sure `/api/auth/login` is reaching the server

### Database Not Seeding

If seeders don't run automatically:
1. Delete `server/booklist.db` (if it exists)
2. Restart the server
3. Seeders will run automatically on first start

### Port Already in Use

If port 3001 is already in use:
1. Change the port in `server/server.js`:
   ```javascript
   const PORT = process.env.PORT || 3002; // Change to 3002 or another port
   ```
2. Update `vite.config.ts` proxy target to match

## Development

- **Backend:** `cd server && npm run dev` (auto-reload on changes)
- **Frontend:** `npm run dev` (Vite HMR enabled)

## Production Build

1. Build frontend:
   ```bash
   npm run build
   ```

2. Start backend:
   ```bash
   cd server
   npm start
   ```

3. Serve the `dist` folder with the backend or a web server

