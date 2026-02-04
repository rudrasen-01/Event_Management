const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/event-management');
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@aissignatureevent.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Please run: node create-admin.js first');
      process.exit(1);
    }

    console.log('📧 Found admin user:', admin.email);
    console.log('🆔 User ID:', admin._id);
    console.log('👤 Role:', admin.role);
    console.log('✅ Active:', admin.isActive);

    // Reset password to default
    const newPassword = 'admin123456';
    admin.password = newPassword; // Will be hashed by pre-save hook
    await admin.save();

    console.log('\n🎉 Password reset successful!');
    console.log('\n' + '='.repeat(60));
    console.log('📧 Email: admin@aissignatureevent.com');
    console.log('🔑 Password: admin123456');
    console.log('='.repeat(60));
    console.log('\n✅ You can now login at:');
    console.log('   http://localhost:5173/admin/dashboard');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

resetAdminPassword();
