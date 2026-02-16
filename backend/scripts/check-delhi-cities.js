const mongoose = require('mongoose');

async function checkDelhiCities() {
  try {
    await mongoose.connect('mongodb+srv://Rudra:6wsNlZkmhJCuJzOl@cluster0.uencxey.mongodb.net/AIS?retryWrites=true&w=majority');
    
    const db = mongoose.connection.db;
    
    // Search for Delhi and NCR cities
    const ncrCityNames = ['Delhi', 'New Delhi', 'Noida', 'Gurgaon', 'Gurugram', 'Faridabad', 'Ghaziabad', 'Greater Noida'];
    
    console.log('\n🔍 Searching for Delhi NCR cities:\n');
    
    for (const cityName of ncrCityNames) {
      const cities = await db.collection('cities').find({ 
        name: { $regex: new RegExp(cityName, 'i') }
      }).toArray();
      
      if (cities.length > 0) {
        cities.forEach(c => {
          console.log(`✅ ${c.name} - State: "${c.state || '(empty)'}" | ${c.placeType} | OSM: ${c.osm_id}`);
        });
      } else {
        console.log(`❌ ${cityName} - Not found`);
      }
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDelhiCities();
