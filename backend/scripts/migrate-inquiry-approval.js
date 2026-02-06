/**
 * Migration Script: Add Approval Status to Existing Inquiries
 * 
 * This script updates all existing VendorInquiry documents to include
 * the new approvalStatus field. You can choose to auto-approve existing
 * inquiries or set them as pending for review.
 * 
 * Usage:
 *   node backend/scripts/migrate-inquiry-approval.js [--mode=approved|pending]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const VendorInquiry = require('../models/VendorInquiry');

// Configuration
const MODE = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'approved';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const migrateInquiries = async () => {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 INQUIRY APPROVAL MIGRATION');
    console.log('='.repeat(60));
    
    // Check for inquiries without approvalStatus
    const inquiriesWithoutApproval = await VendorInquiry.countDocuments({
      approvalStatus: { $exists: false }
    });
    
    console.log(`\n📊 Found ${inquiriesWithoutApproval} inquiries without approval status`);
    
    if (inquiriesWithoutApproval === 0) {
      console.log('✅ All inquiries already have approval status. No migration needed.');
      return;
    }
    
    console.log(`📝 Migration Mode: ${MODE.toUpperCase()}\n`);
    
    let updateData;
    
    if (MODE === 'approved') {
      console.log('✅ Setting all existing inquiries to APPROVED');
      console.log('   → Vendors will immediately see these inquiries');
      updateData = {
        approvalStatus: 'approved',
        approvedAt: new Date()
      };
    } else if (MODE === 'pending') {
      console.log('⏳ Setting all existing inquiries to PENDING');
      console.log('   → Admin must review and approve before vendors can see them');
      updateData = {
        approvalStatus: 'pending'
      };
    } else {
      console.error('❌ Invalid mode. Use --mode=approved or --mode=pending');
      process.exit(1);
    }
    
    // Perform the update
    const result = await VendorInquiry.updateMany(
      { approvalStatus: { $exists: false } },
      { $set: updateData }
    );
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATION COMPLETED');
    console.log('='.repeat(60));
    console.log(`📝 Documents matched: ${result.matchedCount}`);
    console.log(`✅ Documents updated: ${result.modifiedCount}`);
    console.log(`📊 Approval Status: ${MODE}`);
    
    // Show statistics
    console.log('\n📊 CURRENT APPROVAL STATISTICS:');
    const [pending, approved, rejected, total] = await Promise.all([
      VendorInquiry.countDocuments({ approvalStatus: 'pending' }),
      VendorInquiry.countDocuments({ approvalStatus: 'approved' }),
      VendorInquiry.countDocuments({ approvalStatus: 'rejected' }),
      VendorInquiry.countDocuments()
    ]);
    
    console.log(`   ⏳ Pending:  ${pending}`);
    console.log(`   ✅ Approved: ${approved}`);
    console.log(`   ❌ Rejected: ${rejected}`);
    console.log(`   📦 Total:    ${total}`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Migration Error:', error);
    process.exit(1);
  }
};

const main = async () => {
  await connectDB();
  await migrateInquiries();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
};

// Run migration
main();
