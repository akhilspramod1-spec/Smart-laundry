const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_laundry', {
      // These options are no longer needed in Mongoose 6+
      // but keeping for compatibility if using older version
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('\n⚠️  Make sure MongoDB is running!');
    console.log('   Run: mongod\n');
    process.exit(1);
  }
};

module.exports = connectDB;
