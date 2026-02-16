const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Service = require('../models/Service');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// COMPREHENSIVE EVENT SERVICES
// ============================================================================

const SERVICES = [
  {
    serviceId: 'photography',
    serviceName: 'Photography',
    keywords: ['photographer', 'photography', 'photo', 'photos', 'candid', 'wedding photographer', 'pre-wedding', 'shoot', 'photoshoot'],
    icon: '📸',
    budgetRange: {
      min: 10000,
      max: 200000,
      currency: 'INR',
      unit: 'event',
      presets: [
        { label: 'Budget Friendly', min: 10000, max: 30000, tag: 'budget' },
        { label: 'Mid Range', min: 30000, max: 75000, tag: 'popular' },
        { label: 'Premium', min: 75000, max: 150000, tag: 'premium' },
        { label: 'Luxury', min: 150000, max: 200000, tag: 'luxury' }
      ]
    },
    filters: [
      {
        id: 'experience',
        label: 'Experience',
        type: 'range',
        min: 0,
        max: 30,
        unit: 'years'
      },
      {
        id: 'team_size',
        label: 'Team Size',
        type: 'range',
        min: 1,
        max: 50,
        unit: 'people'
      }
    ],
    defaultSort: 'rating',
    priorityFilters: ['budget', 'experience'],
    isActive: true
  },
  {
    serviceId: 'decoration',
    serviceName: 'Decoration',
    keywords: ['decoration', 'decor', 'decorator', 'floral', 'flowers', 'stage decoration', 'mandap', 'theme decoration'],
    icon: '🎨',
    budgetRange: {
      min: 15000,
      max: 300000,
      currency: 'INR',
      unit: 'event',
      presets: [
        { label: 'Budget Friendly', min: 15000, max: 50000, tag: 'budget' },
        { label: 'Mid Range', min: 50000, max: 120000, tag: 'popular' },
        { label: 'Premium', min: 120000, max: 200000, tag: 'premium' },
        { label: 'Luxury', min: 200000, max: 300000, tag: 'luxury' }
      ]
    },
    filters: [],
    defaultSort: 'rating',
    priorityFilters: ['budget'],
    isActive: true
  },
  {
    serviceId: 'catering',
    serviceName: 'Catering',
    keywords: ['catering', 'caterer', 'food', 'menu', 'cuisine', 'buffet', 'dinner', 'lunch', 'breakfast'],
    icon: '🍽️',
    budgetRange: {
      min: 300,
      max: 2500,
      currency: 'INR',
      unit: 'plate',
      presets: [
        { label: 'Budget Friendly', min: 300, max: 600, tag: 'budget' },
        { label: 'Mid Range', min: 600, max: 1200, tag: 'popular' },
        { label: 'Premium', min: 1200, max: 1800, tag: 'premium' },
        { label: 'Luxury', min: 1800, max: 2500, tag: 'luxury' }
      ]
    },
    filters: [],
    defaultSort: 'rating',
    priorityFilters: ['budget'],
    isActive: true
  },
  {
    serviceId: 'tent',
    serviceName: 'Tent House',
    keywords: ['tent', 'tent house', 'shamiana', 'canopy', 'pandal', 'german tent', 'ac tent', 'marquee'],
    icon: '⛺',
    budgetRange: {
      min: 20000,
      max: 500000,
      currency: 'INR',
      unit: 'event',
      presets: [
        { label: 'Budget Friendly', min: 20000, max: 75000, tag: 'budget' },
        { label: 'Mid Range', min: 75000, max: 200000, tag: 'popular' },
        { label: 'Premium', min: 200000, max: 350000, tag: 'premium' },
        { label: 'Luxury', min: 350000, max: 500000, tag: 'luxury' }
      ]
    },
    filters: [],
    defaultSort: 'rating',
    priorityFilters: ['budget'],
    isActive: true
  },
  {
    serviceId: 'dj',
    serviceName: 'DJ & Sound',
    keywords: ['dj', 'disc jockey', 'sound', 'sound system', 'music', 'party dj', 'wedding dj', 'audio'],
    icon: '🎧',
    budgetRange: {
      min: 8000,
      max: 100000,
      currency: 'INR',
      unit: 'event',
      presets: [
        { label: 'Budget Friendly', min: 8000, max: 25000, tag: 'budget' },
        { label: 'Mid Range', min: 25000, max: 50000, tag: 'popular' },
        { label: 'Premium', min: 50000, max: 75000, tag: 'premium' },
        { label: 'Luxury', min: 75000, max: 100000, tag: 'luxury' }
      ]
    },
    filters: [],
    defaultSort: 'rating',
    priorityFilters: ['budget'],
    isActive: true
  },
  {
    serviceId: 'makeup',
    serviceName: 'Makeup Artist',
    keywords: ['makeup', 'makeup artist', 'bridal makeup', 'mua', 'hairstyling', 'hair', 'beauty', 'airbrush'],
    icon: '💄',
    budgetRange: {
      min: 5000,
      max: 80000,
      currency: 'INR',
      unit: 'session',
      presets: [
        { label: 'Budget Friendly', min: 5000, max: 15000, tag: 'budget' },
        { label: 'Mid Range', min: 15000, max: 35000, tag: 'popular' },
        { label: 'Premium', min: 35000, max: 60000, tag: 'premium' },
        { label: 'Luxury', min: 60000, max: 80000, tag: 'luxury' }
      ]
    },
    filters: [],
    defaultSort: 'rating',
    priorityFilters: ['budget'],
    isActive: true
  },
  {
    serviceId: 'mehndi',
    serviceName: 'Mehndi Artist',
    keywords: ['mehndi', 'mehendi', 'henna', 'mehndi artist', 'bridal mehndi', 'arabic mehndi', 'design'],
    icon: '🤲',
    budgetRange: {
      min: 2000,
      max: 40000,
      currency: 'INR',
      unit: 'session',
      presets: [
        { label: 'Budget Friendly', min: 2000, max: 8000, tag: 'budget' },
        { label: 'Mid Range', min: 8000, max: 18000, tag: 'popular' },
        { label: 'Premium', min: 18000, max: 30000, tag: 'premium' },
        { label: 'Luxury', min: 30000, max: 40000, tag: 'luxury' }
      ]
    },
    filters: [],
    defaultSort: 'rating',
    priorityFilters: ['budget'],
    isActive: true
  },
  {
    serviceId: 'choreographer',
    serviceName: 'Choreographer',
    keywords: ['choreographer', 'choreography', 'dance', 'dancer', 'sangeet', 'performance', 'bollywood dance'],
    icon: '💃',
    budgetRange: {
      min: 3000,
      max: 50000,
      currency: 'INR',
      unit: 'performance',
      presets: [
        { label: 'Budget Friendly', min: 3000, max: 10000, tag: 'budget' },
        { label: 'Mid Range', min: 10000, max: 25000, tag: 'popular' },
        { label: 'Premium', min: 25000, max: 40000, tag: 'premium' },
        { label: 'Luxury', min: 40000, max: 50000, tag: 'luxury' }
      ]
    },
    filters: [],
    defaultSort: 'rating',
    priorityFilters: ['budget'],
    isActive: true
  },
  {
    serviceId: 'pandit',
    serviceName: 'Pandit Ji',
    keywords: ['pandit', 'priest', 'purohit', 'wedding pandit', 'puja', 'religious ceremony', 'ritual'],
    icon: '🙏',
    budgetRange: {
      min: 1100,
      max: 25000,
      currency: 'INR',
      unit: 'ceremony',
      presets: [
        { label: 'Budget Friendly', min: 1100, max: 5000, tag: 'budget' },
        { label: 'Mid Range', min: 5000, max: 12000, tag: 'popular' },
        { label: 'Premium', min: 12000, max: 20000, tag: 'premium' },
        { label: 'Luxury', min: 20000, max: 25000, tag: 'luxury' }
      ]
    },
    filters: [],
    defaultSort: 'rating',
    priorityFilters: ['budget'],
    isActive: true
  },
  {
    serviceId: 'eventplanner',
    serviceName: 'Event Planner',
    keywords: ['event planner', 'wedding planner', 'event management', 'planner', 'coordinator', 'organizer'],
    icon: '📋',
    budgetRange: {
      min: 30000,
      max: 1000000,
      currency: 'INR',
      unit: 'event',
      presets: [
        { label: 'Budget Friendly', min: 30000, max: 100000, tag: 'budget' },
        { label: 'Mid Range', min: 100000, max: 300000, tag: 'popular' },
        { label: 'Premium', min: 300000, max: 600000, tag: 'premium' },
        { label: 'Luxury', min: 600000, max: 1000000, tag: 'luxury' }
      ]
    },
    filters: [],
    defaultSort: 'rating',
    priorityFilters: ['budget'],
    isActive: true
  },
  {
    serviceId: 'venue',
    serviceName: 'Venue',
    keywords: ['venue', 'banquet hall', 'marriage hall', 'lawn', 'garden', 'hotel', 'resort', 'farmhouse'],
    icon: '🏛️',
    budgetRange: {
      min: 20000,
      max: 500000,
      currency: 'INR',
      unit: 'day',
      presets: [
        { label: 'Budget Friendly', min: 20000, max: 75000, tag: 'budget' },
        { label: 'Mid Range', min: 75000, max: 200000, tag: 'popular' },
        { label: 'Premium', min: 200000, max: 350000, tag: 'premium' },
        { label: 'Luxury', min: 350000, max: 500000, tag: 'luxury' }
      ]
    },
    filters: [],
    defaultSort: 'rating',
    priorityFilters: ['budget'],
    isActive: true
  },
  {
    serviceId: 'music',
    serviceName: 'Live Music',
    keywords: ['music', 'band', 'live music', 'singer', 'musician', 'orchestra', 'performance'],
    icon: '🎵',
    budgetRange: {
      min: 10000,
      max: 150000,
      currency: 'INR',
      unit: 'event',
      presets: [
        { label: 'Budget Friendly', min: 10000, max: 30000, tag: 'budget' },
        { label: 'Mid Range', min: 30000, max: 70000, tag: 'popular' },
        { label: 'Premium', min: 70000, max: 110000, tag: 'premium' },
        { label: 'Luxury', min: 110000, max: 150000, tag: 'luxury' }
      ]
    },
    filters: [],
    defaultSort: 'rating',
    priorityFilters: ['budget'],
    isActive: true
  }
];

let stats = {
  totalServices: SERVICES.length,
  insertedServices: 0,
  skippedServices: 0,
  errors: []
};

async function populateServices() {
  try {
    console.log('\n🎯 EVENT SERVICES POPULATION');
    console.log('━'.repeat(70));
    console.log(`📍 Adding ${SERVICES.length} event services to database`);
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');

    for (const serviceData of SERVICES) {
      try {
        console.log(`🔧 Processing: ${serviceData.serviceName}`);

        // Check if service already exists
        const existingService = await Service.findOne({ 
          serviceId: serviceData.serviceId 
        });

        if (existingService) {
          console.log(`   ⏭️  Service already exists, skipping`);
          stats.skippedServices++;
          continue;
        }

        // Create service
        const service = new Service(serviceData);
        await service.save();

        console.log(`   ✅ Service created successfully`);
        console.log(`   🏷️  ID: ${service.serviceId}`);
        console.log(`   💰 Budget: ₹${service.budgetRange.min.toLocaleString()} - ₹${service.budgetRange.max.toLocaleString()}`);
        stats.insertedServices++;

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        stats.errors.push(`${serviceData.serviceName}: ${error.message}`);
      }
    }

    // Print summary
    console.log('\n');
    console.log('━'.repeat(70));
    console.log('📊 POPULATION SUMMARY');
    console.log('━'.repeat(70));
    console.log(`✅ Successfully inserted: ${stats.insertedServices} services`);
    console.log(`⏭️  Skipped: ${stats.skippedServices} services`);
    console.log(`❌ Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n⚠️  ERROR DETAILS:');
      stats.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err}`);
      });
    }

    console.log('\n━'.repeat(70));
    console.log('✅ ALL SERVICES ADDED SUCCESSFULLY!');
    console.log('💡 Vendors will now appear in search results.');
    console.log('━'.repeat(70));

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

// Run the script
populateServices();
