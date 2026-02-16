const mongoose = require('mongoose');
const path = require('path');
const City = require('../models/City');
const Area = require('../models/Area');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// MP CITIES AREA POPULATION - COMPREHENSIVE LIST
// ============================================================================

// Major MP cities list (comprehensive)
const MP_CITIES = [
  'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna',
  'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena',
  'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh',
  'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur', 'Hoshangabad', 'Itarsi',
  'Sehore', 'Betul', 'Seoni', 'Katni', 'Raisen', 'Shahdol', 'Panna',
  'Sheopur', 'Rajgarh', 'Shajapur', 'Narsinghpur', 'Mandla', 'Tikamgarh',
  'Nagda', 'Sendhwa', 'Mhow', 'Maihar', 'Ashok Nagar', 'Badnawar', 'Khurai'
];

const BATCH_SIZE = 20;
const CONCURRENT_REQUESTS = 10;
const RETRY_ATTEMPTS = 2;
const REQUEST_TIMEOUT = 10000;

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
  
  const query = `
    [out:json][timeout:10];
    area(${cityOsmId})->.city;
    (
      node["place"~"suburb|neighbourhood|locality"](area.city);
    );
    out center 150;
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchAreasFromOSM(cityOsmId, cityName, retries - 1);
      }
      return [];
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
    // Check if already has areas
    const existingAreas = await Area.countDocuments({ city_id: city._id });
    if (existingAreas > 0) {
      stats.skippedCities++;
      return { cityName: city.name, areaCount: existingAreas, success: true, skipped: true };
    }

    // Fetch areas from OSM
    const areaElements = await fetchAreasFromOSM(city.osm_id, city.name);
    
    if (!areaElements || areaElements.length === 0) {
      stats.skippedCities++;
      await City.findByIdAndUpdate(city._id, { areaCount: 0, areasFetched: true });
      return { cityName: city.name, areaCount: 0, success: true, noData: true };
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
      return { cityName: city.name, areaCount: 0, success: true, noData: true };
    }

    // Bulk insert
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

    // Update city
    await City.findByIdAndUpdate(city._id, {
      areaCount: areaDocuments.length,
      areasFetched: true
    });

    return { cityName: city.name, areaCount: insertedCount, success: true };
    
  } catch (error) {
    stats.failedCities++;
    return { cityName: city.name, areaCount: 0, success: false, error: error.message };
  }
}

// Process batch
async function processBatch(cities) {
  const promises = cities.map(city => processCity(city));
  return await Promise.all(promises);
}

// Main
async function populateMPAreas() {
  try {
    console.log('\n🏛️  MP CITIES AREA POPULATION');
    console.log('━'.repeat(70));
    console.log('📍 Processing Madhya Pradesh cities');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');

    // Get all MP cities
    console.log('🔍 Finding MP cities in database...');
    
    const mpCities = await City.find({
      name: { $in: MP_CITIES.map(n => new RegExp(`^${n}$`, 'i')) }
    }).select('_id osm_id name state lat lon placeType').lean();
    
    stats.totalCities = mpCities.length;
    
    console.log(`✅ Found ${stats.totalCities} MP cities`);
    console.log('\n📋 Cities to process:');
    mpCities.forEach(c => console.log(`   - ${c.name}`));
    console.log('━'.repeat(70));

    // Process in batches
    for (let i = 0; i < mpCities.length; i += BATCH_SIZE) {
      const batch = mpCities.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(mpCities.length / BATCH_SIZE);
      
      console.log(`\n📦 Batch ${batchNum}/${totalBatches}`);
      
      const results = [];
      for (let j = 0; j < batch.length; j += CONCURRENT_REQUESTS) {
        const chunk = batch.slice(j, j + CONCURRENT_REQUESTS);
        const chunkResults = await processBatch(chunk);
        results.push(...chunkResults);
        stats.processedCities += chunk.length;
        
        // Show results
        chunkResults.forEach(r => {
          if (r.success && !r.skipped && !r.noData) {
            console.log(`   ✅ ${r.cityName}: ${r.areaCount} areas`);
          } else if (r.noData) {
            console.log(`   ⚪ ${r.cityName}: No area data in OSM`);
          } else if (r.skipped) {
            console.log(`   ⏭️  ${r.cityName}: Already has ${r.areaCount} areas`);
          } else {
            console.log(`   ❌ ${r.cityName}: Failed`);
          }
        });
        
        const progress = ((stats.processedCities / stats.totalCities) * 100).toFixed(1);
        console.log(`   📊 Progress: ${progress}% | ${stats.processedCities}/${stats.totalCities} | Total areas: ${stats.insertedAreas}`);
      }
      
      // Delay between batches
      if (i + BATCH_SIZE < mpCities.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const duration = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(2);
    
    console.log('\n' + '━'.repeat(70));
    console.log('✅ MP AREA POPULATION COMPLETE!');
    console.log('━'.repeat(70));
    console.log(`📍 Cities Processed: ${stats.processedCities}/${stats.totalCities}`);
    console.log(`📁 New Areas Added: ${stats.insertedAreas}`);
    console.log(`⏭️  Skipped: ${stats.skippedCities} cities`);
    console.log(`❌ Failed: ${stats.failedCities} cities`);
    console.log(`⏱️  Time: ${duration} minutes`);
    console.log('━'.repeat(70));
    
    const totalAreasInDB = await Area.countDocuments();
    console.log(`\n✅ Total areas now in database: ${totalAreasInDB}`);
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

populateMPAreas();
