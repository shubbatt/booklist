import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from './database.js';
import db from './database.js';
import { seedDatabase } from './seeders.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// Initialize database
try {
  initDatabase();
  console.log('✓ Database initialized');
} catch (error) {
  console.error('✗ Database initialization error:', error);
  process.exit(1);
}

// Seed database with initial data
try {
  seedDatabase();
} catch (error) {
  console.error('✗ Database seeding error:', error);
}

// ==================== AUTHENTICATION ====================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, outletId } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For staff, require outlet selection
    if (user.role === 'staff') {
      if (!outletId) {
        return res.status(400).json({ error: 'Outlet selection required for staff' });
      }
      const outlet = db.prepare('SELECT * FROM outlets WHERE id = ? AND active = 1').get(outletId);
      if (!outlet) {
        return res.status(400).json({ error: 'Invalid outlet' });
      }
      return res.json({ user: { ...user, password: undefined }, outlet });
    }

    // Admin doesn't need outlet
    res.json({ user: { ...user, password: undefined }, outlet: null });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ==================== USERS ====================

app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.*, o.name as outlet_name 
      FROM users u 
      LEFT JOIN outlets o ON u.outlet_id = o.id
      ORDER BY u.created_at DESC
    `).all();
    res.json(users.map(u => ({ ...u, password: undefined })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, name, role, outletId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = randomUUID();

    db.prepare(`
      INSERT INTO users (id, username, password, name, role, outlet_id, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, username, hashedPassword, name, role, outletId || null, 1);

    res.json({ id, username, name, role, outletId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, name, role, outletId } = req.body;

    const updates = {};
    if (username) updates.username = username;
    if (name) updates.name = name;
    if (role) updates.role = role;
    if (outletId !== undefined) updates.outlet_id = outletId;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...values);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== OUTLETS ====================

app.get('/api/outlets', (req, res) => {
  try {
    const outlets = db.prepare('SELECT * FROM outlets ORDER BY name').all();
    // .all() always returns an array, even if empty
    res.json(outlets || []);
  } catch (error) {
    console.error('Error fetching outlets:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/outlets', (req, res) => {
  try {
    const { name, code, address } = req.body;
    const id = randomUUID();
    db.prepare('INSERT INTO outlets (id, name, code, address, active) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, code, address || null, 1);
    res.json({ id, name, code, address, active: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/outlets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address, active } = req.body;
    db.prepare('UPDATE outlets SET name = ?, code = ?, address = ?, active = ? WHERE id = ?')
      .run(name, code, address || null, active !== undefined ? active : 1, id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/outlets/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM outlets WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== REDEMPTIONS ====================

app.get('/api/redemptions', (req, res) => {
  try {
    const { location, date } = req.query;
    let query = 'SELECT * FROM redemptions WHERE 1=1';
    const params = [];

    if (location) {
      query += ' AND location = ?';
      params.push(location);
    }
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }

    query += ' ORDER BY created_at DESC';
    const redemptions = db.prepare(query).all(...params);
    res.json(redemptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/redemptions', (req, res) => {
  try {
    const redemption = req.body;
    const id = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO redemptions (
        id, voucher_id, staff_id, date, location, parent_name, contact_no,
        student_name, school, student_class, booklist_id, single_ruled,
        double_ruled, square_ruled, additional_items, has_textbooks,
        has_stationary, lens, no_name, cellophane, customization, comments,
        delivery_date, collection_date, delivery_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, redemption.voucherId, redemption.staffId, redemption.date,
      redemption.location, redemption.parentName, redemption.contactNo,
      redemption.studentName, redemption.school, redemption.studentClass,
      redemption.booklistId, redemption.singleRuled || 0, redemption.doubleRuled || 0,
      redemption.squareRuled || 0, redemption.additionalItems || '',
      redemption.hasTextbooks ? 1 : 0, redemption.hasStationary ? 1 : 0,
      redemption.lens ? 1 : 0, redemption.noName ? 1 : 0, redemption.cellophane ? 1 : 0,
      redemption.customization, redemption.comments || '',
      redemption.deliveryDate || null, redemption.collectionDate || null,
      redemption.deliveryStatus, now, now
    );

    res.json({ id, ...redemption });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SCHOOLS, LOCATIONS, STAFF ====================

app.get('/api/schools', (req, res) => {
  try {
    const schools = db.prepare('SELECT * FROM schools ORDER BY name').all();
    res.json(schools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/schools', (req, res) => {
  try {
    const { name } = req.body;
    const id = randomUUID();
    db.prepare('INSERT INTO schools (id, name) VALUES (?, ?)').run(id, name);
    res.json({ id, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Locations are now managed through outlets
app.get('/api/locations', (req, res) => {
  try {
    // Return outlets as locations
    const outlets = db.prepare('SELECT id, name FROM outlets WHERE active = 1 ORDER BY name').all();
    res.json(outlets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Locations are added through outlets endpoint
app.post('/api/locations', (req, res) => {
  try {
    const { name } = req.body;
    const id = randomUUID();
    const code = `OUT-${String(Date.now()).slice(-3)}`;
    db.prepare('INSERT INTO outlets (id, name, code, active) VALUES (?, ?, ?, ?)').run(id, name, code, 1);
    res.json({ id, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff', (req, res) => {
  try {
    // Get staff from users table where role is 'staff'
    const staff = db.prepare(`
      SELECT u.id, u.name, u.username, u.outlet_id, o.name as outlet_name
      FROM users u
      LEFT JOIN outlets o ON u.outlet_id = o.id
      WHERE u.role = 'staff' AND u.active = 1
      ORDER BY u.name
    `).all();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Staff are now managed through the users endpoint
// No separate POST endpoint needed for staff

// ==================== OPTION ITEMS ====================

app.get('/api/option-items', (req, res) => {
  try {
    const optionItems = db.prepare('SELECT * FROM option_items ORDER BY name').all();
    res.json(optionItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/option-items', (req, res) => {
  try {
    const { name, key, enabled, defaultChecked } = req.body;
    const id = randomUUID();
    db.prepare(`
      INSERT INTO option_items (id, name, key, enabled, default_checked)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, key, enabled ? 1 : 0, defaultChecked ? 1 : 0);
    res.json({ id, name, key, enabled, defaultChecked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BOOKLISTS ====================

app.get('/api/booklists', (req, res) => {
  try {
    const booklists = db.prepare('SELECT * FROM booklists ORDER BY grade').all();
    const items = db.prepare('SELECT * FROM booklist_items').all();

    const booklistsWithItems = booklists.map(bl => ({
      id: bl.id,
      code: bl.code,
      name: bl.name,
      grade: bl.grade,
      totalAmount: bl.total_amount,
      items: items.filter(item => item.booklist_id === bl.id).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount
      }))
    }));

    res.json(booklistsWithItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/booklists', (req, res) => {
  try {
    const { code, name, grade, items, totalAmount } = req.body;
    const id = randomUUID();

    db.prepare('INSERT INTO booklists (id, code, name, grade, total_amount) VALUES (?, ?, ?, ?, ?)')
      .run(id, code, name, grade, totalAmount);

    const insertItem = db.prepare(`
      INSERT INTO booklist_items (id, booklist_id, name, quantity, rate, amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    items.forEach(item => {
      insertItem.run(randomUUID(), id, item.name, item.quantity, item.rate, item.amount);
    });

    res.json({ id, code, name, grade, items, totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STOCK ====================

app.get('/api/stock', (req, res) => {
  try {
    const { location, date, grade } = req.query;
    let query = 'SELECT * FROM voucher_stock WHERE 1=1';
    const params = [];

    if (location) {
      query += ' AND location = ?';
      params.push(location);
    }
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    if (grade) {
      query += ' AND grade = ?';
      params.push(grade);
    }

    query += ' ORDER BY date DESC, grade';
    const stock = db.prepare(query).all(...params);

    // Convert snake_case to camelCase
    const formattedStock = stock.map(s => ({
      id: s.id,
      voucherId: s.voucher_id,
      grade: s.grade,
      openingStock: s.opening_stock,
      received: s.received,
      redeemed: s.redeemed,
      closingStock: s.closing_stock,
      date: s.date,
      location: s.location,
      notes: s.notes
    }));

    res.json(formattedStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stock', (req, res) => {
  try {
    const stock = req.body;
    const id = randomUUID();

    db.prepare(`
      INSERT INTO voucher_stock (
        id, voucher_id, grade, opening_stock, received, redeemed,
        closing_stock, date, location, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, stock.voucherId, stock.grade, stock.openingStock,
      stock.received || 0, stock.redeemed || 0, stock.closingStock,
      stock.date, stock.location, stock.notes || null
    );

    res.json({ id, ...stock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== EXPORT/IMPORT ====================

app.get('/api/export', (req, res) => {
  try {
    const data = {
      users: db.prepare('SELECT id, username, name, role, outlet_id, active FROM users').all(),
      outlets: db.prepare('SELECT * FROM outlets').all(),
      schools: db.prepare('SELECT * FROM schools').all(),
      booklists: db.prepare('SELECT * FROM booklists').all(),
      booklistItems: db.prepare('SELECT * FROM booklist_items').all(),
      redemptions: db.prepare('SELECT * FROM redemptions').all(),
      stock: db.prepare('SELECT * FROM voucher_stock').all(),
      optionItems: db.prepare('SELECT * FROM option_items').all(),
      exportedAt: new Date().toISOString()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="booklist-backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// In production, serve static files and SPA
if (isProduction) {
  const distPath = join(__dirname, '..', 'dist');

  // Serve static assets (CSS, JS, images)
  app.use(express.static(distPath));

  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Database: booklist.db`);
  console.log(`🌍 Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`\nReady to accept requests!\n`);
});

