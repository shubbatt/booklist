import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'booklist.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
export function initDatabase() {
  // Outlets table (must be created before users due to foreign key)
  db.exec(`
    CREATE TABLE IF NOT EXISTS outlets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      address TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'staff')),
      outlet_id TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (outlet_id) REFERENCES outlets(id)
    )
  `);

  // Schools table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);





  // Booklists table
  db.exec(`
    CREATE TABLE IF NOT EXISTS booklists (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      grade TEXT NOT NULL,
      total_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Booklist items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS booklist_items (
      id TEXT PRIMARY KEY,
      booklist_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (booklist_id) REFERENCES booklists(id) ON DELETE CASCADE
    )
  `);

  // Voucher redemptions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS redemptions (
      id TEXT PRIMARY KEY,
      voucher_id TEXT NOT NULL,
      staff_id TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      contact_no TEXT NOT NULL,
      student_name TEXT NOT NULL,
      school TEXT NOT NULL,
      student_class TEXT,
      booklist_id TEXT NOT NULL,
      single_ruled INTEGER DEFAULT 0,
      double_ruled INTEGER DEFAULT 0,
      square_ruled INTEGER DEFAULT 0,
      additional_items TEXT,
      has_textbooks INTEGER DEFAULT 0,
      has_stationary INTEGER DEFAULT 0,
      lens INTEGER DEFAULT 0,
      no_name INTEGER DEFAULT 0,
      cellophane INTEGER DEFAULT 0,
      customization TEXT NOT NULL,
      comments TEXT,
      delivery_date TEXT,
      collection_date TEXT,
      delivery_status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booklist_id) REFERENCES booklists(id)
    )
  `);

  // Voucher stock table
  db.exec(`
    CREATE TABLE IF NOT EXISTS voucher_stock (
      id TEXT PRIMARY KEY,
      voucher_id TEXT NOT NULL,
      grade TEXT NOT NULL,
      opening_stock INTEGER NOT NULL,
      received INTEGER DEFAULT 0,
      redeemed INTEGER DEFAULT 0,
      closing_stock INTEGER NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Day end reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS day_end_reports (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      staff_id TEXT NOT NULL,
      total_redemptions INTEGER DEFAULT 0,
      total_value REAL DEFAULT 0,
      stock_counted INTEGER DEFAULT 0,
      stock_count_date TEXT,
      stock_counted_by TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `);

  // Stock discrepancies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS stock_discrepancies (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      voucher_id TEXT NOT NULL,
      grade TEXT NOT NULL,
      expected_stock INTEGER NOT NULL,
      actual_stock INTEGER NOT NULL,
      difference INTEGER NOT NULL,
      notes TEXT,
      FOREIGN KEY (report_id) REFERENCES day_end_reports(id) ON DELETE CASCADE
    )
  `);

  // Option items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS option_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      default_checked INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Voucher drafts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS voucher_drafts (
      id TEXT PRIMARY KEY,
      form_data TEXT NOT NULL,
      current_step INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_redemptions_date ON redemptions(date);
    CREATE INDEX IF NOT EXISTS idx_redemptions_location ON redemptions(location);
    CREATE INDEX IF NOT EXISTS idx_stock_date_location ON voucher_stock(date, location);
    CREATE INDEX IF NOT EXISTS idx_reports_date_location ON day_end_reports(date, location);
  `);

  console.log('Database tables created successfully');
}

export default db;

