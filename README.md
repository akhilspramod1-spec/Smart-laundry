# 🧺 Smart Laundry Backend (MongoDB Version)

## ✨ No PostgreSQL Required! No Password Headaches!

This version uses **MongoDB** instead of PostgreSQL — much easier to set up!

---

## 📋 Requirements

1. **Node.js** (you already have this)
2. **MongoDB Community Edition** (we'll install this — it's free and easy!)

---

## 🚀 Setup Guide (4 Simple Steps)

### Step 1: Install MongoDB

**Download:** https://www.mongodb.com/try/download/community

1. Click **Download** (Windows x64 .msi installer)
2. Run the installer
3. Choose **Complete** installation
4. ✅ Check "Install MongoDB as a Service"
5. ✅ Check "Install MongoDB Compass" (GUI tool)
6. Click **Install**
7. Done!

MongoDB will start automatically as a Windows service.

---

### Step 2: Setup Project

1. Extract the `smart-laundry-mongodb.zip`
2. Open the folder in VS Code
3. Create `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/smart_laundry
JWT_SECRET=smartlaundry_super_secret_key_2026
JWT_EXPIRE=7d
PORT=5000
GST_RATE=0.18
```

4. Install dependencies:
```bash
npm install
```

---

### Step 3: Seed the Database

This creates the admin user and all 15 clothing items:

```bash
npm run seed
```

You should see:
```
✅ Connected to MongoDB
✅ Data cleared
✅ Admin user created
   Email: admin@smartlaundry.com
   Password: admin123
✅ 15 clothing items created
🎉 Database seeded successfully!
```

---

### Step 4: Start Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
📦 Database: smart_laundry
🚀  Smart Laundry API v2.0 (MongoDB)
🌐  http://localhost:5000
💾  Database: MongoDB
💰  GST Rate: 18%
```

---

## 🎯 Test It

1. Open `index.html` in browser
2. Click **Sign Up** → Register a new account
3. Or login as admin:
   - Email: `admin@smartlaundry.com`
   - Password: `admin123`

---

## 📊 View Database (Optional)

MongoDB Compass should have installed automatically.

1. Open **MongoDB Compass**
2. Connection string is already set: `mongodb://localhost:27017`
3. Click **Connect**
4. You'll see the `smart_laundry` database with collections:
   - `users` (your accounts)
   - `clothingitems` (15 items)
   - `bookings` (orders with GST)

---

## 🔧 Troubleshooting

### "MongoServerError: connect ECONNREFUSED"

MongoDB service not running. Fix:

1. Press **Windows key** → search **Services**
2. Find **MongoDB Server**
3. Right-click → **Start**

---

### "npm ERR! Cannot find module"

Run:
```bash
npm install
```

---

### "Port 5000 already in use"

Change PORT in `.env` file:
```
PORT=5001
```

---

## 📁 Project Structure

```
smart-laundry-mongodb/
├── server.js              ← Main entry
├── seed.js                ← Database seeder
├── package.json
├── .env
├── config/
│   └── db.js              ← MongoDB connection
├── models/
│   ├── User.js            ← User schema
│   ├── ClothingItem.js    ← Items schema
│   └── Booking.js         ← Booking schema (with GST)
├── controllers/
│   ├── authController.js
│   ├── bookingController.js
│   └── itemsController.js
├── middleware/
│   └── auth.js
└── routes/
    ├── auth.js
    ├── bookings.js
    └── items.js
```

---

## 💰 GST Features

All bookings include full GST breakdown:
- Subtotal (before discount)
- Student Discount (20%)
- Taxable Amount
- CGST (9%)
- SGST (9%)
- Grand Total (with GST)
- Invoice Number (auto-generated)

---

## 🎓 Student Email Domains

Edit `controllers/authController.js` to add your college:

```js
const APPROVED_STUDENT_DOMAINS = [
  'kristujayanti.com',
  'edu.in',
  'ac.in',
  'iiit.ac.in',
  'nit.ac.in',
  'iit.ac.in',
  // Add your domains here
];
```

---

## ✅ That's It!

Much easier than PostgreSQL! No password issues, no pgAdmin, no headaches! 🎉
