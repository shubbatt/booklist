import db from './database.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Check if already seeded
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount && userCount.count > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }
  } catch (error) {
    console.error('Error checking seed status:', error);
    throw error;
  }

  // Seed Users
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (id, username, password, name, role, active)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    'admin',
    adminPassword,
    'Administrator',
    'admin',
    1
  );

  console.log('✓ Seeded users');

  // Seed Outlets
  const outlets = [
    { name: 'Hithadhoo Outlet', code: 'OUT-001' },
    { name: 'Feydhoo Outlet', code: 'OUT-002' },
    { name: 'Maradhoo Outlet', code: 'OUT-003' },
  ];

  const insertOutlet = db.prepare('INSERT INTO outlets (id, name, code, active) VALUES (?, ?, ?, ?)');
  outlets.forEach(outlet => {
    insertOutlet.run(randomUUID(), outlet.name, outlet.code, 1);
  });

  console.log('✓ Seeded outlets');

  // Seed Schools
  const schools = [
    { name: 'Nooraanee School' },
    { name: 'Sharafuddeen School' },
    { name: 'Hiriya School' },
  ];

  const insertSchool = db.prepare('INSERT INTO schools (id, name) VALUES (?, ?)');
  schools.forEach(school => {
    insertSchool.run(randomUUID(), school.name);
  });

  console.log('✓ Seeded schools');



  // Seed Staff Users (linked to outlets)
  const staffPassword = bcrypt.hashSync('staff123', 10);
  const outletsList = db.prepare('SELECT * FROM outlets').all();

  const staffUsers = [
    { username: 'counter', name: 'Counter Staff', outletId: outletsList[0]?.id },
    { username: 'staff1010', name: 'Staff 1010', outletId: outletsList[1]?.id },
    { username: 'staff1011', name: 'Staff 1011', outletId: outletsList[2]?.id },
  ];

  const insertStaffUser = db.prepare(`
    INSERT INTO users (id, username, password, name, role, outlet_id, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  staffUsers.forEach(staff => {
    insertStaffUser.run(
      randomUUID(),
      staff.username,
      staffPassword,
      staff.name,
      'staff',
      staff.outletId || null,
      1
    );
  });

  console.log('✓ Seeded staff users');

  // Seed Option Items
  const optionItems = [
    { name: 'Has Textbooks', key: 'hasTextbooks', enabled: 1, defaultChecked: 0 },
    { name: 'Has Stationary', key: 'hasStationary', enabled: 1, defaultChecked: 1 },
    { name: 'Lens', key: 'lens', enabled: 1, defaultChecked: 0 },
    { name: 'No Name', key: 'noName', enabled: 1, defaultChecked: 0 },
    { name: 'Cellophane', key: 'cellophane', enabled: 1, defaultChecked: 0 },
  ];

  const insertOptionItem = db.prepare(`
    INSERT INTO option_items (id, name, key, enabled, default_checked)
    VALUES (?, ?, ?, ?, ?)
  `);
  optionItems.forEach(item => {
    insertOptionItem.run(randomUUID(), item.name, item.key, item.enabled, item.defaultChecked);
  });

  console.log('✓ Seeded option items');

  // Seed Default Booklist
  const booklistId = randomUUID();
  const defaultBooklist = {
    id: booklistId,
    code: 'VCH-GR1-ALL',
    name: 'Stationary List for Grade 1',
    grade: 'Grade 1',
    totalAmount: 589,
    items: [
      { name: 'Drawing Block (No.80)', quantity: 1, rate: 38, amount: 38 },
      { name: 'A4 Size Scrap Book', quantity: 1, rate: 20, amount: 20 },
      { name: 'Box of Pencil Colours (24 colours), CE Standard', quantity: 1, rate: 90, amount: 90 },
      { name: 'Box of Water Colours (12 colours tube), CE Standard, Regular Size', quantity: 1, rate: 60, amount: 60 },
      { name: 'Box of Crayons, 12 colours, CE Standard', quantity: 1, rate: 44, amount: 44 },
      { name: 'Pair of Scissors (6")', quantity: 1, rate: 20, amount: 20 },
      { name: 'Glue stick (8 gm) CE Standard', quantity: 2, rate: 15, amount: 30 },
      { name: 'Paint Brush (No.8) CE Standard', quantity: 1, rate: 12, amount: 12 },
      { name: 'Paint Brush (No.12) CE Standard', quantity: 1, rate: 18, amount: 18 },
      { name: 'Palette (Medium)', quantity: 1, rate: 15, amount: 15 },
      { name: 'Box of Clay, CE Standard', quantity: 2, rate: 16, amount: 32 },
      { name: 'Single-ruled Exercise Book (No.80)', quantity: 4, rate: 13, amount: 52 },
      { name: 'Double-ruled Exercise Book (No.80)', quantity: 5, rate: 12, amount: 60 },
      { name: 'Square-ruled Exercise Book (No.80)', quantity: 2, rate: 12, amount: 24 },
      { name: 'Pencil (HB)', quantity: 4, rate: 6, amount: 24 },
      { name: 'Eraser', quantity: 1, rate: 6, amount: 6 },
      { name: 'Ruler (plastic: 12 inches)', quantity: 1, rate: 8, amount: 8 },
      { name: 'Paper Punch File', quantity: 3, rate: 12, amount: 36 },
    ],
  };

  db.prepare('INSERT INTO booklists (id, code, name, grade, total_amount) VALUES (?, ?, ?, ?, ?)')
    .run(booklistId, defaultBooklist.code, defaultBooklist.name, defaultBooklist.grade, defaultBooklist.totalAmount);

  const insertItem = db.prepare(`
    INSERT INTO booklist_items (id, booklist_id, name, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  defaultBooklist.items.forEach(item => {
    insertItem.run(randomUUID(), booklistId, item.name, item.quantity, item.rate, item.amount);
  });

  console.log('✓ Seeded default booklist');

  console.log('Database seeding completed!');
}

