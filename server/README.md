# Book Voucher System - Backend Server

This is the backend server for the Book Voucher System using SQLite database.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## Database

The database file `booklist.db` will be created automatically in the `server` directory.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Outlets
- `GET /api/outlets` - Get all outlets
- `POST /api/outlets` - Create outlet
- `PUT /api/outlets/:id` - Update outlet
- `DELETE /api/outlets/:id` - Delete outlet

### Redemptions
- `GET /api/redemptions` - Get redemptions (with optional ?location= & ?date= filters)
- `POST /api/redemptions` - Create redemption

## Migration to MySQL

To migrate to MySQL, replace `better-sqlite3` with `mysql2` and update the connection string in `database.js`.

