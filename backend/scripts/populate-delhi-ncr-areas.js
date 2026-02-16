const mongoose = require('mongoose');
const path = require('path');
const City = require('../models/City');
const Area = require('../models/Area');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// DELHI NCR AREA POPULATION - COMPREHENSIVE
// ============================================================================

const DELHI_NCR_CITIES = [
  'Delhi', 'New Delhi', 'Noida', 'Greater Noida', 'Gurgaon', 'Faridabad', 
  'Ghaziabad', 'Dwarka', 'Rohini'
];

const BATCH_SIZE = 5;
const CONCURRENT_REQUESTS = 8;
const RETRY_ATTEMPTS = 3;
const REQUEST_TIMEOUT = 15000;

let stats = {
  totalCities: 0,
  processedCities: 0,
  totalAreas: 0,
  insertedAreas: 0,
  skippedCities: 0,
  failedCities: 0,
  startTime: Date.now()
};

// Fetch areas from OpenStreetMap
async function fetchAreasFromOSM(cityOsmId, cityName, retries = RETRY_ATTEMPTS) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  // More comprehensive query for Delhi (includes more place types)
  const query = `
    [out:json][timeout:15];
    area(${cityOsmId})->.city;
    (
      node["place"~"suburb|neighbourhood|locality|quarter"](area.city);
      way["place"~"suburb|neighbourhood|locality"](area.city);
    );
    out center 200;
  `;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        console.log(`   ⚠️  Rate limited, retrying ${cityName}...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return fetchAreasFromOSM(cityOsmId, cityName, retries - 1);
      }
      return [];
    }

    const data = await response.json();
    return data.elements || [];
    
  } catch (error) {
    if (retries > 0 && error.name !== 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchAreasFromOSM(cityOsmId, cityName, retries - 1);
    }
    return [];
  }
}

// Process single city
async function processCity(city) {
  try {
    console.log(`\n   🔄 Processing: ${city.name}...`);
    
    // Check if already has areas
    const existingAreas = await Area.countDocuments({ city_id: city._id });
    if (existingAreas > 0) {
      console.log(`   ✅ ${city.name}: Already has ${existingAreas} areas (skipped)`);
      stats.skippedCities++;
      return { cityName: city.name, areaCount: existingAreas, success: true, skipped: true };
    }

    // Fetch areas from OSM
    const areaElements = await fetchAreasFromOSM(city.osm_id, city.name);
    
    if (!areaElements || areaElements.length === 0) {
      console.log(`   ⚪ ${city.name}: No area data in OSM`);
      stats.skippedCities++;
      await City.findByIdAndUpdate(city._id, { areaCount: 0, areasFetched: true });
      return { cityName: city.name, areaCount: 0, success: true, noData: true };
    }

    console.log(`   📥 ${city.name}: Found ${areaElements.length} area elements, processing...`);

    // Transform to Area documents
    const areaDocuments = areaElements.map(element => {
      const lat = element.lat || element.center?.lat;
      const lon = element.lon || element.center?.lon;
      
      if (!lat || !lon || !element.tags?.name) return null;

      return {
        osm_id: `${element.type}/${element.id}`,
        name: element.tags.name,
        normalizedName: element.tags.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
        city_id: city._id,
        cityName: city.name,
        cityOsmId: city.osm_id,
        placeType: element.tags.place || 'locality',
        location: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        lat,
        lon,
        osmTags: element.tags,
        hasVendors: false,
        vendorCount: 0
      };
    }).filter(Boolean);

    if (areaDocuments.length === 0) {
      console.log(`   ⚪ ${city.name}: No valid area data`);
      stats.skippedCities++;
      await City.findByIdAndUpdate(city._id, { areaCount: 0, areasFetched: true });
      return { cityName: city.name, areaCount: 0, success: true, noData: true };
    }

    // Bulk insert
    const insertResult = await Area.insertMany(areaDocuments, { 
      ordered: false,
      rawResult: true 
    }).catch(err => {
      if (err.code === 11000) {
        const inserted = areaDocuments.length - (err.writeErrors?.length || 0);
        return { insertedCount: inserted };
      }
      throw err;
    });

    const insertedCount = insertResult.insertedCount || 0;
    stats.insertedAreas += insertedCount;
    stats.totalAreas += areaDocuments.length;

    // Update city
    await City.findByIdAndUpdate(city._id, {
      areaCount: areaDocuments.length,
      areasFetched: true
    });

    console.log(`   ✅ ${city.name}: Successfully added ${insertedCount} areas!`);
    return { cityName: city.name, areaCount: insertedCount, success: true };
    
  } catch (error) {
    console.log(`   ❌ ${city.name}: Failed - ${error.message}`);
    stats.failedCities++;
    return { cityName: city.name, areaCount: 0, success: false, error: error.message };
  }
}

// Main
async function populateDelhiNCRAreas() {
  try {
    console.log('\n🏛️  DELHI NCR AREA POPULATION');
    console.log('━'.repeat(70));
    console.log('📍 Processing Delhi and surrounding cities');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');

    // Get all Delhi NCR cities
    console.log('🔍 Finding Delhi NCR cities in database...');
    
    const cities = await City.find({
      name: { $in: DELHI_NCR_CITIES.map(n => new RegExp(`^${n}$`, 'i')) }
    }).select('_id osm_id name state lat lon placeType').lean();
    
    stats.totalCities = cities.length;
    
    console.log(`✅ Found ${stats.totalCities} cities`);
    console.log('\n📋 Cities to process:');
    cities.forEach(c => console.log(`   - ${c.name} (${c.placeType})`));
    console.log('━'.repeat(70));

    // Process cities sequentially to avoid overwhelming API
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      console.log(`\n📦 Processing city ${i + 1}/${cities.length}`);
      
      await processCity(city);
      stats.processedCities++;
      
      const progress = ((stats.processedCities / stats.totalCities) * 100).toFixed(1);
      console.log(`   📊 Overall Progress: ${progress}% | Total areas inserted: ${stats.insertedAreas}`);
      
      // Delay between cities
      if (i < cities.length - 1) {
        console.log('   ⏳ Waiting 2 seconds before next city...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const duration = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(2);
    
    console.log('\n' + '━'.repeat(70));
    console.log('✅ DELHI NCR AREA POPULATION COMPLETE!');
    console.log('━'.repeat(70));
    console.log(`📍 Cities Processed: ${stats.processedCities}/${stats.totalCities}`);
    console.log(`📁 New Areas Added: ${stats.insertedAreas}`);
    console.log(`⏭️  Skipped: ${stats.skippedCities} cities`);
    console.log(`❌ Failed: ${stats.failedCities} cities`);
    console.log(`⏱️  Time: ${duration} minutes`);
    console.log('━'.repeat(70));
    
    const totalAreasInDB = await Area.countDocuments();
    console.log(`\n✅ Total areas now in database: ${totalAreasInDB}`);
    
    // Show area breakdown by city
    console.log('\n📊 Areas by City:');
    for (const city of cities) {
      const count = await Area.countDocuments({ city_id: city._id });
      if (count > 0) {
        console.log(`   ${city.name}: ${count} areas`);
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

process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Interrupted');
  console.log(`📊 Progress: ${stats.processedCities}/${stats.totalCities}`);
  console.log(`📁 Areas: ${stats.insertedAreas}`);
  await mongoose.connection.close();
  process.exit(0);
});

populateDelhiNCRAreas();
