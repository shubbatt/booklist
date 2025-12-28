# BookVoucher - School Supply Management App

A modern, user-friendly web application for managing book voucher redemptions for schools. Built with React, TypeScript, and Zustand for state management.

## Features

- 📋 **Voucher Redemption Management**: Easy-to-use form to capture parent and student details
- 📚 **Booklist Management**: Create and manage grade-specific booklists with items, quantities, and pricing
- 📊 **Dashboard**: Overview of orders, pending deliveries, and statistics
- 🔍 **Search & Filter**: Quickly find orders by name, voucher ID, or phone number
- 📦 **Order Tracking**: Track delivery status (Pending, Wrapping, Delivered, Collected)
- ⚙️ **Settings**: Manage schools, locations, and staff members
- 💾 **Local Storage**: All data is automatically saved in your browser
- 📤 **Data Export/Import**: Backup and restore your data

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0 recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Usage

### Creating a New Voucher Redemption

1. Click "New Voucher" in the sidebar or dashboard
2. Fill in the parent and student details
3. Select the appropriate booklist for the student's grade
4. Customize exercise book quantities if needed
5. Add any special requirements (textbooks, cellophane, etc.)
6. Set delivery date and status
7. Click "Save Voucher"

### Managing Booklists

1. Go to "Booklists" in the sidebar
2. Click "New Booklist" to create a new grade booklist
3. Add items with quantities and rates
4. The total amount is automatically calculated
5. Edit or delete existing booklists as needed

### Viewing Orders

1. Go to "All Orders" to see all redemptions
2. Use the search bar to find specific orders
3. Filter by delivery status
4. Click on an order to expand and see full details
5. Click on status badge to quickly update delivery status

### Settings

- Add new schools, locations, or staff members
- Export your data for backup
- Import previously exported data

## Data Storage

All data is stored locally in your browser's localStorage. This means:
- ✅ No server required
- ✅ Works offline
- ✅ Fast and private
- ⚠️ Data is browser-specific (clear browser data = lose data)
- ⚠️ Export regularly for backup

## Default Data

The app comes pre-loaded with:
- **Grade 1 Booklist** (VCH-GR1-ALL) with 18 items totaling MVR 589
- Sample schools: Nooraanee School, Sharafuddeen School, Hiriya School
- Sample locations: Hithadhoo, Feydhoo, Maradhoo
- Sample staff: counter, 1010, 1011

## Project Structure

```
src/
├── components/       # React components
│   ├── Dashboard.tsx
│   ├── NewRedemption.tsx
│   ├── RedemptionsList.tsx
│   ├── BooklistManager.tsx
│   ├── Settings.tsx
│   └── Sidebar.tsx
├── store/          # Zustand state management
│   └── index.ts
├── types/          # TypeScript type definitions
│   └── index.ts
├── App.tsx         # Main app component
├── App.css         # Styles
└── main.tsx        # Entry point
```

## Technologies Used

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **UUID** - Unique ID generation

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

This project is private and for internal use only.
