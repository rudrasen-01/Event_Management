const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const City = require('../models/City');
const Area = require('../models/Area');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// GEONAMES API - FREE ALTERNATIVE TO GOOGLE MAPS
// ============================================================================
// Setup: Register at https://www.geonames.org/login (FREE)
// Add GEONAMES_USERNAME to your .env file
// Free tier: 20,000 credits per day (1 request = 1 credit)
// ============================================================================

const GEONAMES_USERNAME = process.env.GEONAMES_USERNAME || 'demo'; // Register for your own

// Delhi NCR cities to process
const TARGET_CITIES = [
  'Delhi', 'New Delhi', 'Noida', 'Greater Noida', 
  'Gurgaon', 'Faridabad', 'Ghaziabad', 'Dwarka'
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
 * Fetch neighborhoods/localities using GeoNames API
 * Uses findNearby API to get ADM3, ADM4 level places (neighborhoods)
 */
async function fetchAreasFromGeoNames(cityName, cityLat, cityLon) {
  try {
    console.log(`   🔍 Searching GeoNames for ${cityName} localities...`);
    
    // Search for nearby places (neighborhoods, localities, suburbs)
    const response = await axios.get('http://api.geonames.org/findNearbyJSON', {
      params: {
        lat: cityLat,
        lng: cityLon,
        radius: 25, // 25km radius
        maxRows: 100,
        featureClass: 'P', // Populated places
        style: 'FULL',
        username: GEONAMES_USERNAME
      },
      timeout: 10000
    });

    if (response.data.status) {
      console.log(`   ⚠️  GeoNames API Error: ${response.data.status.message}`);
      return [];
    }

    const geonames = response.data.geonames || [];
    
    // Filter for neighborhoods and localities (not entire cities)
    const areas = geonames
      .filter(place => {
        const fcode = place.fcode;
        return fcode === 'PPLX' || // section of populated place
               fcode === 'PPL' ||  // populated place
               fcode === 'PPLA3' || // seat of a third-order administrative division
               fcode === 'PPLA4';   // seat of a fourth-order administrative division
      })
      .map(place => ({
        name: place.name,
        lat: place.lat,
        lon: place.lng,
        geonameId: place.geonameId,
        fcode: place.fcode,
        population: place.population
      }))
      .filter(area => area.lat && area.lon);

    console.log(`   ✅ Found ${areas.length} localities from GeoNames`);
    return areas;

  } catch (error) {
    console.log(`   ❌ GeoNames API Error: ${error.message}`);
    return [];
  }
}

/**
 * Search for specific neighborhoods within city
 */
async function searchGeoNamesAreas(cityName, cityLat, cityLon) {
  try {
    console.log(`   🔍 Searching GeoNames for "${cityName}" areas...`);
    
    const response = await axios.get('http://api.geonames.org/searchJSON', {
      params: {
        q: cityName,
        featureClass: 'P',
        maxRows: 50,
        country: 'IN',
        style: 'FULL',
        username: GEONAMES_USERNAME
      },
      timeout: 10000
    });

    if (response.data.status) {
      console.log(`   ⚠️  GeoNames Search Error: ${response.data.status.message}`);
      return [];
    }

    const geonames = response.data.geonames || [];
    const areas = geonames
      .filter(place => {
        // Calculate distance from city center
        const distance = Math.sqrt(
          Math.pow(place.lat - cityLat, 2) + 
          Math.pow(place.lng - cityLon, 2)
        );
        return distance < 0.5; // Within ~50km
      })
      .map(place => ({
        name: place.name,
        lat: place.lat,
        lon: place.lng,
        geonameId: place.geonameId,
        fcode: place.fcode,
        population: place.population
      }));

    console.log(`   ✅ Found ${areas.length} additional areas`);
    return areas;

  } catch (error) {
    console.log(`   ⚠️  Search error: ${error.message}`);
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

    // Fetch from GeoNames (two methods)
    const nearbyAreas = await fetchAreasFromGeoNames(cityName, cityDoc.lat, cityDoc.lon);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit delay
    
    const searchAreas = await searchGeoNamesAreas(cityName, cityDoc.lat, cityDoc.lon);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Combine and deduplicate
    const allAreas = [...nearbyAreas, ...searchAreas];
    const uniqueAreas = Array.from(
      new Map(allAreas.map(area => [area.geonameId, area])).values()
    );

    // Exclude the city itself
    const filteredAreas = uniqueAreas.filter(area => 
      !area.name.toLowerCase().includes(cityName.toLowerCase()) &&
      area.name !== cityName
    );

    if (filteredAreas.length === 0) {
      console.log(`   ⚠️  No areas found for ${cityName}`);
      stats.processedCities++;
      return;
    }

    // Insert into database
    const areaDocuments = filteredAreas.map(area => ({
      osm_id: `geonames/${cityName}/${area.geonameId}`,
      name: area.name,
      normalizedName: area.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
      city_id: cityDoc._id,
      cityName: cityDoc.name,
      cityOsmId: cityDoc.osm_id,
      placeType: area.fcode === 'PPLX' ? 'neighborhood' : 'locality',
      location: {
        type: 'Point',
        coordinates: [parseFloat(area.lon), parseFloat(area.lat)]
      },
      lat: parseFloat(area.lat),
      lon: parseFloat(area.lon),
      osmTags: { 
        source: 'geonames', 
        geoname_id: area.geonameId,
        fcode: area.fcode,
        population: area.population
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
    stats.totalAreas += filteredAreas.length;
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

async function populateDelhiAreasFromGeoNames() {
  try {
    console.log('\n🌍 GEONAMES AREA POPULATION (FREE)');
    console.log('━'.repeat(70));
    console.log('📍 Fetching locality data from GeoNames API');
    console.log('━'.repeat(70));

    if (GEONAMES_USERNAME === 'demo') {
      console.log('\n⚠️  WARNING: Using demo account (limited to 20k requests/day)');
      console.log('📋 For better performance, register at: https://www.geonames.org/login');
      console.log('   Then add: GEONAMES_USERNAME=your_username to .env file\n');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`🔑 Using GeoNames Username: ${GEONAMES_USERNAME}\n`);

    stats.totalCities = TARGET_CITIES.length;
    
    console.log(`📋 Processing ${stats.totalCities} Delhi NCR cities:`);
    TARGET_CITIES.forEach(city => console.log(`   - ${city}`));
    console.log('━'.repeat(70));

    // Process each city sequentially
    for (const cityName of TARGET_CITIES) {
      await processCity(cityName);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limit
    }

    const duration = ((Date.now() - stats.startTime) / 60000).toFixed(2);
    
    console.log('\n' + '━'.repeat(70));
    console.log('✅ GEONAMES AREA POPULATION COMPLETE!');
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

populateDelhiAreasFromGeoNames();
