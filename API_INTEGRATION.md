# API Integration Guide

This guide explains how to integrate the frontend with the SQLite backend API.

## Setup

1. **Install backend dependencies:**
```bash
cd server
npm install
```

2. **Start the backend server:**
```bash
cd server
npm start
```

3. **Start the frontend (in a separate terminal):**
```bash
npm run dev
```

The Vite dev server is configured to proxy `/api` requests to `http://localhost:3001`.

## API Base URL

- Development: `/api` (proxied to `http://localhost:3001`)
- Production: Update the base URL in your API client

## Next Steps

To integrate the frontend with the API:

1. Create an API client utility (`src/api/client.js`)
2. Update the Zustand store to use API calls instead of localStorage
3. Replace all `useStore` calls with API calls

Example API client:
```javascript
const API_BASE = import.meta.env.PROD ? 'https://your-api.com/api' : '/api';

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}
```

## Migration Notes

- The database will be created automatically at `server/booklist.db`
- Default admin user: `admin` / `admin123` (password is hashed)
- All data is stored in SQLite database
- Easy to migrate to MySQL later by changing the database connection

