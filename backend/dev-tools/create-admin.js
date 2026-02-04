const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('Connection string:', process.env.MONGO_URI || 'mongodb://localhost:27017/event-management');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/event-management');
    console.log('\n✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@aissignatureevent.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('\n📧 Email: admin@aissignatureevent.com');
      console.log('🔑 Password: (existing password)');
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated user role to admin');
      }
      
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@aissignatureevent.com',
      password: hashedPassword,
      role: 'admin',
      phone: '9999999999',
      isActive: true
    });

    console.log('\n🎉 Admin user created successfully!');
    console.log('\n' + '='.repeat(60));
    console.log('📧 Email: admin@aissignatureevent.com');
    console.log('🔑 Password: admin123456');
    console.log('='.repeat(60));
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    console.log('\n✅ You can now login to the admin panel at:');
    console.log('   http://localhost:5173/admin/dashboard');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
