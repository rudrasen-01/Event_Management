/**
 * Script to delete existing admin and create a fresh one
 * Run: node scripts/recreate_admin.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const recreateAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('📦 Connected to MongoDB');
    
    const adminEmail = 'admin@aissignatureevent.com';
    
    // Delete existing admin
    const deleted = await User.deleteOne({ email: adminEmail });
    
    if (deleted.deletedCount > 0) {
      console.log('🗑️  Existing admin deleted');
    } else {
      console.log('ℹ️  No existing admin found');
    }
    
    // Create fresh admin user
    const adminData = {
      name: 'Admin',
      email: adminEmail,
      password: 'admin123456',
      role: 'admin',
      phone: '9999999999',
      isActive: true,
      isEmailVerified: true
    };
    
    const admin = await User.create(adminData);
    
    console.log('\n✅ Admin user created successfully!\n');
    console.log('📧 Login Credentials:');
    console.log('   Email:', admin.email);
    console.log('   Password: admin123456');
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);
    console.log('\n🔗 Login at: http://localhost:5173');
    console.log('\n⚠️  IMPORTANT: After login, all admin APIs should work!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

recreateAdmin();
