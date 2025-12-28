# Database Seeders

The database seeders populate the database with initial/default data when the database is first created.

## What Gets Seeded

1. **Users**
   - Default admin user: `admin` / `admin123`

2. **Outlets**
   - Hithadhoo Outlet (OUT-001)
   - Feydhoo Outlet (OUT-002)
   - Maradhoo Outlet (OUT-003)

3. **Schools**
   - Nooraanee School
   - Sharafuddeen School
   - Hiriya School

4. **Locations**
   - Hithadhoo
   - Feydhoo
   - Maradhoo

5. **Staff**
   - counter
   - 1010
   - 1011

6. **Option Items**
   - Has Textbooks
   - Has Stationary (default checked)
   - Lens
   - No Name
   - Cellophane

7. **Default Booklist**
   - Grade 1 Stationary List with all items

## Running Seeders

Seeders run automatically when the server starts if the database is empty.

To manually run seeders:
```bash
cd server
npm run seed
```

## Important Notes

- Seeders only run if the database is empty (no users exist)
- This prevents overwriting existing data
- To re-seed, delete the `booklist.db` file and restart the server

## Customizing Seed Data

Edit `server/seeders.js` to modify the initial data that gets seeded.

