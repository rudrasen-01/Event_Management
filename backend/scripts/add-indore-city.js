const mongoose = require('mongoose');
const path = require('path');
const City = require('../models/City');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Script to add Indore city to the database
 * Run this before populate-indore-areas.js
 */

const INDORE_DATA = {
  osm_id: '3600153675',  // OpenStreetMap relation ID for Indore
  name: 'Indore',
  normalizedName: 'indore',
  state: 'Madhya Pradesh',
  placeType: 'city',
  location: {
    type: 'Point',
    coordinates: [75.8577, 22.7196]  // [longitude, latitude]
  },
  lat: 22.7196,
  lon: 75.8577,
  population: 3500000,  // Approximate metro population
  areaCount: 0,
  areasFetched: false,
  osmTags: {
    name: 'Indore',
    'name:en': 'Indore',
    'name:hi': 'इंदौर',
    place: 'city',
    population: '3500000',
    'is_in:state': 'Madhya Pradesh',
    'is_in:country': 'India',
    source: 'manual_addition'
  },
  hasVendors: false,
  vendorCount: 0
};

async function addIndoreCity() {
  try {
    console.log('\n🏙️  ADDING INDORE CITY TO DATABASE');
    console.log('━'.repeat(70));

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Check if Indore already exists
    const existingIndore = await City.findOne({ 
      name: /^Indore$/i 
    });

    if (existingIndore) {
      console.log('✅ Indore already exists in database!');
      console.log('━'.repeat(70));
      console.log('📍 City Details:');
      console.log(`   • Name: ${existingIndore.name}`);
      console.log(`   • State: ${existingIndore.state}`);
      console.log(`   • Location: ${existingIndore.lat}, ${existingIndore.lon}`);
      console.log(`   • OSM ID: ${existingIndore.osm_id}`);
      console.log(`   • Place Type: ${existingIndore.placeType}`);
      console.log(`   • Area Count: ${existingIndore.areaCount || 0}`);
      console.log('━'.repeat(70));
      console.log('\n✅ No action needed. You can now run populate-indore-areas.js\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Insert Indore
    console.log('📍 Inserting Indore city...');
    const indore = await City.create(INDORE_DATA);

    console.log('━'.repeat(70));
    console.log('🎉 SUCCESS! Indore city added to database');
    console.log('━'.repeat(70));
    console.log('📍 City Details:');
    console.log(`   • Name: ${indore.name}`);
    console.log(`   • State: ${indore.state}`);
    console.log(`   • Location: ${indore.lat}, ${indore.lon}`);
    console.log(`   • OSM ID: ${indore.osm_id}`);
    console.log(`   • Place Type: ${indore.placeType}`);
    console.log(`   • Population: ${indore.population?.toLocaleString() || 'N/A'}`);
    console.log('━'.repeat(70));

    // Check total cities in DB
    const totalCities = await City.countDocuments();
    console.log(`\n✅ Total cities in database: ${totalCities}`);
    console.log('━'.repeat(70));

    console.log('\n✅ Next Step: Run the area population script');
    console.log('   Command: node scripts/populate-indore-areas.js\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
    process.exit(0);

  } catch (error) {
    console.error('\n' + '━'.repeat(70));
    console.error('❌ ERROR OCCURRED');
    console.error('━'.repeat(70));
    console.error(`Message: ${error.message}`);
    
    if (error.code === 11000) {
      console.error('\n⚠️  Duplicate key error - Indore might already exist with same OSM ID');
    }
    
    console.error('\nStack trace:');
    console.error(error.stack);
    console.error('━'.repeat(70) + '\n');
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the script
addIndoreCity();
