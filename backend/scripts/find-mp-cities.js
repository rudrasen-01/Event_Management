const mongoose = require('mongoose');

async function findMPCities() {
  try {
    await mongoose.connect('mongodb+srv://Rudra:6wsNlZkmhJCuJzOl@cluster0.uencxey.mongodb.net/AIS?retryWrites=true&w=majority');
    
    const db = mongoose.connection.db;
    
    // Check cities with blank/India state
    const indiaStateCities = await db.collection('cities')
      .find({ 
        $or: [
          { state: '' },
          { state: { $exists: false } },
          { state: 'India' },
          { state: null }
        ]
      })
      .limit(20)
      .toArray();
    
    console.log(`\n📍 Cities with empty/India state: ${indiaStateCities.length}`);
    console.log('\n📋 Sample cities:');
    indiaStateCities.forEach(c => {
      console.log(`   - ${c.name} | State: "${c.state || '(empty)'}" | ${c.placeType} | OSM: ${c.osm_id}`);
    });
    
    // Check total count
    const total = await db.collection('cities').countDocuments({ 
      $or: [
        { state: '' },
        { state: { $exists: false } },
        { state: 'India' },
        { state: null }
      ]
    });
    
    console.log(`\n📊 Total cities with empty/India state: ${total}`);
    
    // Search for known MP cities
    const mpCityNames = ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'];
    
    console.log('\n🔍 Searching for known MP cities:');
    for (const cityName of mpCityNames) {
      const found = await db.collection('cities').findOne({ 
        name: { $regex: new RegExp('^' + cityName + '$', 'i') }
      });
      if (found) {
        console.log(`   ✅ ${found.name} - State: "${found.state || '(empty)'}" | OSM: ${found.osm_id}`);
      } else {
        console.log(`   ❌ ${cityName} - Not found`);
      }
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findMPCities();
