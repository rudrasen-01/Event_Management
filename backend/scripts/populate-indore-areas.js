const mongoose = require('mongoose');
const path = require('path');
const City = require('../models/City');
const Area = require('../models/Area');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// INDORE AREA POPULATION - COMPREHENSIVE OSM DATA
// ============================================================================

const RETRY_ATTEMPTS = 3;
const REQUEST_TIMEOUT = 15000;

let stats = {
  totalAreas: 0,
  insertedAreas: 0,
  duplicateAreas: 0,
  startTime: Date.now()
};

/**
 * Fetch areas from OpenStreetMap for Indore
 * Queries for suburbs, neighbourhoods, and localities within Indore
 */
async function fetchIndoreAreasFromOSM(cityOsmId, retries = RETRY_ATTEMPTS) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  // Comprehensive query to get all area types in Indore
  const query = `
    [out:json][timeout:15];
    area(${cityOsmId})->.city;
    (
      node["place"~"suburb|neighbourhood|locality|quarter"](area.city);
      way["place"~"suburb|neighbourhood|locality|quarter"](area.city);
      relation["place"~"suburb|neighbourhood|locality|quarter"](area.city);
    );
    out center 500;
  `;

  try {
    console.log('   🌐 Querying OpenStreetMap for Indore areas...');
    
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
        console.log(`   ⏳ Rate limited, retrying in 3 seconds... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return fetchIndoreAreasFromOSM(cityOsmId, retries - 1);
      }
      throw new Error(`OSM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`   ✅ Received ${data.elements?.length || 0} area elements from OSM`);
    return data.elements || [];
    
  } catch (error) {
    if (retries > 0 && error.name !== 'AbortError') {
      console.log(`   ⚠️  Error: ${error.message}, retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchIndoreAreasFromOSM(cityOsmId, retries - 1);
    }
    throw error;
  }
}

/**
 * Transform OSM elements to Area documents
 */
function transformToAreaDocuments(elements, indoreCity) {
  const areaDocuments = [];
  const seenNames = new Set();

  for (const element of elements) {
    // Get coordinates
    let lat, lon;
    if (element.type === 'node') {
      lat = element.lat;
      lon = element.lon;
    } else if (element.center) {
      lat = element.center.lat;
      lon = element.center.lon;
    }

    // Validate data
    if (!lat || !lon || !element.tags?.name) {
      continue;
    }

    const areaName = element.tags.name;
    
    // Skip duplicates based on name (case-insensitive)
    const normalizedName = areaName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    if (seenNames.has(normalizedName)) {
      continue;
    }
    seenNames.add(normalizedName);

    // Create area document
    areaDocuments.push({
      osm_id: `${element.type}/${element.id}`,
      name: areaName,
      normalizedName: normalizedName,
      city_id: indoreCity._id,
      cityName: indoreCity.name,
      cityOsmId: indoreCity.osm_id,
      placeType: element.tags.place || 'suburb',
      location: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      lat,
      lon,
      osmTags: {
        ...element.tags,
        osm_type: element.type,
        osm_id: element.id,
        fetchedAt: new Date()
      },
      hasVendors: false,
      vendorCount: 0
    });
  }

  return areaDocuments;
}

/**
 * Insert areas into database
 */
async function insertAreas(areaDocuments, indoreCity) {
  if (areaDocuments.length === 0) {
    console.log('   ⚠️  No valid area data to insert');
    return 0;
  }

  try {
    console.log(`   💾 Inserting ${areaDocuments.length} unique areas into database...`);
    
    const insertResult = await Area.insertMany(areaDocuments, { 
      ordered: false,
      rawResult: true 
    }).catch(err => {
      // Handle duplicate key errors (areas that already exist)
      if (err.code === 11000) {
        const duplicates = err.writeErrors?.length || 0;
        const inserted = areaDocuments.length - duplicates;
        stats.duplicateAreas = duplicates;
        console.log(`   ℹ️  ${duplicates} areas already existed in database`);
        return { insertedCount: inserted };
      }
      throw err;
    });

    const insertedCount = insertResult.insertedCount || 0;
    stats.insertedAreas = insertedCount;
    stats.totalAreas = areaDocuments.length;

    // Update city with area count
    await City.findByIdAndUpdate(indoreCity._id, {
      areaCount: insertedCount,
      areasFetched: true,
      lastAreaUpdate: new Date()
    });

    console.log(`   ✅ Successfully inserted ${insertedCount} areas`);
    return insertedCount;
    
  } catch (error) {
    console.error(`   ❌ Database error: ${error.message}`);
    throw error;
  }
}

/**
 * Main function to populate Indore areas
 */
async function populateIndoreAreas() {
  try {
    console.log('\n🏛️  INDORE AREA POPULATION SCRIPT');
    console.log('━'.repeat(70));
    console.log('📍 Fetching comprehensive area data from OpenStreetMap');
    console.log('━'.repeat(70));

    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Find Indore city
    console.log('🔍 Searching for Indore in database...');
    const indoreCity = await City.findOne({ 
      name: /^Indore$/i
    }).lean();

    if (!indoreCity) {
      throw new Error('Indore city not found in database. Please run: node scripts/add-indore-city.js first');
    }

    console.log(`✅ Found Indore: ${indoreCity.name}${indoreCity.state ? ', ' + indoreCity.state : ''}`);
    console.log(`   OSM ID: ${indoreCity.osm_id}`);
    console.log(`   Location: ${indoreCity.lat}, ${indoreCity.lon}`);
    console.log('━'.repeat(70));

    // Check if areas already exist
    const existingAreaCount = await Area.countDocuments({ city_id: indoreCity._id });
    if (existingAreaCount > 0) {
      console.log(`\n⚠️  Warning: ${existingAreaCount} areas already exist for Indore`);
      console.log('   This script will skip duplicates and add new areas only.');
      console.log('━'.repeat(70));
    }

    // Fetch areas from OpenStreetMap
    console.log('\n📡 Fetching area data from OpenStreetMap...');
    const osmElements = await fetchIndoreAreasFromOSM(indoreCity.osm_id);

    if (!osmElements || osmElements.length === 0) {
      console.log('\n⚠️  No area data found in OpenStreetMap for Indore');
      console.log('   This could mean:');
      console.log('   - OSM has limited data for this city');
      console.log('   - The OSM ID might be incorrect');
      console.log('   - Temporary OSM API issue');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('━'.repeat(70));

    // Transform to Area documents
    console.log('\n🔄 Processing and validating area data...');
    const areaDocuments = transformToAreaDocuments(osmElements, indoreCity);
    console.log(`   ✅ Prepared ${areaDocuments.length} valid, unique areas`);
    console.log('━'.repeat(70));

    // Display sample areas
    if (areaDocuments.length > 0) {
      console.log('\n📋 Sample areas to be added:');
      const sampleSize = Math.min(10, areaDocuments.length);
      for (let i = 0; i < sampleSize; i++) {
        const area = areaDocuments[i];
        console.log(`   ${i + 1}. ${area.name} (${area.placeType})`);
      }
      if (areaDocuments.length > 10) {
        console.log(`   ... and ${areaDocuments.length - 10} more areas`);
      }
      console.log('━'.repeat(70));
    }

    // Insert into database
    console.log('\n💾 Inserting areas into database...');
    await insertAreas(areaDocuments, indoreCity);

    // Final statistics
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
    const totalAreasInDB = await Area.countDocuments({ city_id: indoreCity._id });
    
    console.log('\n' + '━'.repeat(70));
    console.log('🎉 INDORE AREA POPULATION COMPLETE!');
    console.log('━'.repeat(70));
    console.log(`📊 Statistics:`);
    console.log(`   • Areas found in OSM: ${osmElements.length}`);
    console.log(`   • Valid unique areas: ${stats.totalAreas}`);
    console.log(`   • New areas inserted: ${stats.insertedAreas}`);
    console.log(`   • Duplicates skipped: ${stats.duplicateAreas}`);
    console.log(`   • Total areas in DB for Indore: ${totalAreasInDB}`);
    console.log(`   • Processing time: ${duration} seconds`);
    console.log('━'.repeat(70));

    // Show area distribution by type
    const areasByType = await Area.aggregate([
      { $match: { city_id: indoreCity._id } },
      { $group: { _id: '$placeType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    if (areasByType.length > 0) {
      console.log('\n📈 Area distribution by type:');
      areasByType.forEach(item => {
        console.log(`   • ${item._id}: ${item.count} areas`);
      });
      console.log('━'.repeat(70));
    }

    console.log('\n✅ All done! You can now use these areas in your application.\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n' + '━'.repeat(70));
    console.error('❌ ERROR OCCURRED');
    console.error('━'.repeat(70));
    console.error(`Message: ${error.message}`);
    console.error(`\nStack trace:`);
    console.error(error.stack);
    console.error('━'.repeat(70) + '\n');
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Script interrupted by user');
  console.log(`📊 Progress before interruption:`);
  console.log(`   • Areas inserted: ${stats.insertedAreas}`);
  console.log(`   • Time elapsed: ${((Date.now() - stats.startTime) / 1000).toFixed(2)}s`);
  
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
  
  process.exit(0);
});

// Run the script
populateIndoreAreas();
