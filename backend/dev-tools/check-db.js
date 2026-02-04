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
    const conn = await mongoose.connect(uri, { });
    console.log('Connected to host:', conn.connection.host);
    console.log('Database name:', conn.connection.name);

    const vendorCount = await Vendor.countDocuments();
    const vendorInquiryCount = await VendorInquiry.countDocuments();
    const contactInquiryCount = await ContactInquiry.countDocuments();

    console.log('\nCounts:');
    console.log('  vendors:', vendorCount);
    console.log('  vendorInquiries:', vendorInquiryCount);
    console.log('  contactInquiries:', contactInquiryCount);

    const sampleVendor = await Vendor.findOne().lean();
    const sampleVendorInquiry = await VendorInquiry.findOne().lean();
    const sampleContactInquiry = await ContactInquiry.findOne().lean();

    console.log('\nSample documents (if any):');
    console.log('  vendor:', sampleVendor ? JSON.stringify(sampleVendor, null, 2) : 'NONE');
    console.log('  vendorInquiry:', sampleVendorInquiry ? JSON.stringify(sampleVendorInquiry, null, 2) : 'NONE');
    console.log('  contactInquiry:', sampleContactInquiry ? JSON.stringify(sampleContactInquiry, null, 2) : 'NONE');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error during DB check:', err);
    process.exit(1);
  }
})();
