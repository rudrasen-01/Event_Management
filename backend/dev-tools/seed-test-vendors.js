const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vendor = require('../models/VendorNew');

// DEV ONLY - Test vendors for development
dotenv.config({ path: require('path').join(__dirname, '../.env') });

// Safety: only run this seeder when the env flag is explicitly set
if (process.env.SEED_TEST_VENDORS !== 'true') {
  console.log('\n⚠️  SEED_TEST_VENDORS not enabled. To run this seeder set SEED_TEST_VENDORS=true in your environment.');
  process.exit(0);
}

const TEST_VENDORS = [
  {
    name: 'Royal Wedding Photography',
    businessName: 'Royal Wedding Photography Studio',
    contactPerson: 'Rudra Sen',
    serviceType: 'photographer',
    location: {
      type: 'Point',
      coordinates: [75.8577, 22.7196] // [longitude, latitude] - Indore
    },
    city: 'Indore',
    area: 'Vijay Nagar',
    address: '123, Photography Street, Vijay Nagar, Indore',
    pincode: '452010',
    pricing: {
      min: 25000,
      max: 100000,
      average: 50000,
      currency: 'INR',
      unit: 'per event'
    },
    contact: {
      phone: '9876543210',
      email: 'royal@photography.com',
      whatsapp: '9876543210'
    },
    password: 'vendor123',
    description: 'Professional wedding photography with candid and traditional styles. 10+ years experience.',
    searchKeywords: ['wedding', 'candid', 'photography', 'prewedding', 'engagement'],
    yearsInBusiness: 10,
    rating: 4.8,
    reviewCount: 45,
    verified: true,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Divine Caterers',
    businessName: 'Divine Caterers & Events',
    contactPerson: 'Amit Sharma',
    serviceType: 'caterer',
    location: {
      type: 'Point',
      coordinates: [75.8600, 22.7250] // Indore
    },
    city: 'Indore',
    area: 'South Tukoganj',
    address: '456, Food Court Road, South Tukoganj, Indore',
    pincode: '452001',
    pricing: {
      min: 300,
      max: 1500,
      average: 800,
      currency: 'INR',
      unit: 'per plate'
    },
    contact: {
      phone: '9876543211',
      email: 'divine@caterers.com',
      whatsapp: '9876543211'
    },
    password: 'vendor123',
    description: 'Premium catering services for weddings, corporate events, and private parties. Specializing in North Indian, South Indian, and Continental cuisines.',
    searchKeywords: ['catering', 'food', 'wedding food', 'party catering', 'buffet'],
    yearsInBusiness: 8,
    rating: 4.5,
    reviewCount: 32,
    verified: true,
    isActive: true,
    isFeatured: false
  },
  {
    name: 'Perfect Wedding Planners',
    businessName: 'Perfect Wedding Planners',
    contactPerson: 'Priya Verma',
    serviceType: 'wedding-planner',
    location: {
      type: 'Point',
      coordinates: [75.8700, 22.7300] // Indore
    },
    city: 'Indore',
    area: 'Palasia',
    address: '789, Event Plaza, Palasia Square, Indore',
    pincode: '452001',
    pricing: {
      min: 50000,
      max: 500000,
      average: 150000,
      currency: 'INR',
      unit: 'per event'
    },
    contact: {
      phone: '9876543212',
      email: 'perfect@weddingplanners.com',
      whatsapp: '9876543212'
    },
    password: 'vendor123',
    description: 'Full-service wedding planning and management. From venue selection to execution, we handle everything.',
    searchKeywords: ['wedding planner', 'event management', 'wedding coordination', 'destination wedding'],
    yearsInBusiness: 12,
    rating: 4.9,
    reviewCount: 67,
    verified: true,
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Sound & Lights Magic',
    businessName: 'Sound & Lights Magic',
    contactPerson: 'Rajesh Kumar',
    serviceType: 'sound-system',
    location: {
      type: 'Point',
      coordinates: [75.8500, 22.7150] // Indore
    },
    city: 'Indore',
    area: 'Rau',
    address: '321, Tech Street, Rau, Indore',
    pincode: '453331',
    pricing: {
      min: 15000,
      max: 80000,
      average: 35000,
      currency: 'INR',
      unit: 'per event'
    },
    contact: {
      phone: '9876543213',
      email: 'sound@lightsmagic.com',
      whatsapp: '9876543213'
    },
    password: 'vendor123',
    description: 'Professional sound system and lighting setup for all types of events.',
    searchKeywords: ['sound', 'lights', 'audio', 'dj equipment', 'pa system'],
    yearsInBusiness: 6,
    rating: 4.3,
    reviewCount: 28,
    verified: true,
    isActive: true,
    isFeatured: false
  },
  {
    name: 'Bloom Florist',
    businessName: 'Bloom Florist & Decorators',
    contactPerson: 'Sneha Patel',
    serviceType: 'floral-decor',
    location: {
      type: 'Point',
      coordinates: [75.8650, 22.7280] // Indore
    },
    city: 'Indore',
    area: 'MG Road',
    address: '567, Flower Market, MG Road, Indore',
    pincode: '452001',
    pricing: {
      min: 20000,
      max: 200000,
      average: 80000,
      currency: 'INR',
      unit: 'per event'
    },
    contact: {
      phone: '9876543214',
      email: 'bloom@florist.com',
      whatsapp: '9876543214'
    },
    password: 'vendor123',
    description: 'Beautiful floral decorations for weddings, corporate events, and special occasions.',
    searchKeywords: ['flowers', 'floral decoration', 'wedding flowers', 'flower arrangement'],
    yearsInBusiness: 5,
    rating: 4.6,
    reviewCount: 41,
    verified: true,
    isActive: true,
    isFeatured: false
  },
  {
    name: 'Grand Banquet Halls',
    businessName: 'Grand Banquet Halls',
    contactPerson: 'Vikram Singh',
    serviceType: 'banquet-hall',
    location: {
      type: 'Point',
      coordinates: [75.8750, 22.7350] // Indore
    },
    city: 'Indore',
    area: 'AB Road',
    address: '999, Grand Complex, AB Road, Indore',
    pincode: '452010',
    pricing: {
      min: 100000,
      max: 500000,
      average: 250000,
      currency: 'INR',
      unit: 'per event'
    },
    contact: {
      phone: '9876543215',
      email: 'grand@banquethalls.com',
      whatsapp: '9876543215'
    },
    password: 'vendor123',
    description: 'Spacious banquet halls with modern amenities. Capacity 500-2000 guests.',
    searchKeywords: ['banquet hall', 'wedding venue', 'party hall', 'function hall'],
    yearsInBusiness: 15,
    rating: 4.7,
    reviewCount: 89,
    verified: true,
    isActive: true,
    isFeatured: true
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const seedTestVendors = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Seeding Test Vendors for Search Discovery\n');
    console.log('='.repeat(70));

    let inserted = 0;
    let skipped = 0;

    for (const vendorData of TEST_VENDORS) {
      const exists = await Vendor.findOne({ 'contact.email': vendorData.contact.email });
      
      if (exists) {
        console.log(`⏭️  Skipping: ${vendorData.name} (already exists)`);
        skipped++;
        continue;
      }

      const vendor = await Vendor.create(vendorData);
      console.log(`✅ Inserted: ${vendor.name} (${vendor.serviceType}) - ${vendor.city}, ${vendor.area}`);
      console.log(`   📍 Location: [${vendor.location.coordinates[0]}, ${vendor.location.coordinates[1]}]`);
      console.log(`   💰 Pricing: ₹${vendor.pricing.min} - ₹${vendor.pricing.max}`);
      console.log(`   ✓ Verified: ${vendor.verified ? 'Yes' : 'No'}`);
      inserted++;
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n📊 Seeding Summary:`);
    console.log(`   ✅ Inserted: ${inserted} vendors`);
    console.log(`   ⏭️  Skipped: ${skipped} vendors (already exist)`);
    console.log(`   📋 Total Test Vendors: ${TEST_VENDORS.length}`);
    
    console.log('\n✅ Test Vendor Seeding Complete!');
    console.log('\n🎯 Seeded Vendors:');
    console.log('   • Royal Wedding Photography (Photographer, Vijay Nagar)');
    console.log('   • Divine Caterers (Caterer, South Tukoganj)');
    console.log('   • Perfect Wedding Planners (Wedding Planner, Palasia)');
    console.log('   • Sound & Lights Magic (Sound System, Rau)');
    console.log('   • Bloom Florist (Floral Decor, MG Road)');
    console.log('   • Grand Banquet Halls (Banquet Hall, AB Road)');
    console.log('\n📍 All vendors located in Indore, Madhya Pradesh');
    console.log('✓ All vendors are VERIFIED and ACTIVE');
    console.log('🔍 Ready for search discovery testing!\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedTestVendors();
