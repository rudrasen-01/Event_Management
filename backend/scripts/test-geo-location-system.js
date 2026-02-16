const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { geocodeAddress, buildAddressString } = require('../services/geocodingService');
const VendorNew = require('../models/VendorNew');
const Area = require('../models/Area');
const City = require('../models/City');

/**
 * ============================================================================
 * GEO-LOCATION SYSTEM TEST
 * ============================================================================
 * This script tests the complete geo-location flow:
 * 1. Geocoding service
 * 2. Area auto-creation from vendor registration
 * 3. Area fetching by city name
 * 4. Geo-distance search
 * ============================================================================
 */

async function testGeocodingService() {
  console.log('\n━'.repeat(40));
  console.log('TEST 1: GEOCODING SERVICE');
  console.log('━'.repeat(40));
  
  const testAddresses = [
    { area: 'Saket', city: 'Delhi', pincode: '110017' },
    { area: 'Connaught Place', city: 'New Delhi', pincode: '110001' },
    { area: 'Sector 62', city: 'Noida', pincode: '201309' }
  ];
  
  for (const addr of testAddresses) {
    try {
      const addressString = buildAddressString(addr);
      console.log(`\n📍 Testing: ${addressString}`);
      
      const result = await geocodeAddress(addressString);
      console.log(`   ✅ Success:`);
      console.log(`      Coordinates: [${result.lon}, ${result.lat}]`);
      console.log(`      Display: ${result.displayName}`);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
}

async function testAreaAutoCreation() {
  console.log('\n\n━'.repeat(40));
  console.log('TEST 2: AREA AUTO-CREATION');
  console.log('━'.repeat(40));
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');
  
  // Find Delhi city
  const delhiCity = await City.findOne({ name: /^Delhi$/i });
  if (!delhiCity) {
    console.log('❌ Delhi city not found in database');
    return;
  }
  
  console.log(`✅ Found city: ${delhiCity.name} (${delhiCity._id})`);
  
  // Test area creation
  const testAreas = [
    { area: 'Test Area 1', lat: 28.5244, lon: 77.2066 },
    { area: 'Test Area 2', lat: 28.6315, lon: 77.2167 }
  ];
  
  for (const areaData of testAreas) {
    try {
      console.log(`\n📍 Creating area: ${areaData.area}`);
      
      const area = await Area.createOrUpdateFromVendor({
        cityId: delhiCity._id,
        cityName: delhiCity.name,
        cityOsmId: delhiCity.osm_id,
        area: areaData.area,
        lat: areaData.lat,
        lon: areaData.lon
      });
      
      console.log(`   ✅ Area created/updated: ${area.name}`);
      console.log(`      ID: ${area._id}`);
      console.log(`      Vendor Count: ${area.vendorCount}`);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
}

async function testGetAreasByCity() {
  console.log('\n\n━'.repeat(40));
  console.log('TEST 3: GET AREAS BY CITY NAME');
  console.log('━'.repeat(40));
  
  const cityName = 'Delhi';
  
  // Find city
  const city = await City.findOne({ name: new RegExp(`^${cityName}$`, 'i') });
  if (!city) {
    console.log(`❌ City "${cityName}" not found`);
    return;
  }
  
  console.log(`\n✅ Found city: ${city.name}`);
  
  // Get areas
  const areas = await Area.find({ city_id: city._id })
    .sort({ name: 1 })
    .limit(10)
    .select('name lat lon vendorCount');
  
  console.log(`\n📍 Found ${areas.length} areas:`);
  areas.forEach((area, i) => {
    console.log(`   ${i + 1}. ${area.name}`);
    console.log(`      Coordinates: [${area.lon}, ${area.lat}]`);
    console.log(`      Vendors: ${area.vendorCount || 0}`);
  });
}

async function testGeoDistanceSearch() {
  console.log('\n\n━'.repeat(40));
  console.log('TEST 4: GEO-DISTANCE VENDOR SEARCH');
  console.log('━'.repeat(40));
  
  // Find an area with coordinates
  const area = await Area.findOne({ 
    cityName: /^Delhi$/i,
    vendorCount: { $gt: 0 }
  });
  
  if (!area) {
    console.log('⚠️  No areas with vendors found for testing');
    return;
  }
  
  console.log(`\n📍 Searching near: ${area.name}, ${area.cityName}`);
  console.log(`   Coordinates: [${area.lon}, ${area.lat}]`);
  
  // Geo-distance query
  const vendors = await VendorNew.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: area.location.coordinates
        },
        $maxDistance: 5000 // 5km
      }
    }
  }).limit(5);
  
  console.log(`\n✅ Found ${vendors.length} vendors within 5km:`);
  vendors.forEach((vendor, i) => {
    const vendorCoords = vendor.location.coordinates;
    console.log(`\n   ${i + 1}. ${vendor.name}`);
    console.log(`      Area: ${vendor.area}, ${vendor.city}`);
    console.log(`      Coordinates: [${vendorCoords[0]}, ${vendorCoords[1]}]`);
    console.log(`      Service: ${vendor.serviceType}`);
  });
}

async function runTests() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         GEO-LOCATION SYSTEM INTEGRATION TEST               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
    
    // Test 1: Geocoding
    await testGeocodingService();
    
    // Tests 2-4 require MongoDB
    await testAreaAutoCreation();
    await testGetAreasByCity();
    await testGeoDistanceSearch();
    
    console.log('\n\n━'.repeat(40));
    console.log('✅ ALL TESTS COMPLETED');
    console.log('━'.repeat(40) + '\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

runTests();
