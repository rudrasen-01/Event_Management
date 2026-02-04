const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vendor = require('./models/VendorNew');

dotenv.config();

/**
 * SEARCH INDEX SETUP SCRIPT
 * Creates and verifies all indexes for Justdial-grade search performance
 * Ensures no search failures due to missing or incorrect indexes
 */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const setupSearchIndexes = async () => {
  try {
    await connectDB();

    console.log('\n🔍 SEARCH INDEX SETUP - Justdial-Grade Discovery\n');
    console.log('='.repeat(70));

    // Get existing indexes
    const existingIndexes = await Vendor.collection.getIndexes();
    console.log('\n📋 Existing Indexes:');
    Object.keys(existingIndexes).forEach(indexName => {
      console.log(`   - ${indexName}`);
    });

    console.log('\n🔨 Creating/Verifying Search Indexes...\n');

    // 1. Text Search Index (CRITICAL)
    console.log('1️⃣  Text Search Index (business name, contact person, keywords)');
    try {
      // Drop old text index if exists
      try {
        await Vendor.collection.dropIndex('name_text_description_text_searchKeywords_text');
        console.log('   ⚠️  Dropped old text index');
      } catch (err) {
        // Index doesn't exist, that's fine
      }

      // Create comprehensive text index
      await Vendor.collection.createIndex(
        {
          name: 'text',
          businessName: 'text',
          contactPerson: 'text',
          description: 'text',
          searchKeywords: 'text'
        },
        {
          weights: {
            name: 10,              // Highest priority
            businessName: 10,       // Highest priority
            contactPerson: 8,       // High priority
            searchKeywords: 5,      // Medium priority
            description: 2          // Lower priority
          },
          name: 'vendor_search_text_index',
          default_language: 'english'
        }
      );
      console.log('   ✅ Text search index created with weighted fields');
    } catch (err) {
      if (err.code === 85) {
        console.log('   ℹ️  Text index already exists');
      } else {
        throw err;
      }
    }

    // 2. Geospatial Index (CRITICAL)
    console.log('\n2️⃣  Geospatial Index (location-based search)');
    try {
      await Vendor.collection.createIndex(
        { location: '2dsphere' },
        { name: 'location_2dsphere' }
      );
      console.log('   ✅ 2dsphere index created for radius-based search');
    } catch (err) {
      if (err.code === 85 || err.codeName === 'IndexOptionsConflict') {
        console.log('   ℹ️  Geospatial index already exists');
      } else {
        throw err;
      }
    }

    // 3. Service Type Index
    console.log('\n3️⃣  Service Type Index (category filtering)');
    try {
      await Vendor.collection.createIndex(
        { serviceType: 1 },
        { name: 'serviceType_1' }
      );
      console.log('   ✅ Service type index created');
    } catch (err) {
      if (err.code === 85) {
        console.log('   ℹ️  Service type index already exists');
      } else {
        throw err;
      }
    }

    // 4. Location Indexes (City & Area)
    console.log('\n4️⃣  Location Text Indexes (city & area)');
    try {
      await Vendor.collection.createIndex({ city: 1 }, { name: 'city_1' });
      console.log('   ✅ City index created');
    } catch (err) {
      if (err.code === 85) console.log('   ℹ️  City index already exists');
    }

    try {
      await Vendor.collection.createIndex({ area: 1 }, { name: 'area_1' });
      console.log('   ✅ Area index created');
    } catch (err) {
      if (err.code === 85) console.log('   ℹ️  Area index already exists');
    }

    // 5. Contact Person Index
    console.log('\n5️⃣  Contact Person Index (name-based discovery)');
    try {
      await Vendor.collection.createIndex(
        { contactPerson: 1 },
        { name: 'contactPerson_1' }
      );
      console.log('   ✅ Contact person index created');
    } catch (err) {
      if (err.code === 85) {
        console.log('   ℹ️  Contact person index already exists');
      } else {
        throw err;
      }
    }

    // 6. Verification & Active Status Indexes
    console.log('\n6️⃣  Status Indexes (verified & active)');
    try {
      await Vendor.collection.createIndex({ verified: 1 }, { name: 'verified_1' });
      console.log('   ✅ Verified index created');
    } catch (err) {
      if (err.code === 85) console.log('   ℹ️  Verified index already exists');
    }

    try {
      await Vendor.collection.createIndex({ isActive: 1 }, { name: 'isActive_1' });
      console.log('   ✅ Active status index created');
    } catch (err) {
      if (err.code === 85) console.log('   ℹ️  Active status index already exists');
    }

    // 7. Rating Index
    console.log('\n7️⃣  Rating Index (quality filtering)');
    try {
      await Vendor.collection.createIndex({ rating: -1 }, { name: 'rating_-1' });
      console.log('   ✅ Rating index created (descending)');
    } catch (err) {
      if (err.code === 85) console.log('   ℹ️  Rating index already exists');
    }

    // 8. Compound Indexes for Common Queries
    console.log('\n8️⃣  Compound Indexes (optimized multi-criteria search)');
    
    try {
      await Vendor.collection.createIndex(
        { serviceType: 1, city: 1, verified: 1, isActive: 1 },
        { name: 'compound_category_location_status' }
      );
      console.log('   ✅ Compound: serviceType + city + verified + active');
    } catch (err) {
      if (err.code === 85) console.log('   ℹ️  Compound index 1 already exists');
    }

    try {
      await Vendor.collection.createIndex(
        { city: 1, serviceType: 1, rating: -1 },
        { name: 'compound_location_category_rating' }
      );
      console.log('   ✅ Compound: city + serviceType + rating');
    } catch (err) {
      if (err.code === 85) console.log('   ℹ️  Compound index 2 already exists');
    }

    try {
      await Vendor.collection.createIndex(
        { verified: 1, isActive: 1, rating: -1 },
        { name: 'compound_status_rating' }
      );
      console.log('   ✅ Compound: verified + active + rating');
    } catch (err) {
      if (err.code === 85) console.log('   ℹ️  Compound index 3 already exists');
    }

    // 9. Pricing Index
    console.log('\n9️⃣  Pricing Indexes (budget filtering)');
    try {
      await Vendor.collection.createIndex(
        { 'pricing.min': 1, 'pricing.max': 1 },
        { name: 'pricing_range' }
      );
      console.log('   ✅ Pricing range index created');
    } catch (err) {
      if (err.code === 85) console.log('   ℹ️  Pricing index already exists');
    }

    // Verify final index state
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 Final Index Summary:\n');
    
    const finalIndexes = await Vendor.collection.getIndexes();
    let indexCount = 0;
    Object.entries(finalIndexes).forEach(([indexName, indexSpec]) => {
      indexCount++;
      console.log(`${indexCount}. ${indexName}`);
      if (indexSpec.key) {
        Object.entries(indexSpec.key).forEach(([field, order]) => {
          const orderStr = order === 'text' ? 'TEXT' : order === '2dsphere' ? 'GEO' : order === 1 ? 'ASC' : 'DESC';
          console.log(`     ${field}: ${orderStr}`);
        });
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ SEARCH INDEX SETUP COMPLETE!');
    console.log(`\n📊 Total Indexes: ${indexCount}`);
    console.log('\n🎯 Search Capabilities Enabled:');
    console.log('   ✓ Full-text search (business name, contact person, keywords)');
    console.log('   ✓ Geospatial search (radius-based location discovery)');
    console.log('   ✓ City & area filtering');
    console.log('   ✓ Service category filtering');
    console.log('   ✓ Budget range filtering');
    console.log('   ✓ Rating & review filtering');
    console.log('   ✓ Verification status filtering');
    console.log('   ✓ Multi-criteria compound queries');
    console.log('\n🚀 Platform ready for Justdial-grade search performance!\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Index setup error:', err);
    process.exit(1);
  }
};

setupSearchIndexes();
