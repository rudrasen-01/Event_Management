/**
 * Script to add a new admin user (allows multiple admins)
 * Run: node scripts/add_admin.js
 * 
 * You can also pass custom credentials:
 * node scripts/add_admin.js "Admin Name" "admin@example.com" "password123"
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const addAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('📦 Connected to MongoDB');
    
    // Get credentials from command line or use defaults
    const name = process.argv[2] || 'Admin2';
    const email = process.argv[3] || 'admin2@eventplatform.com';
    const password = process.argv[4] || 'admin123456';
    const phone = process.argv[5] || '8888888888';
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log('❌ User with email', email, 'already exists!');
      console.log('   Role:', existingUser.role);
      console.log('   Name:', existingUser.name);
      console.log('\n💡 Try a different email address');
      process.exit(1);
    }
    
    // Create new admin user
    const adminData = {
      name,
      email,
      password,
      role: 'admin',
      phone,
      isActive: true,
      isEmailVerified: true
    };
    
    const admin = await User.create(adminData);
    
    console.log('\n✅ New admin user created successfully!\n');
    console.log('📧 Login Credentials:');
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Password:', password);
    console.log('   Phone:', admin.phone);
    console.log('   Role:', admin.role);
    console.log('   ID:', admin._id);
    
    // Show all admins
    const allAdmins = await User.find({ role: 'admin' }).select('name email phone createdAt');
    console.log('\n👥 All Admin Users in System:');
    allAdmins.forEach((adm, index) => {
      console.log(`   ${index + 1}. ${adm.name} (${adm.email}) - Created: ${adm.createdAt.toLocaleDateString()}`);
    });
    
    console.log('\n🔗 Access admin panel at: http://localhost:5173/admin');
    console.log('\n⚠️  IMPORTANT: Keep these credentials secure!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(field => {
        console.error(`   - ${field}: ${error.errors[field].message}`);
      });
    }
    process.exit(1);
  }
};

addAdmin();
