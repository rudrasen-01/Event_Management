const mongoose = require('mongoose');

async function checkMPCities() {
  try {
    await mongoose.connect('mongodb+srv://Rudra:6wsNlZkmhJCuJzOl@cluster0.uencxey.mongodb.net/AIS?retryWrites=true&w=majority');
    
    const db = mongoose.connection.db;
    
    // Check for MP cities
    const total = await db.collection('cities').countDocuments({ 
      state: { $regex: /madhya pradesh/i } 
    });
    
    console.log(`\n📍 Total Madhya Pradesh cities: ${total}`);
    
    const mpCities = await db.collection('cities')
      .find({ state: { $regex: /madhya pradesh/i } })
      .limit(10)
      .toArray();
    
    console.log('\n📋 Sample MP cities:');
    mpCities.forEach(c => {
      console.log(`   - ${c.name} | ${c.state} | ${c.placeType} | Areas: ${c.areaCount || 0}`);
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkMPCities();
