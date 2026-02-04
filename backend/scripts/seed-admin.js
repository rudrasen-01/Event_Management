/**
 * Seed Admin User Script
 * Creates an admin user for testing the authentication system
 * 
 * Usage: node seed-admin.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Seed admin user
const seedAdmin = async () => {
  try {
    console.log('🌱 Starting Admin User Seeding...\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@ais.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log('   Email: admin@ais.com');
      console.log('\n💡 To reset, delete the user from MongoDB and run this script again.\n');
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ais.com',
      password: 'admin123', // Will be hashed automatically
      role: 'admin',
      phone: '9876543210',
      isActive: true,
      isEmailVerified: true
    });

    console.log('✅ Admin User Created Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ADMIN LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin@ais.com');
    console.log('Password: admin123');
    console.log('Role:     admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Create a test user as well
    const existingUser = await User.findOne({ email: 'user@ais.com' });
    if (!existingUser) {
      const testUser = await User.create({
        name: 'Test User',
        email: 'user@ais.com',
        password: 'user123', // Will be hashed automatically
        role: 'user',
        phone: '9876543211',
        isActive: true,
        isEmailVerified: true
      });

      console.log('✅ Test User Created Successfully!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 TEST USER LOGIN CREDENTIALS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:    user@ais.com');
      console.log('Password: user123');
      console.log('Role:     user');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('🎉 Seeding completed successfully!');
    console.log('You can now use these credentials to login.\n');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    if (error.name === 'ValidationError') {
      Object.values(error.errors).forEach(err => {
        console.error(`   - ${err.message}`);
      });
    }
  }
};

// Run the seeding
const runSeeder = async () => {
  await connectDB();
  await seedAdmin();
  mongoose.connection.close();
  console.log('📦 Database connection closed.\n');
};

runSeeder();
