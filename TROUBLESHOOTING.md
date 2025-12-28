# Troubleshooting Guide

## Backend Server Not Running

If you see errors like:
- `GET http://localhost:5173/api/outlets 500 (Internal Server Error)`
- `Failed to load outlets: SyntaxError: Failed to execute 'json' on 'Response'`
- `Cannot connect to server`

**Solution:**
1. Open a terminal and navigate to the server directory:
   ```bash
   cd server
   ```

2. Make sure dependencies are installed:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

   You should see:
   ```
   ✓ Database initialized
   Seeding database...
   ✓ Seeded users
   ✓ Seeded outlets
   ...
   🚀 Server running on http://localhost:3001
   ```

4. Keep that terminal open and running.

5. In a **new terminal**, start the frontend:
   ```bash
   npm run dev
   ```

6. Now try logging in again.

## Outlet Selector Not Showing

The outlet selector will appear when:
- You type a staff username (it checks the API)
- OR when outlets are successfully loaded from the server

If the selector doesn't appear:
1. Make sure the backend server is running (see above)
2. Check the browser console for errors
3. Try refreshing the page

## Database Issues

If you get database errors:
1. Stop the server (Ctrl+C)
2. Delete the database file:
   ```bash
   cd server
   rm -f booklist.db booklist.db-journal
   ```
3. Restart the server (it will recreate the database)

## Port Already in Use

If port 3001 is already in use:
1. Find what's using it:
   ```bash
   lsof -ti:3001
   ```
2. Kill the process:
   ```bash
   kill -9 $(lsof -ti:3001)
   ```
3. Or change the port in `server/server.js`:
   ```javascript
   const PORT = process.env.PORT || 3002; // Change to 3002
   ```
4. Update `vite.config.ts` to proxy to the new port

