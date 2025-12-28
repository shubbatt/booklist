# Database Setup Guide

## SQLite Database (Current)

The application uses SQLite for easy setup and deployment. The database file is automatically created at `server/booklist.db`.

### Setup

1. **Install backend dependencies:**
```bash
cd server
npm install
```

2. **Start the server:**
```bash
npm start
```

The database will be automatically initialized with:
- Default admin user: `admin` / `admin123`
- Default outlets (Hithadhoo, Feydhoo, Maradhoo)

### Database File Location

- Development: `server/booklist.db`
- The database file is included in `.gitignore` (don't commit it)

### Backup Database

To backup your database:
```bash
cp server/booklist.db server/booklist_backup.db
```

## Migrating to MySQL

If you want to use MySQL instead of SQLite:

### 1. Install MySQL dependencies

```bash
cd server
npm install mysql2
npm uninstall better-sqlite3
```

### 2. Update `server/database.js`

Replace the SQLite connection with MySQL:

```javascript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'booklist',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
```

### 3. Update queries

Replace `db.prepare().run()` with `await pool.execute()`:

```javascript
// SQLite
db.prepare('SELECT * FROM users').all()

// MySQL
const [rows] = await pool.execute('SELECT * FROM users');
```

### 4. Create MySQL database

```sql
CREATE DATABASE booklist;
```

### 5. Environment variables

Create `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=booklist
```

## Production Deployment

### SQLite (Simple)
- Copy `server/booklist.db` to your server
- Ensure the server has write permissions
- SQLite works great for small to medium deployments

### MySQL (Recommended for larger deployments)
- Set up MySQL on your server
- Create the database
- Update connection settings
- Run migrations if needed

## Database Schema

All tables are automatically created on first run. See `server/database.js` for the complete schema.

Key tables:
- `users` - User accounts (admin/staff)
- `outlets` - Store outlets
- `redemptions` - Voucher redemptions
- `voucher_stock` - Stock management
- `day_end_reports` - Daily reports
- `booklists` - Booklist definitions

