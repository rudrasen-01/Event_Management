const mongoose = require('mongoose');
const path = require('path');
const City = require('../models/City');
const Area = require('../models/Area');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// MANUAL DELHI NCR AREAS - POPULAR LOCATIONS
// ============================================================================

const DELHI_AREAS = {
  'Delhi': [
    { name: 'Connaught Place', lat: 28.6315, lon: 77.2167, type: 'locality' },
    { name: 'Karol Bagh', lat: 28.6519, lon: 77.1920, type: 'suburb' },
    { name: 'Lajpat Nagar', lat: 28.5677, lon: 77.2432, type: 'suburb' },
    { name: 'Saket', lat: 28.5244, lon: 77.2066, type: 'suburb' },
    { name: 'Rohini', lat: 28.7495, lon: 77.0680, type: 'suburb' },
    { name: 'Dwarka', lat: 28.5921, lon: 77.0460, type: 'suburb' },
    { name: 'Janakpuri', lat: 28.6217, lon: 77.0841, type: 'suburb' },
    { name: 'Pitampura', lat: 28.6981, lon: 77.1318, type: 'suburb' },
    { name: 'Rajouri Garden', lat: 28.6414, lon: 77.1218, type: 'suburb' },
    { name: 'Mayur Vihar', lat: 28.6089, lon: 77.3008, type: 'suburb' },
    { name: 'Vasant Kunj', lat: 28.5204, lon: 77.1577, type: 'suburb' },
    { name: 'Hauz Khas', lat: 28.5494, lon: 77.2001, type: 'suburb' },
    { name: 'South Extension', lat: 28.5700, lon: 77.2235, type: 'suburb' },
    { name: 'Greater Kailash', lat: 28.5488, lon: 77.2401, type: 'suburb' },
    { name: 'Nehru Place', lat: 28.5494, lon: 77.2501, type: 'locality' },
    { name: 'Chandni Chowk', lat: 28.6506, lon: 77.2303, type: 'locality' },
    { name: 'Paharganj', lat: 28.6441, lon: 77.2151, type: 'locality' },
    { name: 'Green Park', lat: 28.5595, lon: 77.2069, type: 'suburb' },
    { name: 'Malviya Nagar', lat: 28.5283, lon: 77.2076, type: 'suburb' },
    { name: 'Punjabi Bagh', lat: 28.6693, lon: 77.1314, type: 'suburb' },
    { name: 'Preet Vihar', lat: 28.6477, lon: 77.2974, type: 'suburb' },
    { name: 'Shahdara', lat: 28.6762, lon: 77.2872, type: 'suburb' },
    { name: 'Model Town', lat: 28.7196, lon: 77.1935, type: 'suburb' },
    { name: 'Uttam Nagar', lat: 28.6220, lon: 77.0590, type: 'suburb' },
    { name: 'Dilshad Garden', lat: 28.6862, lon: 77.3239, type: 'suburb' },
    { name: 'Kalkaji', lat: 28.5478, lon: 77.2588, type: 'suburb' },
    { name: 'Vasundhara Enclave', lat: 28.6617, lon: 77.3083, type: 'suburb' },
    { name: 'Patel Nagar', lat: 28.6544, lon: 77.1705, type: 'suburb' },
    { name: 'Ashok Vihar', lat: 28.6951, lon: 77.1762, type: 'suburb' },
    { name: 'Tilak Nagar', lat: 28.6407, lon: 77.0958, type: 'suburb' }
  ],
  'New Delhi': [
    { name: 'Lodhi Road', lat: 28.5935, lon: 77.2260, type: 'locality' },
    { name: 'Chanakyapuri', lat: 28.5966, lon: 77.1860, type: 'suburb' },
    { name: 'Diplomatic Enclave', lat: 28.5880, lon: 77.1920, type: 'locality' },
    { name: 'RK Puram', lat: 28.5640, lon: 77.1820, type: 'suburb' },
    { name: 'Safdarjung', lat: 28.5683, lon: 77.2040, type: 'suburb' },
    { name: 'Defence Colony', lat: 28.5745, lon: 77.2339, type: 'suburb' },
    { name: 'Golf Links', lat: 28.6190, lon: 77.2345, type: 'suburb' },
    { name: 'Jor Bagh', lat: 28.5791, lon: 77.2165, type: 'locality' }
  ],
  'Noida': [
    { name: 'Sector 18', lat: 28.5706, lon: 77.3207, type: 'locality' },
    { name: 'Sector 62', lat: 28.6273, lon: 77.3677, type: 'locality' },
    { name: 'Sector 16', lat: 28.5832, lon: 77.3173, type: 'locality' },
    { name: 'Sector 50', lat: 28.5700, lon: 77.3652, type: 'locality' },
    { name: 'Sector 76', lat: 28.5714, lon: 77.3815, type: 'locality' },
    { name: 'Sector 137', lat: 28.4940, lon: 77.4070, type: 'locality' },
    { name: 'Film City', lat: 28.5771, lon: 77.3301, type: 'locality' }
  ],
  'Greater Noida': [
    { name: 'Alpha 1', lat: 28.4750, lon: 77.5040, type: 'locality' },
    { name: 'Alpha 2', lat: 28.4710, lon: 77.5100, type: 'locality' },
    { name: 'Beta 1', lat: 28.4650, lon: 77.5000, type: 'locality' },
    { name: 'Gamma 1', lat: 28.4700, lon: 77.5300, type: 'locality' },
    { name: 'Pari Chowk', lat: 28.4710, lon: 77.4990, type: 'locality' },
    { name: 'Knowledge Park', lat: 28.4750, lon: 77.4850, type: 'locality' }
  ],
  'Gurgaon': [
    { name: 'Cyber City', lat: 28.4950, lon: 77.0870, type: 'locality' },
    { name: 'DLF Phase 1', lat: 28.4750, lon: 77.1010, type: 'locality' },
    { name: 'DLF Phase 2', lat: 28.4820, lon: 77.0870, type: 'locality' },
    { name: 'DLF Phase 3', lat: 28.4960, lon: 77.0980, type: 'locality' },
    { name: 'DLF Phase 4', lat: 28.4650, lon: 77.0870, type: 'locality' },
    { name: 'DLF Phase 5', lat: 28.4745, lon: 77.1050, type: 'locality' },
    { name: 'Sohna Road', lat: 28.4140, lon: 77.0520, type: 'locality' },
    { name: 'Golf Course Road', lat: 28.4590, lon: 77.0910, type: 'locality' },
    { name: 'MG Road', lat: 28.4700, lon: 77.0750, type: 'locality' },
    { name: 'Sector 29', lat: 28.4690, lon: 77.0650, type: 'locality' },
    { name: 'Sector 54', lat: 28.4370, lon: 77.0930, type: 'locality' },
    { name: 'Sector 56', lat: 28.4250, lon: 77.0980, type: 'locality' }
  ],
  'Faridabad': [
    { name: 'Sector 15', lat: 28.4167, lon: 77.3050, type: 'locality' },
    { name: 'Sector 16', lat: 28.4080, lon: 77.3100, type: 'locality' },
    { name: 'NIT', lat: 28.3810, lon: 77.3030, type: 'locality' },
    { name: 'Old Faridabad', lat: 28.4189, lon: 77.3158, type: 'locality' },
    { name: 'Sector 21', lat: 28.4250, lon: 77.3080, type: 'locality' }
  ],
  'Ghaziabad': [
    { name: 'Indirapuram', lat: 28.6415, lon: 77.3739, type: 'locality' },
    { name: 'Vasundhara', lat: 28.6603, lon: 77.3738, type: 'locality' },
    { name: 'Raj Nagar', lat: 28.6700, lon: 77.4350, type: 'locality' },
    { name: 'Vaishali', lat: 28.6492, lon: 77.3310, type: 'locality' },
    { name: 'Kaushambi', lat: 28.6469, lon: 77.3260, type: 'locality' }
  ]
};

let stats = {
  totalCities: 0,
  totalAreas: 0,
  insertedAreas: 0,
  skippedAreas: 0,
  startTime: Date.now()
};

async function insertAreasForCity(cityName, areas, cityDoc) {
  console.log(`\n   📍 Processing ${cityName}...`);
  
  const areaDocuments = areas.map(area => ({
    osm_id: `manual/${cityName}/${area.name}`.toLowerCase().replace(/\s+/g, '-'),
    name: area.name,
    normalizedName: area.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
    city_id: cityDoc._id,
    cityName: cityDoc.name,
    cityOsmId: cityDoc.osm_id,
    placeType: area.type,
    location: {
      type: 'Point',
      coordinates: [area.lon, area.lat]
    },
    lat: area.lat,
    lon: area.lon,
    osmTags: { source: 'manual', verified: true },
    hasVendors: false,
    vendorCount: 0
  }));

  try {
    const insertResult = await Area.insertMany(areaDocuments, { 
      ordered: false,
      rawResult: true 
    }).catch(err => {
      if (err.code === 11000) {
        const inserted = areaDocuments.length - (err.writeErrors?.length || 0);
        stats.skippedAreas += err.writeErrors?.length || 0;
        return { insertedCount: inserted };
      }
      throw err;
    });

    const inserted = insertResult.insertedCount || 0;
    stats.insertedAreas += inserted;
    stats.totalAreas += areaDocuments.length;

    // Update city
    await City.findByIdAndUpdate(cityDoc._id, {
      areaCount: areaDocuments.length,
      areasFetched: true
    });

    console.log(`   ✅ ${cityName}: Added ${inserted} areas ${stats.skippedAreas > 0 ? `(${stats.skippedAreas} already existed)` : ''}`);
    
  } catch (error) {
    console.log(`   ❌ ${cityName}: Error - ${error.message}`);
  }
}

async function populateDelhiAreasManually() {
  try {
    console.log('\n🏛️  DELHI NCR MANUAL AREA POPULATION');
    console.log('━'.repeat(70));
    console.log('📍 Adding popular Delhi NCR areas to database');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');

    const cityNames = Object.keys(DELHI_AREAS);
    stats.totalCities = cityNames.length;

    console.log(`📋 Processing ${stats.totalCities} cities with popular areas:`);
    for (const cityName of cityNames) {
      const areaCount = DELHI_AREAS[cityName].length;
      console.log(`   - ${cityName}: ${areaCount} areas`);
    }
    console.log('━'.repeat(70));

    // Process each city
    for (const cityName of cityNames) {
      const areas = DELHI_AREAS[cityName];
      
      // Find city in database
      const cityDoc = await City.findOne({ 
        name: new RegExp(`^${cityName}$`, 'i')
      });

      if (!cityDoc) {
        console.log(`   ⚠️  ${cityName}: Not found in database, skipping`);
        continue;
      }

      await insertAreasForCity(cityName, areas, cityDoc);
    }

    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(1);
    
    console.log('\n' + '━'.repeat(70));
    console.log('✅ MANUAL AREA POPULATION COMPLETE!');
    console.log('━'.repeat(70));
    console.log(`📍 Cities Processed: ${stats.totalCities}`);
    console.log(`📁 Total Areas Added: ${stats.insertedAreas}`);
    console.log(`⏭️  Skipped (already existed): ${stats.skippedAreas}`);
    console.log(`⏱️  Time: ${duration} seconds`);
    console.log('━'.repeat(70));
    
    const totalAreasInDB = await Area.countDocuments();
    console.log(`\n✅ Total areas now in database: ${totalAreasInDB}`);
    
    // Show breakdown
    console.log('\n📊 Delhi NCR Areas Summary:');
    for (const cityName of cityNames) {
      const cityDoc = await City.findOne({ name: new RegExp(`^${cityName}$`, 'i') });
      if (cityDoc) {
        const count = await Area.countDocuments({ city_id: cityDoc._id });
        console.log(`   ${cityName}: ${count} areas`);
      }
    }
    
    console.log('━'.repeat(70) + '\n');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

populateDelhiAreasManually();
