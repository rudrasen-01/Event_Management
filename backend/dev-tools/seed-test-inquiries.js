const mongoose = require('mongoose');
const dotenv = require('dotenv');
const VendorInquiry = require('../models/VendorInquiry');
const ContactInquiry = require('../models/ContactInquiry');
const Vendor = require('../models/VendorNew');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

// Safety: only run this seeder when the env flag is explicitly set
if (process.env.SEED_TEST_INQUIRIES !== 'true') {
  console.log('\n⚠️  SEED_TEST_INQUIRIES not enabled. To run this seeder set SEED_TEST_INQUIRIES=true in your environment.');
  process.exit(0);
}

const seedInquiries = async () => {
  try {
    console.log('✅ MongoDB Connected\n');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management');

    // Get some vendors
    const vendors = await Vendor.find().limit(3);
    
    if (vendors.length === 0) {
      console.log('⚠️  No vendors found. Please seed vendors first.');
      process.exit(1);
    }

    // Create vendor inquiries
    const vendorInquiries = [
      {
        vendorId: vendors[0]._id,
        userName: 'Priya Sharma',
        userEmail: 'priya.sharma@example.com',
        userContact: '9876543211',
        eventType: 'Wedding',
        eventDate: new Date('2026-04-15'),
        guestCount: 500,
        venue: 'Grand Banquet Hall, Indore',
        budget: 150000,
        requirements: 'Need professional wedding photography with candid shots',
        status: 'pending'
      },
      {
        vendorId: vendors[1]._id,
        userName: 'Rahul Verma',
        userEmail: 'rahul.verma@example.com',
        userContact: '9876543212',
        eventType: 'Birthday',
        eventDate: new Date('2026-03-20'),
        guestCount: 100,
        venue: 'Home, Indore',
        budget: 50000,
        requirements: 'Catering for 100 people, need veg and non-veg options',
        status: 'contacted'
      },
      {
        vendorId: vendors[2]._id,
        userName: 'Anjali Patel',
        userEmail: 'anjali.patel@example.com',
        userContact: '9876543213',
        eventType: 'Corporate Event',
        eventDate: new Date('2026-05-10'),
        guestCount: 200,
        venue: 'Hotel Radisson, Indore',
        budget: 200000,
        requirements: 'Complete event planning for corporate annual day',
        status: 'responded'
      }
    ];

    // Create contact inquiries
    const contactInquiries = [
      {
        userName: 'Amit Kumar',
        userEmail: 'amit.kumar@example.com',
        userContact: '9876543214',
        eventType: 'Wedding',
        message: 'Looking for complete wedding services including venue, catering, and decoration',
        status: 'pending'
      },
      {
        userName: 'Neha Singh',
        userEmail: 'neha.singh@example.com',
        userContact: '9876543215',
        eventType: 'Engagement',
        message: 'Need vendors for engagement ceremony for 150 guests',
        status: 'pending'
      }
    ];

    // Clear existing inquiries
    await VendorInquiry.deleteMany({});
    await ContactInquiry.deleteMany({});

    // Insert new inquiries
    await VendorInquiry.insertMany(vendorInquiries);
    await ContactInquiry.insertMany(contactInquiries);

    console.log('🌱 Test Inquiries Seeded Successfully!\n');
    console.log('📊 Summary:');
    console.log(`   ✅ Vendor Inquiries: ${vendorInquiries.length}`);
    console.log(`   ✅ Contact Inquiries: ${contactInquiries.length}`);
    console.log(`   📋 Total: ${vendorInquiries.length + contactInquiries.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding inquiries:', error);
    process.exit(1);
  }
};

seedInquiries();
