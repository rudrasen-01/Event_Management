const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');
const VendorNew = require('../models/VendorNew');
const Area = require('../models/Area');
const City = require('../models/City');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ============================================================================
// 10 PROFESSIONAL TEST VENDORS FOR INDORE
// ============================================================================

const TEST_VENDORS = [
  {
    name: 'Royal Photography Studio',
    serviceType: 'photography',
    email: 'contact@royalphotography.com',
    phone: '9876543210',
    password: 'vendor123',
    areaName: 'Vijay Nagar',
    address: '23, Scheme 54, Vijay Nagar, Near Treasure Island Mall',
    pricing: { min: 15000, max: 85000, average: 45000, currency: 'INR', unit: 'event' },
    description: 'Premium wedding and event photography services with 15+ years of experience. Specializing in candid photography, pre-wedding shoots, and cinematic videos.',
    whatsapp: '9876543210',
    website: 'https://royalphotography.com',
    rating: 4.8,
    reviewsCount: 156,
    verified: true,
    yearEstablished: 2008,
    teamSize: 12,
    languages: ['Hindi', 'English'],
    coverageArea: 200
  },
  {
    name: 'Elegant Events Decoration',
    serviceType: 'decoration',
    email: 'info@elegantevents.in',
    phone: '9876543211',
    password: 'vendor123',
    areaName: 'Palasia',
    address: '45, Palasia Square, Near Sayaji Hotel',
    pricing: { min: 25000, max: 150000, average: 75000, currency: 'INR', unit: 'event' },
    description: 'Complete event decoration services including floral arrangements, stage decoration, lighting, and themed setups. Creating memorable experiences since 2010.',
    whatsapp: '9876543211',
    website: 'https://elegantevents.in',
    rating: 4.7,
    reviewsCount: 203,
    verified: true,
    yearEstablished: 2010,
    teamSize: 25,
    languages: ['Hindi', 'English'],
    coverageArea: 150
  },
  {
    name: 'Grand Tent House',
    serviceType: 'tent',
    email: 'bookings@grandtenthouse.com',
    phone: '9876543212',
    password: 'vendor123',
    areaName: 'South Tukoganj',
    address: 'Plot 12, South Tukoganj, Near Race Course Road',
    pricing: { min: 30000, max: 200000, average: 95000, currency: 'INR', unit: 'event' },
    description: 'Leading tent house providing German tents, AC tents, shamiana, and complete event infrastructure. Serving Indore for over 20 years.',
    whatsapp: '9876543212',
    website: 'https://grandtenthouse.com',
    rating: 4.6,
    reviewsCount: 187,
    verified: true,
    yearEstablished: 2003,
    teamSize: 40,
    languages: ['Hindi', 'English'],
    coverageArea: 250
  },
  {
    name: 'Divine Catering Services',
    serviceType: 'catering',
    email: 'orders@divinecatering.in',
    phone: '9876543213',
    password: 'vendor123',
    areaName: 'MG Road',
    address: '78, MG Road, Near Rajwada',
    pricing: { min: 350, max: 1500, average: 750, currency: 'INR', unit: 'plate' },
    description: 'Multi-cuisine catering services with specialization in North Indian, South Indian, Chinese, and Continental dishes. FSSAI certified with hygiene standards.',
    whatsapp: '9876543213',
    website: 'https://divinecatering.in',
    rating: 4.9,
    reviewsCount: 312,
    verified: true,
    yearEstablished: 2005,
    teamSize: 50,
    languages: ['Hindi', 'English'],
    coverageArea: 200
  },
  {
    name: 'Pandit Ravindra Shastri Ji',
    serviceType: 'pandit',
    email: 'contact@panditshastri.com',
    phone: '9876543214',
    password: 'vendor123',
    areaName: 'Rajwada',
    address: 'Geeta Bhawan Road, Near Rajwada Palace',
    pricing: { min: 2100, max: 21000, average: 7500, currency: 'INR', unit: 'ceremony' },
    description: 'Experienced pandit for all Hindu ceremonies including weddings, griha pravesh, namkaran, and other religious rituals. Vedic scholar with 25+ years experience.',
    whatsapp: '9876543214',
    rating: 5.0,
    reviewsCount: 245,
    verified: true,
    yearEstablished: 1998,
    teamSize: 1,
    languages: ['Hindi', 'Sanskrit', 'English'],
    coverageArea: 300
  },
  {
    name: 'Glamour Makeup Studio',
    serviceType: 'makeup',
    email: 'bookings@glamourmakeup.in',
    phone: '9876543215',
    password: 'vendor123',
    areaName: 'Scheme 54',
    address: 'Shop 34, Scheme 54, Near City Centre Mall',
    pricing: { min: 8000, max: 45000, average: 22000, currency: 'INR', unit: 'session' },
    description: 'Professional bridal and party makeup by certified makeup artists. HD makeup, airbrush makeup, and hairstyling services available.',
    whatsapp: '9876543215',
    website: 'https://glamourmakeup.in',
    rating: 4.8,
    reviewsCount: 178,
    verified: true,
    yearEstablished: 2012,
    teamSize: 8,
    languages: ['Hindi', 'English'],
    coverageArea: 100
  },
  {
    name: 'Beats & Rhythm DJ Services',
    serviceType: 'dj',
    email: 'bookings@beatsrhythm.com',
    phone: '9876543216',
    password: 'vendor123',
    areaName: 'Khajrana',
    address: '56, Khajrana Main Road, Near Khajrana Temple',
    pricing: { min: 12000, max: 65000, average: 32000, currency: 'INR', unit: 'event' },
    description: 'Premium DJ and sound system services for weddings, corporate events, and parties. Latest equipment with LED screens and special effects.',
    whatsapp: '9876543216',
    website: 'https://beatsrhythm.com',
    rating: 4.7,
    reviewsCount: 142,
    verified: true,
    yearEstablished: 2014,
    teamSize: 6,
    languages: ['Hindi', 'English'],
    coverageArea: 180
  },
  {
    name: 'Choreography by Neha',
    serviceType: 'choreographer',
    email: 'neha@dancechoreography.in',
    phone: '9876543217',
    password: 'vendor123',
    areaName: 'Sapna Sangeeta Road',
    address: 'Studio 2, Sapna Sangeeta Road, Above ICICI Bank',
    pricing: { min: 5000, max: 35000, average: 18000, currency: 'INR', unit: 'performance' },
    description: 'Professional choreographer for sangeet, wedding performances, and flash mobs. Specializing in Bollywood, contemporary, and folk dance forms.',
    whatsapp: '9876543217',
    website: 'https://nehachoreography.in',
    rating: 4.9,
    reviewsCount: 165,
    verified: true,
    yearEstablished: 2011,
    teamSize: 10,
    languages: ['Hindi', 'English'],
    coverageArea: 120
  },
  {
    name: 'Mehndi Magic by Asha',
    serviceType: 'mehndi',
    email: 'asha@mehndimagic.com',
    phone: '9876543218',
    password: 'vendor123',
    areaName: 'Bengali Square',
    address: '89, Bengali Square, Near Orbit Mall',
    pricing: { min: 3000, max: 25000, average: 12000, currency: 'INR', unit: 'session' },
    description: 'Award-winning mehndi artist specializing in bridal mehndi, Arabic designs, and contemporary patterns. Using 100% organic henna.',
    whatsapp: '9876543218',
    rating: 4.8,
    reviewsCount: 234,
    verified: true,
    yearEstablished: 2009,
    teamSize: 5,
    languages: ['Hindi', 'English'],
    coverageArea: 150
  },
  {
    name: 'Eventify Planners',
    serviceType: 'eventplanner',
    email: 'plan@eventify.in',
    phone: '9876543219',
    password: 'vendor123',
    areaName: 'AB Road',
    address: 'Office 301, AB Tower, AB Road',
    pricing: { min: 50000, max: 500000, average: 200000, currency: 'INR', unit: 'event' },
    description: 'Full-service event planning and management company. From concept to execution, we handle everything - venue, decoration, catering, entertainment, and logistics.',
    whatsapp: '9876543219',
    website: 'https://eventify.in',
    rating: 4.7,
    reviewsCount: 98,
    verified: true,
    yearEstablished: 2015,
    teamSize: 20,
    languages: ['Hindi', 'English'],
    coverageArea: 300
  }
];

let stats = {
  totalVendors: TEST_VENDORS.length,
  insertedVendors: 0,
  skippedVendors: 0,
  errors: [],
  startTime: Date.now()
};

async function populateTestVendors() {
  try {
    console.log('\n🎯 INDORE TEST VENDORS POPULATION');
    console.log('━'.repeat(70));
    console.log('📍 Adding 10 professional test vendors to Indore');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');

    // Find Indore areas in database
    console.log('🔍 Fetching Indore areas from database...');
    const indoreAreas = await Area.find({ 
      normalizedName: { 
        $in: TEST_VENDORS.map(v => v.areaName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()) 
      }
    }).populate('city_id');

    if (indoreAreas.length === 0) {
      throw new Error('No Indore areas found in database. Please run: node scripts/populate-indore-areas-manual.js first');
    }

    console.log(`✅ Found ${indoreAreas.length} areas in database`);
    console.log('━'.repeat(70));

    // Process each vendor
    for (const vendorData of TEST_VENDORS) {
      try {
        console.log(`\n🏢 Processing: ${vendorData.name}`);
        console.log(`   Service: ${vendorData.serviceType}`);
        console.log(`   Area: ${vendorData.areaName}`);

        // Find matching area
        const area = indoreAreas.find(a => 
          a.normalizedName === vendorData.areaName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
        );

        if (!area) {
          console.log(`   ⚠️  Area not found, skipping vendor`);
          stats.skippedVendors++;
          stats.errors.push(`${vendorData.name}: Area '${vendorData.areaName}' not found`);
          continue;
        }

        // Check if vendor already exists
        const existingVendor = await VendorNew.findOne({ 
          email: vendorData.email 
        });

        if (existingVendor) {
          console.log(`   ⏭️  Vendor already exists (${vendorData.email}), skipping`);
          stats.skippedVendors++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(vendorData.password, 10);

        // Create vendor document (vendorId will be auto-generated)
        const vendor = new VendorNew({
          name: vendorData.name,
          serviceType: vendorData.serviceType,
          email: vendorData.email,
          password: hashedPassword,
          contact: {
            phone: vendorData.phone,
            email: vendorData.email,
            whatsapp: vendorData.whatsapp,
            website: vendorData.website
          },
          location: {
            type: 'Point',
            coordinates: [area.lon, area.lat]
          },
          city: area.city_id.name,
          area: area.name,
          address: vendorData.address,
          pricing: vendorData.pricing,
          description: vendorData.description,
          businessDetails: {
            yearEstablished: vendorData.yearEstablished,
            teamSize: vendorData.teamSize,
            languages: vendorData.languages,
            coverageArea: vendorData.coverageArea
          },
          rating: vendorData.rating,
          reviewsCount: vendorData.reviewsCount,
          verified: vendorData.verified,
          approvalStatus: 'approved',
          status: 'active'
        });

        await vendor.save();
        console.log(`   ✅ Vendor created successfully (ID: ${vendor.vendorId})`);
        console.log(`   📍 Location: [${area.lon}, ${area.lat}]`);
        console.log(`   ⭐ Rating: ${vendorData.rating} (${vendorData.reviewsCount} reviews)`);
        stats.insertedVendors++;

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        stats.errors.push(`${vendorData.name}: ${error.message}`);
      }
    }

    // Print summary
    console.log('\n');
    console.log('━'.repeat(70));
    console.log('📊 POPULATION SUMMARY');
    console.log('━'.repeat(70));
    console.log(`✅ Successfully inserted: ${stats.insertedVendors} vendors`);
    console.log(`⏭️  Skipped: ${stats.skippedVendors} vendors`);
    console.log(`❌ Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n⚠️  ERROR DETAILS:');
      stats.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err}`);
      });
    }

    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Completed in ${duration} seconds`);
    console.log('━'.repeat(70));

    // Print login credentials
    if (stats.insertedVendors > 0) {
      console.log('\n🔐 TEST VENDOR LOGIN CREDENTIALS');
      console.log('━'.repeat(70));
      TEST_VENDORS.forEach(v => {
        console.log(`\n${v.name}:`);
        console.log(`  Email: ${v.email}`);
        console.log(`  Password: ${v.password}`);
        console.log(`  Service: ${v.serviceType}`);
        console.log(`  Area: ${v.areaName}`);
      });
      console.log('\n━'.repeat(70));
    }

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
populateTestVendors();
