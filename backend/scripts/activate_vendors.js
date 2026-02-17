#!/usr/bin/env node
// Activate vendors migration script
// Usage:
//   node backend/scripts/activate_vendors.js --all
//   node backend/scripts/activate_vendors.js --city=Indore

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const Vendor = require('../models/VendorNew');

async function run() {
  await connectDB();

  const args = process.argv.slice(2);
  const opts = {};
  args.forEach(a => {
    if (a.startsWith('--city=')) opts.city = a.split('=')[1];
    if (a === '--all') opts.all = true;
    if (a.startsWith('--service=')) opts.service = a.split('=')[1];
  });

  let filter = {};
  if (!opts.all) {
    if (opts.city) filter.city = new RegExp(opts.city, 'i');
    if (opts.service) filter.serviceType = new RegExp(opts.service, 'i');
    if (!opts.city && !opts.service) {
      console.error('No target specified. Use --all or --city=CityName or --service=type');
      process.exit(1);
    }
  }

  try {
    const totalBefore = await Vendor.countDocuments(filter);
    const activeBefore = await Vendor.countDocuments({ ...filter, isActive: true });
    console.log(`Found ${totalBefore} vendors matching filter. ${activeBefore} already active.`);

    const res = await Vendor.updateMany(filter, { $set: { isActive: true } });
    console.log('Update result:', res);

    const activeAfter = await Vendor.countDocuments({ ...filter, isActive: true });
    console.log(`Active vendors after update: ${activeAfter}`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
