const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const VendorNew = require('../models/VendorNew');
const Area = require('../models/Area');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testSearchQuery() {
  try {
    console.log('\n🔍 TESTING SEARCH QUERY');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Find all active vendors in Indore
    console.log('TEST 1: All active vendors in Indore');
    console.log('─'.repeat(70));
    const activeVendors = await VendorNew.find({ 
      city: /indore/i,
      isActive: true 
    }).select('name serviceType city area location isActive verified');

    console.log(`Found: ${activeVendors.length} vendors\n`);
    activeVendors.forEach((v, idx) => {
      console.log(`${idx + 1}. ${v.name}`);
      console.log(`   Service: ${v.serviceType}`);
      console.log(`   City: ${v.city}, Area: ${v.area}`);
      console.log(`   Location: [${v.location?.coordinates?.[0]}, ${v.location?.coordinates?.[1]}]`);
      console.log(`   Active: ${v.isActive}, Verified: ${v.verified}`);
    });

    // Test 2: Find Vijay Nagar area
    console.log('\n\nTEST 2: Vijay Nagar area lookup');
    console.log('─'.repeat(70));
    const vijayNagarArea = await Area.findOne({ 
      normalizedName: 'vijay nagar'
    }).populate('city_id');

    if (vijayNagarArea) {
      console.log(`✅ Found: ${vijayNagarArea.name}`);
      console.log(`   City: ${vijayNagarArea.city_id?.name}`);
      console.log(`   Coordinates: [${vijayNagarArea.lon}, ${vijayNagarArea.lat}]`);

      // Test 3: Find vendors in Vijay Nagar
      console.log('\n\nTEST 3: Vendors in Vijay Nagar area');
      console.log('─'.repeat(70));
      const vijayNagarVendors = await VendorNew.find({
        area: /vijay nagar/i,
        isActive: true
      }).select('name serviceType area');

      console.log(`Found: ${vijayNagarVendors.length} vendors in Vijay Nagar\n`);
      vijayNagarVendors.forEach((v, idx) => {
        console.log(`${idx + 1}. ${v.name} (${v.serviceType})`);
      });

      // Test 4: Geospatial search near Vijay Nagar
      console.log('\n\nTEST 4: Geospatial search (5km radius from Vijay Nagar)');
      console.log('─'.repeat(70));
      const nearbyVendors = await VendorNew.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [vijayNagarArea.lon, vijayNagarArea.lat]
            },
            $maxDistance: 5000 // 5km in meters
          }
        },
        isActive: true
      }).limit(10).select('name serviceType area location');

      console.log(`Found: ${nearbyVendors.length} vendors within 5km\n`);
      nearbyVendors.forEach((v, idx) => {
        const distance = calculateDistance(
          vijayNagarArea.lat, vijayNagarArea.lon,
          v.location.coordinates[1], v.location.coordinates[0]
        );
        console.log(`${idx + 1}. ${v.name} (${v.serviceType})`);
        console.log(`   Area: ${v.area}`);
        console.log(`   Distance: ${distance.toFixed(2)} km`);
      });
    } else {
      console.log('❌ Vijay Nagar area not found in database!');
    }

    // Test 5: Check if photography service exists
    console.log('\n\nTEST 5: Photography vendors');
    console.log('─'.repeat(70));
    const photographyVendors = await VendorNew.find({
      serviceType: 'photography',
      city: /indore/i,
      isActive: true
    }).select('name area');

    console.log(`Found: ${photographyVendors.length} photography vendors\n`);
    photographyVendors.forEach((v, idx) => {
      console.log(`${idx + 1}. ${v.name} - ${v.area}`);
    });

    console.log('\n' + '━'.repeat(70));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
}

testSearchQuery();
