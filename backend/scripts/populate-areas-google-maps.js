const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const City = require('../models/City');
const Area = require('../models/Area');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// GOOGLE MAPS PLACES API - FETCH REAL AREAS FOR CITIES
// ============================================================================
// Setup: Get API key from https://console.cloud.google.com/
// 1. Enable "Places API (New)" 
// 2. Enable billing (Free $200/month credit - enough for ~10,000 areas)
// 3. Add GOOGLE_MAPS_API_KEY to your .env file
// ============================================================================

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Delhi NCR cities to process
const TARGET_CITIES = [
  'Delhi', 'New Delhi', 'Noida', 'Greater Noida', 
  'Gurgaon', 'Faridabad', 'Ghaziabad'
];

let stats = {
  totalCities: 0,
  processedCities: 0,
  totalAreas: 0,
  insertedAreas: 0,
  failedCities: 0,
  startTime: Date.now()
};

/**
 * Fetch localities/neighborhoods within a city using Google Places API
 * Uses Places API (New) - Text Search
 */
async function fetchAreasFromGoogle(cityName, cityLat, cityLon) {
  try {
    console.log(`   🔍 Searching Google Maps for ${cityName} localities...`);
    
    // Search for localities/neighborhoods in this city
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: `localities in ${cityName}, India`,
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: {
              latitude: cityLat,
              longitude: cityLon
            },
            radius: 25000.0 // 25km radius
          }
        },
        languageCode: 'en'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.id,places.location,places.types,places.formattedAddress'
        },
        timeout: 15000
      }
    );

    const places = response.data.places || [];
    
    // Filter for locality/sublocality types
    const areas = places
      .filter(place => {
        const types = place.types || [];
        return types.includes('locality') || 
               types.includes('sublocality') || 
               types.includes('sublocality_level_1') ||
               types.includes('sublocality_level_2') ||
               types.includes('neighborhood');
      })
      .map(place => ({
        name: place.displayName?.text || 'Unknown',
        lat: place.location?.latitude,
        lon: place.location?.longitude,
        googlePlaceId: place.id,
        types: place.types,
        address: place.formattedAddress
      }))
      .filter(area => area.lat && area.lon);

    console.log(`   ✅ Found ${areas.length} localities from Google Maps`);
    return areas;

  } catch (error) {
    if (error.response?.status === 429) {
      console.log(`   ⚠️  Rate limit hit, waiting 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchAreasFromGoogle(cityName, cityLat, cityLon); // Retry
    }
    
    console.log(`   ❌ Google API Error: ${error.response?.data?.error?.message || error.message}`);
    return [];
  }
}

/**
 * Fetch additional areas using Nearby Search for specific types
 */
async function fetchNearbyAreas(cityName, cityLat, cityLon) {
  try {
    console.log(`   🔍 Searching nearby areas in ${cityName}...`);
    
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        includedTypes: ['locality', 'sublocality', 'neighborhood'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: cityLat,
              longitude: cityLon
            },
            radius: 20000.0 // 20km
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.id,places.location,places.types'
        },
        timeout: 15000
      }
    );

    const places = response.data.places || [];
    const areas = places
      .map(place => ({
        name: place.displayName?.text || 'Unknown',
        lat: place.location?.latitude,
        lon: place.location?.longitude,
        googlePlaceId: place.id,
        types: place.types
      }))
      .filter(area => area.lat && area.lon);

    console.log(`   ✅ Found ${areas.length} additional areas`);
    return areas;

  } catch (error) {
    console.log(`   ⚠️  Nearby search error: ${error.message}`);
    return [];
  }
}

async function processCity(cityName) {
  try {
    // Find city in database
    const cityDoc = await City.findOne({ 
      name: new RegExp(`^${cityName}$`, 'i')
    });

    if (!cityDoc) {
      console.log(`   ⚠️  ${cityName}: Not found in database`);
      stats.failedCities++;
      return;
    }

    console.log(`\n📍 Processing: ${cityName} (${cityDoc.lat}, ${cityDoc.lon})`);

    // Fetch from Google Maps
    const textSearchAreas = await fetchAreasFromGoogle(cityName, cityDoc.lat, cityDoc.lon);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between requests
    
    const nearbyAreas = await fetchNearbyAreas(cityName, cityDoc.lat, cityDoc.lon);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Combine and deduplicate
    const allAreas = [...textSearchAreas, ...nearbyAreas];
    const uniqueAreas = Array.from(
      new Map(allAreas.map(area => [area.name.toLowerCase(), area])).values()
    );

    if (uniqueAreas.length === 0) {
      console.log(`   ⚠️  No areas found for ${cityName}`);
      stats.processedCities++;
      return;
    }

    // Insert into database
    const areaDocuments = uniqueAreas.map(area => ({
      osm_id: `google/${cityName}/${area.name}`.toLowerCase().replace(/\s+/g, '-'),
      name: area.name,
      normalizedName: area.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
      city_id: cityDoc._id,
      cityName: cityDoc.name,
      cityOsmId: cityDoc.osm_id,
      placeType: area.types?.includes('neighborhood') ? 'neighborhood' : 'locality',
      location: {
        type: 'Point',
        coordinates: [area.lon, area.lat]
      },
      lat: area.lat,
      lon: area.lon,
      osmTags: { 
        source: 'google_maps', 
        google_place_id: area.googlePlaceId,
        types: area.types,
        address: area.address
      },
      hasVendors: false,
      vendorCount: 0
    }));

    const insertResult = await Area.insertMany(areaDocuments, { 
      ordered: false 
    }).catch(err => {
      if (err.code === 11000) {
        const inserted = areaDocuments.length - (err.writeErrors?.length || 0);
        return { insertedCount: inserted };
      }
      throw err;
    });

    const inserted = insertResult.insertedCount || insertResult.length || 0;
    stats.insertedAreas += inserted;
    stats.totalAreas += uniqueAreas.length;
    stats.processedCities++;

    // Update city
    await City.findByIdAndUpdate(cityDoc._id, {
      areaCount: inserted,
      areasFetched: true
    });

    console.log(`   ✅ ${cityName}: Added ${inserted} areas to database`);

  } catch (error) {
    console.log(`   ❌ ${cityName}: Error - ${error.message}`);
    stats.failedCities++;
  }
}

async function populateDelhiAreasFromGoogle() {
  try {
    console.log('\n🗺️  GOOGLE MAPS AREA POPULATION');
    console.log('━'.repeat(70));
    console.log('📍 Fetching real locality data from Google Maps Places API');
    console.log('━'.repeat(70));

    // Check API key
    if (!GOOGLE_API_KEY) {
      console.log('\n❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env file!');
      console.log('\n📋 Setup Instructions:');
      console.log('   1. Go to: https://console.cloud.google.com/');
      console.log('   2. Create a new project or select existing');
      console.log('   3. Enable "Places API (New)"');
      console.log('   4. Go to Credentials → Create API Key');
      console.log('   5. Add to .env: GOOGLE_MAPS_API_KEY=your_key_here');
      console.log('   6. Enable billing (Free $200/month credit included)');
      console.log('━'.repeat(70) + '\n');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB');
    console.log(`🔑 Using Google Maps API Key: ${GOOGLE_API_KEY.substring(0, 8)}...`);

    stats.totalCities = TARGET_CITIES.length;
    
    console.log(`\n📋 Processing ${stats.totalCities} Delhi NCR cities:`);
    TARGET_CITIES.forEach(city => console.log(`   - ${city}`));
    console.log('━'.repeat(70));

    // Process each city sequentially to avoid rate limits
    for (const cityName of TARGET_CITIES) {
      await processCity(cityName);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    }

    const duration = ((Date.now() - stats.startTime) / 60000).toFixed(2);
    
    console.log('\n' + '━'.repeat(70));
    console.log('✅ GOOGLE MAPS AREA POPULATION COMPLETE!');
    console.log('━'.repeat(70));
    console.log(`📍 Cities Processed: ${stats.processedCities}/${stats.totalCities}`);
    console.log(`📁 Total Areas Found: ${stats.totalAreas}`);
    console.log(`✅ Areas Inserted: ${stats.insertedAreas}`);
    console.log(`❌ Failed Cities: ${stats.failedCities}`);
    console.log(`⏱️  Time: ${duration} minutes`);
    console.log('━'.repeat(70));
    
    const totalAreasInDB = await Area.countDocuments();
    console.log(`\n📊 Total areas in database: ${totalAreasInDB}`);
    
    // Show breakdown
    console.log('\n📍 Delhi NCR Areas Summary:');
    for (const cityName of TARGET_CITIES) {
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

populateDelhiAreasFromGoogle();
