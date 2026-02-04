const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Vendor = require('../models/VendorNew');
const VendorInquiry = require('../models/VendorInquiry');
const ContactInquiry = require('../models/ContactInquiry');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management';
    console.log('Connecting to:', uri);
    await mongoose.connect(uri, {});

    // Known seeded vendor emails and vendor names used by seed scripts
    const vendorEmails = [
      'royal@photography.com',
      'divine@caterers.com',
      'perfect@weddingplanners.com',
      'sound@lightsmagic.com',
      'bloom@florist.com',
      'grand@banquethalls.com'
    ];

    const vendorNames = [
      'Royal Wedding Photography',
      'Divine Caterers',
      'Perfect Wedding Planners',
      'Sound & Lights Magic',
      'Bloom Florist',
      'Grand Banquet Halls'
    ];

    // Known seeded inquiry user names
    const inquiryUserNames = ['Priya Sharma', 'Rahul Verma', 'Anjali Patel', 'Amit Kumar', 'Neha Singh'];

    // Delete vendor inquiries created by seeder (by vendor reference or userName)
    const vendors = await Vendor.find({ 'contact.email': { $in: vendorEmails } }).lean();
    const vendorIds = vendors.map(v => v._id);

    if (vendorIds.length > 0) {
      const viRes = await VendorInquiry.deleteMany({ vendorId: { $in: vendorIds } });
      console.log('Deleted vendor inquiries for seeded vendors:', viRes.deletedCount);
    }

    // Also delete vendor inquiries by userName
    const viByUser = await VendorInquiry.deleteMany({ userName: { $in: inquiryUserNames } });
    console.log('Deleted vendor inquiries by seeded user names:', viByUser.deletedCount);

    // Delete contact inquiries by userName/email
    const ciRes = await ContactInquiry.deleteMany({ userName: { $in: inquiryUserNames } });
    console.log('Deleted contact inquiries by seeded user names:', ciRes.deletedCount);

    // Optionally delete seeded vendors
    const vendorDel = await Vendor.deleteMany({ $or: [ { 'contact.email': { $in: vendorEmails } }, { name: { $in: vendorNames } } ] });
    console.log('Deleted seeded vendors:', vendorDel.deletedCount);

    await mongoose.connection.close();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error removing seeded data:', err);
    process.exit(1);
  }
})();
