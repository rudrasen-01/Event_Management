const mongoose = require('mongoose');

async function checkStates() {
  try {
    await mongoose.connect('mongodb+srv://Rudra:6wsNlZkmhJCuJzOl@cluster0.uencxey.mongodb.net/AIS?retryWrites=true&w=majority');
    
    const db = mongoose.connection.db;
    
    // Get unique states
    const states = await db.collection('cities').distinct('state');
    
    console.log(`\n📊 Total unique states: ${states.length}`);
    console.log('\n📋 States in database:');
    
    states.slice(0, 30).forEach(s => {
      console.log(`   - ${s || '(empty)'}`);
    });
    
    // Search for anything with MP or Madhya
    const mpRelated = states.filter(s => 
      s && (s.toLowerCase().includes('mp') || 
            s.toLowerCase().includes('madhya'))
    );
    
    console.log('\n🔍 MP-related states:', mpRelated);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkStates();
