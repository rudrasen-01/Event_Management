/**
 * Script to create an admin user
 * Run: node scripts/create_admin.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('📦 Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Name:', existingAdmin.name);
      console.log('\n💡 Use these credentials to login to the admin panel');
      process.exit(0);
    }
    
    // Create admin user
    const adminData = {
      name: 'Admin',
      email: 'admin@eventplatform.com',
      password: 'admin123', // Change this after first login!
      role: 'admin',
      phone: '9999999999',
      isActive: true
    };
    
    const admin = await User.create(adminData);
    
    console.log('\n✅ Admin user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email:', admin.email);
    console.log('   Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n🔗 Access admin panel at: http://localhost:5173/admin');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
