const mongoose = require('mongoose');
const path = require('path');
const City = require('../models/City');
const Area = require('../models/Area');
const dotenv = require('dotenv');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// SMART FAST AREA POPULATION - TOP 500 CITIES ONLY
// ============================================================================

const TOP_CITIES_LIMIT = 500; // Process only top 500 most important cities
const BATCH_SIZE = 25; // Smaller batches for better progress visibility
const CONCURRENT_REQUESTS = 15; // More concurrent requests for speed
const RETRY_ATTEMPTS = 2;
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

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
  
  // Simplified query for faster response
  const query = `
    [out:json][timeout:10];
    area(${cityOsmId})->.city;
    (
      node["place"~"suburb|neighbourhood"](area.city);
    );
    out center 100;
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        return fetchAreasFromOSM(cityOsmId, cityName, retries - 1);
      }
      return [];
    }

    const data = await response.json();
    return data.elements || [];
    
  } catch (error) {
    if (retries > 0 && error.name !== 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, 800));
      return fetchAreasFromOSM(cityOsmId, cityName, retries - 1);
    }
    return [];
  }
}

// Process single city
async function processCity(city) {
  try {
    // Check if city already has areas in database
    const existingAreas = await Area.countDocuments({ city_id: city._id });
    if (existingAreas > 0) {
      stats.skippedCities++;
      return { cityId: city._id, cityName: city.name, areaCount: existingAreas, success: true, skipped: true };
    }

    // Fetch areas from OSM
    const areaElements = await fetchAreasFromOSM(city.osm_id, city.name);
    
    if (!areaElements || areaElements.length === 0) {
      stats.skippedCities++;
      await City.findByIdAndUpdate(city._id, { areaCount: 0, areasFetched: true });
      return { cityId: city._id, cityName: city.name, areaCount: 0, success: true, noData: true };
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
      await City.findByIdAndUpdate(city._id, { areaCount: 0, areasFetched: true });
      return { cityId: city._id, cityName: city.name, areaCount: 0, success: true, noData: true };
    }

    // Bulk insert areas
    const insertResult = await Area.insertMany(areaDocuments, { 
      ordered: false,
      rawResult: true 
    }).catch(err => {
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

    return { cityId: city._id, cityName: city.name, areaCount: insertedCount, success: true };
    
  } catch (error) {
    stats.failedCities++;
    return { cityId: city._id, cityName: city.name, areaCount: 0, success: false, error: error.message };
  }
}

// Process cities in parallel batches
async function processBatch(cities) {
  const promises = cities.map(city => processCity(city));
  return await Promise.all(promises);
}

// Main execution
async function populateTopCities() {
  try {
    console.log('\n🚀 SMART AREA POPULATION - TOP 500 CITIES');
    console.log('━'.repeat(70));
    console.log('⚡ Processing only the most important cities for speed');
    console.log(`📊 Target: ${TOP_CITIES_LIMIT} cities`);
    console.log(`🔄 Concurrent Requests: ${CONCURRENT_REQUESTS}`);
    console.log('━'.repeat(70));

    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Get top cities prioritized by place type and population
    console.log('📍 Selecting top cities...');
    
    const cities = await City.find({})
      .sort({ 
        placeType: 1,      // city before town before village
        population: -1,    // higher population first
        areaCount: -1      // cities with more areas first
      })
      .limit(TOP_CITIES_LIMIT)
      .select('_id osm_id name state lat lon placeType population')
      .lean();
    
    stats.totalCities = cities.length;
    
    console.log(`✅ Selected ${stats.totalCities} top cities`);
    console.log(`   Place types: ${[...new Set(cities.map(c => c.placeType))].join(', ')}`);
    console.log('━'.repeat(70));

    // Process in batches
    for (let i = 0; i < cities.length; i += BATCH_SIZE) {
      const batch = cities.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(cities.length / BATCH_SIZE);
      
      console.log(`\n📦 Batch ${batchNum}/${totalBatches}`);
      
      // Process batch with concurrency control
      const results = [];
      for (let j = 0; j < batch.length; j += CONCURRENT_REQUESTS) {
        const chunk = batch.slice(j, j + CONCURRENT_REQUESTS);
        const chunkResults = await processBatch(chunk);
        results.push(...chunkResults);
        stats.processedCities += chunk.length;
        
        // Show successful cities
        const successfulCities = chunkResults.filter(r => r.success && !r.skipped && !r.noData);
        if (successfulCities.length > 0) {
          successfulCities.forEach(r => {
            console.log(`   ✅ ${r.cityName}: ${r.areaCount} areas`);
          });
        }
        
        // Progress
        const progress = ((stats.processedCities / stats.totalCities) * 100).toFixed(1);
        const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(0);
        const remaining = ((elapsed / stats.processedCities) * (stats.totalCities - stats.processedCities) / 60).toFixed(1);
        
        console.log(`   📊 Progress: ${progress}% | ${stats.processedCities}/${stats.totalCities} | ${stats.insertedAreas} areas total | ~${remaining} min remaining`);
      }
      
      // Delay between batches
      if (i + BATCH_SIZE < cities.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Final statistics
    const duration = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(2);
    
    console.log('\n' + '━'.repeat(70));
    console.log('✅ POPULATION COMPLETE!');
    console.log('━'.repeat(70));
    console.log(`📍 Cities Processed: ${stats.processedCities}/${stats.totalCities}`);
    console.log(`📁 Areas Inserted: ${stats.insertedAreas}`);
    console.log(`⏭️  Skipped: ${stats.skippedCities} cities`);
    console.log(`❌ Failed: ${stats.failedCities} cities`);
    console.log(`⏱️  Total Time: ${duration} minutes`);
    console.log(`⚡ Average: ${(stats.processedCities / duration).toFixed(1)} cities/min`);
    console.log('━'.repeat(70));
    
    // Quick check
    const totalAreasInDB = await Area.countDocuments();
    console.log(`\n✅ Areas now in database: ${totalAreasInDB}`);
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
  console.log(`📊 Progress: ${stats.processedCities}/${stats.totalCities} cities`);
  console.log(`📁 Areas inserted: ${stats.insertedAreas}`);
  await mongoose.connection.close();
  process.exit(0);
});

// Run
populateTopCities();
