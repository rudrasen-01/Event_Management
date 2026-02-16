const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://Rudra:6wsNlZkmhJCuJzOl@cluster0.uencxey.mongodb.net/AIS?retryWrites=true&w=majority';

async function checkCollections() {
  try {
    console.log('\n🔌 Connecting to MongoDB Atlas...\n');
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    console.log('📊 DATABASE COLLECTION STATISTICS');
    console.log('━'.repeat(70));
    
    const collections = ['cities', 'areas', 'vendors', 'taxonomies', 'users', 'inquiries', 'vendorinquiries'];
    
    for (const collectionName of collections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        const sample = await db.collection(collectionName).findOne();
        
        console.log(`\n📁 ${collectionName.toUpperCase()}`);
        console.log(`   📊 Total Documents: ${count}`);
        
        if (sample) {
          const keys = Object.keys(sample).filter(k => !k.startsWith('_')).slice(0, 6);
          console.log(`   🔑 Sample Fields: ${keys.join(', ')}`);
          
          // Special info for cities and areas
          if (collectionName === 'cities' && count > 0) {
            const cities = await db.collection('cities').find().limit(5).toArray();
            console.log(`   📍 Sample Cities: ${cities.map(c => c.name).join(', ')}`);
          }
          
          if (collectionName === 'areas' && count > 0) {
            const areas = await db.collection('areas').find().limit(5).toArray();
            console.log(`   📍 Sample Areas: ${areas.map(a => `${a.name} (${a.cityName})`).join(', ')}`);
          }
        } else {
          console.log(`   ⚠️  Empty collection`);
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }
    }
    
    console.log('\n' + '━'.repeat(70));
    console.log('✅ Check complete!\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    process.exit(1);
  }
}

checkCollections();
