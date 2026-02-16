const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const VendorNew = require('../models/VendorNew');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function normalizeServiceTypes() {
  try {
    console.log('\n🔧 NORMALIZING VENDOR SERVICE TYPES');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Update dj-sound-system to dj
    const djSoundResult = await VendorNew.updateMany(
      { serviceType: 'dj-sound-system' },
      { $set: { serviceType: 'dj' } }
    );
    console.log(`✅ Updated ${djSoundResult.modifiedCount} vendors: dj-sound-system → dj`);

    // Update party-dj to dj
    const partyDjResult = await VendorNew.updateMany(
      { serviceType: 'party-dj' },
      { $set: { serviceType: 'dj' } }
    );
    console.log(`✅ Updated ${partyDjResult.modifiedCount} vendors: party-dj → dj`);

    console.log('\n━'.repeat(70));
    console.log('✅ Service types normalized successfully!');
    console.log('💡 All vendors now use standard service types.');
    console.log('━'.repeat(70));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

normalizeServiceTypes();
