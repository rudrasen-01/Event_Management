const mongoose = require('mongoose');
const path = require('path');
const City = require('../models/City');
const Area = require('../models/Area');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// INDORE AREAS - COMPREHENSIVE MANUAL LIST
// ============================================================================

const INDORE_AREAS = [
  // Central Indore
  { name: 'Vijay Nagar', lat: 22.7532, lon: 75.8937, type: 'suburb' },
  { name: 'Palasia', lat: 22.7239, lon: 75.8706, type: 'locality' },
  { name: 'MG Road', lat: 22.7180, lon: 75.8670, type: 'locality' },
  { name: 'Rajwada', lat: 22.7196, lon: 75.8577, type: 'locality' },
  { name: 'Sarafa Bazaar', lat: 22.7196, lon: 75.8577, type: 'locality' },
  { name: 'Chappan Dukaan', lat: 22.7567, lon: 75.8882, type: 'locality' },
  
  // South Indore
  { name: 'South Tukoganj', lat: 22.7096, lon: 75.8778, type: 'suburb' },
  { name: 'Kanadiya Road', lat: 22.6890, lon: 75.8890, type: 'locality' },
  { name: 'Race Course Road', lat: 22.7154, lon: 75.8794, type: 'locality' },
  { name: 'Annapurna Road', lat: 22.7401, lon: 75.8877, type: 'locality' },
  
  // West Indore
  { name: 'Scheme 54', lat: 22.7447, lon: 75.8764, type: 'suburb' },
  { name: 'Scheme 78', lat: 22.7281, lon: 75.8452, type: 'suburb' },
  { name: 'Scheme 94', lat: 22.7650, lon: 75.8550, type: 'suburb' },
  { name: 'Scheme 114', lat: 22.7590, lon: 75.8720, type: 'suburb' },
  { name: 'Scheme 140', lat: 22.7690, lon: 75.8650, type: 'suburb' },
  { name: 'AB Road', lat: 22.7450, lon: 75.8950, type: 'locality' },
  { name: 'Bicholi Mardana', lat: 22.7850, lon: 75.8450, type: 'suburb' },
  
  // East Indore
  { name: 'Rau', lat: 22.6230, lon: 75.7890, type: 'suburb' },
  { name: 'Khajrana', lat: 22.7408, lon: 75.9038, type: 'suburb' },
  { name: 'LIG Colony', lat: 22.7350, lon: 75.8850, type: 'suburb' },
  { name: 'Nipania', lat: 22.7650, lon: 75.9150, type: 'suburb' },
  { name: 'Tejaji Nagar', lat: 22.7450, lon: 75.9050, type: 'suburb' },
  
  // North Indore
  { name: 'Bhawarkua', lat: 22.7550, lon: 75.8850, type: 'suburb' },
  { name: 'Aerodrome Road', lat: 22.7280, lon: 75.8010, type: 'locality' },
  { name: 'Manorama Ganj', lat: 22.7320, lon: 75.8520, type: 'suburb' },
  
  // Residential Areas
  { name: 'Sudama Nagar', lat: 22.7512, lon: 75.8963, type: 'suburb' },
  { name: 'Sapna Sangeeta Road', lat: 22.7610, lon: 75.8910, type: 'locality' },
  { name: 'Ratlam Kothi', lat: 22.7150, lon: 75.8550, type: 'locality' },
  { name: 'Krishnapura', lat: 22.7380, lon: 75.8630, type: 'suburb' },
  { name: 'Bengali Square', lat: 22.7509, lon: 75.9045, type: 'locality' },
  { name: 'GPO', lat: 22.7215, lon: 75.8567, type: 'locality' },
  { name: 'Collectorate', lat: 22.7250, lon: 75.8590, type: 'locality' },
  { name: 'Residency Area', lat: 22.7305, lon: 75.8650, type: 'locality' },
  
  // Commercial Areas
  { name: 'Treasure Island', lat: 22.7596, lon: 75.8931, type: 'locality' },
  { name: 'C21 Mall', lat: 22.7596, lon: 75.8931, type: 'locality' },
  { name: 'Orbit Mall', lat: 22.7509, lon: 75.9045, type: 'locality' },
  { name: 'Malhar Mega Mall', lat: 22.7280, lon: 75.8750, type: 'locality' },
  
  // Industrial & IT Areas
  { name: 'Pithampur', lat: 22.6015, lon: 75.6958, type: 'suburb' },
  { name: 'Sanwer Road', lat: 22.7450, lon: 75.8350, type: 'locality' },
  { name: 'Ralamandal', lat: 22.6850, lon: 75.7950, type: 'suburb' },
  { name: 'Super Corridor', lat: 22.7700, lon: 75.8800, type: 'locality' },
  
  // Other Popular Areas
  { name: 'Rajendra Nagar', lat: 22.7420, lon: 75.8980, type: 'suburb' },
  { name: 'Silicon City', lat: 22.7750, lon: 75.8650, type: 'suburb' },
  { name: 'Mahalaxmi Nagar', lat: 22.7390, lon: 75.8720, type: 'suburb' },
  { name: 'Tilak Nagar', lat: 22.7230, lon: 75.8680, type: 'suburb' },
  { name: 'Gandhi Nagar', lat: 22.7280, lon: 75.8590, type: 'suburb' },
  { name: 'Indrapuri', lat: 22.7490, lon: 75.8550, type: 'suburb' },
  { name: 'Geeta Bhawan', lat: 22.7245, lon: 75.8545, type: 'locality' },
  { name: 'Chhoti Gwaltoli', lat: 22.7210, lon: 75.8520, type: 'locality' },
  { name: 'Mangal City', lat: 22.7180, lon: 75.8950, type: 'suburb' },
  { name: 'Musakhedi', lat: 22.7680, lon: 75.9050, type: 'suburb' },
  { name: 'Lasudia Mori', lat: 22.7550, lon: 75.9200, type: 'suburb' },
  { name: 'Pipliyahana', lat: 22.6750, lon: 75.8250, type: 'suburb' },
  { name: 'Limbodi', lat: 22.7020, lon: 75.9180, type: 'suburb' },
  { name: 'Khandwa Road', lat: 22.6950, lon: 75.8550, type: 'locality' },
  { name: 'Dewas Naka', lat: 22.7450, lon: 75.8250, type: 'locality' },
  { name: 'Banganga', lat: 22.7150, lon: 75.8350, type: 'suburb' },
  { name: 'LIG Square', lat: 22.7350, lon: 75.8850, type: 'locality' },
  { name: 'Iron Market', lat: 22.7210, lon: 75.8590, type: 'locality' },
  { name: 'Malwa Mill', lat: 22.7120, lon: 75.8480, type: 'locality' },
  { name: 'Navlakha', lat: 22.7280, lon: 75.8420, type: 'suburb' },
  { name: 'Scheme 51', lat: 22.7380, lon: 75.8580, type: 'suburb' },
  { name: 'Usha Nagar', lat: 22.7450, lon: 75.8780, type: 'suburb' },
  { name: 'Pipliyahana Square', lat: 22.6780, lon: 75.8280, type: 'locality' },
  { name: 'Bombay Hospital Area', lat: 22.7596, lon: 75.8931, type: 'locality' },
  { name: 'Apollo Hospital Area', lat: 22.7238, lon: 75.8794, type: 'locality' },
  { name: 'MY Hospital Area', lat: 22.7220, lon: 75.8620, type: 'locality' },
  
  // Transport Hubs
  { name: 'Railway Station Area', lat: 22.7179, lon: 75.8573, type: 'locality' },
  { name: 'Devi Ahilya Bai Holkar Airport Area', lat: 22.7218, lon: 75.8011, type: 'locality' },
  { name: 'Gangwal Bus Stand', lat: 22.7196, lon: 75.8577, type: 'locality' },
  { name: 'Sarwate Bus Stand', lat: 22.7042, lon: 75.8705, type: 'locality' },
  
  // Educational Hubs
  { name: 'IIT Indore Area', lat: 22.5204, lon: 75.9219, type: 'locality' },
  { name: 'IIM Indore Area', lat: 22.6950, lon: 75.8750, type: 'locality' },
  { name: 'Daly College Area', lat: 22.7080, lon: 75.8520, type: 'locality' },
  { name: 'Prestige Institute Area', lat: 22.7596, lon: 75.8931, type: 'locality' }
];

let stats = {
  totalAreas: 0,
  insertedAreas: 0,
  skippedAreas: 0,
  startTime: Date.now()
};

async function populateIndoreAreasManually() {
  try {
    console.log('\n🏛️  INDORE AREA POPULATION - MANUAL');
    console.log('━'.repeat(70));
    console.log('📍 Adding popular Indore areas to database');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');

    // Find Indore in database
    console.log('🔍 Searching for Indore city...');
    const indoreCity = await City.findOne({ 
      name: /^Indore$/i
    });

    if (!indoreCity) {
      throw new Error('Indore city not found in database. Please run: node scripts/add-indore-city.js first');
    }

    console.log(`✅ Found Indore: ${indoreCity.name}${indoreCity.state ? ', ' + indoreCity.state : ''}`);
    console.log(`   OSM ID: ${indoreCity.osm_id}`);
    console.log(`   Total areas to add: ${INDORE_AREAS.length}`);
    console.log('━'.repeat(70));

    // Transform to Area documents
    console.log('\n🔄 Preparing area documents...');
    const areaDocuments = INDORE_AREAS.map(area => ({
      osm_id: `manual/indore/${area.name}`.toLowerCase().replace(/\s+/g, '-'),
      name: area.name,
      normalizedName: area.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
      city_id: indoreCity._id,
      cityName: indoreCity.name,
      cityOsmId: indoreCity.osm_id,
      placeType: area.type,
      location: {
        type: 'Point',
        coordinates: [area.lon, area.lat]
      },
      lat: area.lat,
      lon: area.lon,
      osmTags: { 
        source: 'manual_curated',
        verified: true,
        addedDate: new Date()
      },
      hasVendors: false,
      vendorCount: 0
    }));

    stats.totalAreas = areaDocuments.length;
    console.log(`✅ Prepared ${stats.totalAreas} area documents`);
    console.log('━'.repeat(70));

    // Display sample areas
    console.log('\n📋 Sample areas (first 15):');
    const sampleSize = Math.min(15, areaDocuments.length);
    for (let i = 0; i < sampleSize; i++) {
      const area = areaDocuments[i];
      console.log(`   ${(i + 1).toString().padStart(2)}. ${area.name.padEnd(30)} (${area.placeType})`);
    }
    if (areaDocuments.length > 15) {
      console.log(`   ... and ${areaDocuments.length - 15} more areas`);
    }
    console.log('━'.repeat(70));

    // Insert into database
    console.log('\n💾 Inserting areas into database...');
    try {
      const insertResult = await Area.insertMany(areaDocuments, { 
        ordered: false,
        rawResult: true 
      }).catch(err => {
        if (err.code === 11000) {
          const duplicates = err.writeErrors?.length || 0;
          const inserted = areaDocuments.length - duplicates;
          stats.skippedAreas = duplicates;
          console.log(`   ℹ️  ${duplicates} areas already existed in database`);
          return { insertedCount: inserted };
        }
        throw err;
      });

      stats.insertedAreas = insertResult.insertedCount || 0;
      console.log(`   ✅ Successfully inserted ${stats.insertedAreas} new areas`);
      
      // Update city
      console.log('   📝 Updating city document...');
      await City.findByIdAndUpdate(indoreCity._id, {
        areaCount: stats.insertedAreas,
        areasFetched: true,
        lastAreaUpdate: new Date()
      });
      console.log('   ✅ City document updated');

    } catch (error) {
      console.error(`   ❌ Database error: ${error.message}`);
      throw error;
    }

    // Final statistics
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
    const totalAreasInDB = await Area.countDocuments({ city_id: indoreCity._id });
    
    console.log('\n' + '━'.repeat(70));
    console.log('🎉 INDORE AREA POPULATION COMPLETE!');
    console.log('━'.repeat(70));
    console.log('📊 Statistics:');
    console.log(`   • Areas prepared: ${stats.totalAreas}`);
    console.log(`   • New areas inserted: ${stats.insertedAreas}`);
    console.log(`   • Duplicates skipped: ${stats.skippedAreas}`);
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

    // Show area list
    console.log('\n📍 All Indore areas in database:');
    const allAreas = await Area.find({ city_id: indoreCity._id })
      .select('name placeType')
      .sort({ name: 1 })
      .lean();
    
    allAreas.forEach((area, idx) => {
      const num = (idx + 1).toString().padStart(2);
      const name = area.name.padEnd(35);
      console.log(`   ${num}. ${name} (${area.placeType})`);
    });

    console.log('━'.repeat(70));
    console.log('\n✅ All done! These areas are now available for:');
    console.log('   • Vendor registration');
    console.log('   • Location-based search');
    console.log('   • Radius-based filtering\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n' + '━'.repeat(70));
    console.error('❌ ERROR OCCURRED');
    console.error('━'.repeat(70));
    console.error(`Message: ${error.message}`);
    console.error('\nStack trace:');
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
  console.log(`📊 Progress: ${stats.insertedAreas}/${stats.totalAreas} areas inserted`);
  
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
  
  process.exit(0);
});

// Run the script
populateIndoreAreasManually();
