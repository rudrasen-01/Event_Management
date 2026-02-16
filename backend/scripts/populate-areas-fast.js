const mongoose = require('mongoose');
const path = require('path');
const City = require('../models/City');
const Area = require('../models/Area');
const dotenv = require('dotenv');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// FAST AREA POPULATION SCRIPT - BATCH & PARALLEL PROCESSING
// ============================================================================

const BATCH_SIZE = 50; // Process 50 cities at a time
const CONCURRENT_REQUESTS = 10; // Parallel API calls
const RETRY_ATTEMPTS = 3;
const REQUEST_TIMEOUT = 15000; // 15 seconds

let stats = {
  totalCities: 0,
  processedCities: 0,
  totalAreas: 0,
  insertedAreas: 0,
  skippedCities: 0,
  failedCities: 0,
  startTime: Date.now()
};

// Fetch areas from OpenStreetMap Overpass API
async function fetchAreasFromOSM(cityOsmId, cityName, retries = RETRY_ATTEMPTS) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  // Overpass query for suburbs/neighbourhoods within city
  const query = `
    [out:json][timeout:15];
    area(${cityOsmId})->.city;
    (
      node["place"~"suburb|neighbourhood|quarter|locality"](area.city);
      way["place"~"suburb|neighbourhood|quarter|locality"](area.city);
      relation["place"~"suburb|neighbourhood|quarter|locality"](area.city);
    );
    out center;
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
        // Rate limited - wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchAreasFromOSM(cityOsmId, cityName, retries - 1);
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.elements || [];
    
  } catch (error) {
    if (retries > 0 && error.name !== 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchAreasFromOSM(cityOsmId, cityName, retries - 1);
    }
    return [];
  }
}

// Process single city
async function processCity(city) {
  try {
    // Fetch areas from OSM
    const areaElements = await fetchAreasFromOSM(city.osm_id, city.name);
    
    if (!areaElements || areaElements.length === 0) {
      stats.skippedCities++;
      return { cityId: city._id, areaCount: 0, success: true };
    }

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
        placeType: element.tags.place || 'suburb',
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
      stats.skippedCities++;
      return { cityId: city._id, areaCount: 0, success: true };
    }

    // Bulk insert areas (ignore duplicates)
    const insertResult = await Area.insertMany(areaDocuments, { 
      ordered: false,
      rawResult: true 
    }).catch(err => {
      // Ignore duplicate key errors
      if (err.code === 11000) {
        return { insertedCount: areaDocuments.length - (err.writeErrors?.length || 0) };
      }
      throw err;
    });

    const insertedCount = insertResult.insertedCount || 0;
    stats.insertedAreas += insertedCount;
    stats.totalAreas += areaDocuments.length;

    // Update city metadata
    await City.findByIdAndUpdate(city._id, {
      areaCount: areaDocuments.length,
      areasFetched: true
    });

    return { cityId: city._id, areaCount: insertedCount, success: true };
    
  } catch (error) {
    stats.failedCities++;
    console.error(`  ❌ Failed: ${city.name} - ${error.message}`);
    return { cityId: city._id, areaCount: 0, success: false, error: error.message };
  }
}

// Process cities in parallel batches
async function processBatch(cities) {
  const promises = cities.map(city => processCity(city));
  return await Promise.all(promises);
}

// Main execution
async function populateAreas() {
  try {
    console.log('\n🚀 FAST AREA POPULATION SCRIPT');
    console.log('━'.repeat(70));
    console.log('⚡ Using parallel processing for maximum speed');
    console.log(`📊 Batch Size: ${BATCH_SIZE} cities`);
    console.log(`🔄 Concurrent Requests: ${CONCURRENT_REQUESTS}`);
    console.log('━'.repeat(70));

    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Get all cities
    const cities = await City.find({}).select('_id osm_id name state lat lon').lean();
    stats.totalCities = cities.length;
    
    console.log(`📍 Found ${stats.totalCities} cities to process`);
    console.log('━'.repeat(70));

    // Process in batches
    for (let i = 0; i < cities.length; i += BATCH_SIZE) {
      const batch = cities.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(cities.length / BATCH_SIZE);
      
      console.log(`\n📦 Batch ${batchNum}/${totalBatches} (Cities ${i + 1}-${i + batch.length})`);
      
      // Process batch with concurrency control
      const results = [];
      for (let j = 0; j < batch.length; j += CONCURRENT_REQUESTS) {
        const chunk = batch.slice(j, j + CONCURRENT_REQUESTS);
        const chunkResults = await processBatch(chunk);
        results.push(...chunkResults);
        stats.processedCities += chunk.length;
        
        // Show progress
        const progress = ((stats.processedCities / stats.totalCities) * 100).toFixed(1);
        const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(0);
        const rate = (stats.processedCities / elapsed).toFixed(1);
        
        process.stdout.write(`   ⏳ Progress: ${progress}% | ${stats.processedCities}/${stats.totalCities} cities | ${stats.insertedAreas} areas | ${rate} cities/sec\r`);
      }
      
      console.log(); // New line
      console.log(`   ✅ Batch complete: ${results.filter(r => r.success).length}/${batch.length} successful`);
      
      // Small delay between batches to avoid overwhelming API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Final statistics
    const duration = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(2);
    
    console.log('\n' + '━'.repeat(70));
    console.log('✅ POPULATION COMPLETE!');
    console.log('━'.repeat(70));
    console.log(`📊 Total Cities Processed: ${stats.processedCities}/${stats.totalCities}`);
    console.log(`📁 Total Areas Inserted: ${stats.insertedAreas}`);
    console.log(`⏭️  Skipped Cities (no areas): ${stats.skippedCities}`);
    console.log(`❌ Failed Cities: ${stats.failedCities}`);
    console.log(`⏱️  Total Time: ${duration} minutes`);
    console.log(`⚡ Average Speed: ${(stats.processedCities / duration).toFixed(1)} cities/min`);
    console.log('━'.repeat(70) + '\n');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Handle interruption
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Script interrupted by user');
  console.log(`📊 Progress: ${stats.processedCities}/${stats.totalCities} cities processed`);
  console.log(`📁 Areas inserted: ${stats.insertedAreas}`);
  await mongoose.connection.close();
  process.exit(0);
});

// Run
populateAreas();
