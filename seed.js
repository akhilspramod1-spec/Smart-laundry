require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const ClothingItem = require('./models/ClothingItem');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_laundry';

const clothingItems = [
  { numericId: 1, name: 'Shirt', icon: 'shirt', category: 'topwear', washPrice: 40, ironPrice: 25, dryCleanPrice: 100, hasWash: true, hasIron: true, hasDryClean: true, hasWashIron: true },
  { numericId: 2, name: 'T-Shirt', icon: 'tshirt', category: 'topwear', washPrice: 30, ironPrice: 20, dryCleanPrice: 80, hasWash: true, hasIron: true, hasDryClean: true, hasWashIron: true },
  { numericId: 3, name: 'Pant', icon: 'pant', category: 'bottomwear', washPrice: 50, ironPrice: 30, dryCleanPrice: 110, hasWash: true, hasIron: true, hasDryClean: true, hasWashIron: true },
  { numericId: 4, name: 'Jeans', icon: 'jeans', category: 'bottomwear', washPrice: 60, ironPrice: 30, dryCleanPrice: 120, hasWash: true, hasIron: true, hasDryClean: true, hasWashIron: true },
  { numericId: 5, name: 'Sweater', icon: 'sweater', category: 'topwear', washPrice: 80, ironPrice: 40, dryCleanPrice: 130, hasWash: true, hasIron: true, hasDryClean: true, hasWashIron: true },
  { numericId: 6, name: 'Jacket', icon: 'jacket', category: 'outerwear', washPrice: 100, ironPrice: 50, dryCleanPrice: 150, hasWash: true, hasIron: true, hasDryClean: true, hasWashIron: true },
  { numericId: 7, name: 'Dress', icon: 'dress', category: 'fullwear', washPrice: 90, ironPrice: 45, dryCleanPrice: 140, hasWash: true, hasIron: true, hasDryClean: true, hasWashIron: true },
  { numericId: 8, name: 'Saree', icon: 'saree', category: 'traditionalwear', washPrice: 120, ironPrice: 60, dryCleanPrice: 180, hasWash: true, hasIron: true, hasDryClean: true, hasWashIron: true },
  { numericId: 9, name: 'Suit', icon: 'suit', category: 'formalwear', washPrice: 150, ironPrice: 70, dryCleanPrice: 200, hasWash: true, hasIron: true, hasDryClean: true, hasWashIron: true },
  { numericId: 10, name: 'Bedsheet', icon: 'bedsheet', category: 'home', washPrice: 70, ironPrice: 35, dryCleanPrice: 120, hasWash: true, hasIron: true, hasDryClean: false, hasWashIron: true },
  { numericId: 11, name: 'Blanket', icon: 'blanket', category: 'home', washPrice: 100, ironPrice: 0, dryCleanPrice: 0, hasWash: true, hasIron: false, hasDryClean: false, hasWashIron: false },
  { numericId: 12, name: 'Curtains', icon: 'curtains', category: 'home', washPrice: 80, ironPrice: 45, dryCleanPrice: 130, hasWash: true, hasIron: true, hasDryClean: false, hasWashIron: true },
  { numericId: 13, name: 'Towel', icon: 'towel', category: 'home', washPrice: 40, ironPrice: 0, dryCleanPrice: 0, hasWash: true, hasIron: false, hasDryClean: false, hasWashIron: false },
  { numericId: 14, name: 'Scarf', icon: 'scarf', category: 'accessories', washPrice: 30, ironPrice: 0, dryCleanPrice: 0, hasWash: true, hasIron: false, hasDryClean: false, hasWashIron: false },
  { numericId: 15, name: 'Socks', icon: 'socks', category: 'accessories', washPrice: 15, ironPrice: 0, dryCleanPrice: 0, hasWash: true, hasIron: false, hasDryClean: false, hasWashIron: false }
];

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await ClothingItem.deleteMany({});
    console.log('✅ Data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@smartlaundry.com',
      password: hashedPassword,
      phone: '9019785450',
      userType: 'admin',
      studentVerified: false,
      verificationStatus: 'not_required',
      isActive: true
    });
    console.log('✅ Admin user created');
    console.log('   Email: admin@smartlaundry.com');
    console.log('   Password: admin123');

    // Create clothing items
    console.log('👕 Creating clothing items...');
    await ClothingItem.insertMany(clothingItems);
    console.log(`✅ ${clothingItems.length} clothing items created`);

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('You can now:');
    console.log('1. Run: npm run dev');
    console.log('2. Open index.html in browser');
    console.log('3. Login as admin or register new users');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
