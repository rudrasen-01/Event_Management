const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const VendorNew = require('./models/VendorNew');
    const vendors = await VendorNew.find({ isActive: true, verified: true })
      .limit(5)
      .select('_id businessName serviceType city');
    
    console.log('\n=== Active & Verified Vendors ===');
    if (vendors.length === 0) {
      console.log('No active and verified vendors found');
    } else {
      vendors.forEach(v => {
        console.log(`ID: ${v._id}`);
        console.log(`Name: ${v.businessName}`);
        console.log(`Service: ${v.serviceType}`);
        console.log(`City: ${v.city}`);
        console.log('---');
      });
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
