/**
 * UNIFIED SEARCH SYSTEM - COMPREHENSIVE TEST SUITE
 * 
 * Tests all features of the unified vendor search:
 * - Four-tier priority ordering
 * - Location resolution strategies
 * - Budget filtering (strict vs flexible)
 * - Radius-based search
 * - Dynamic filtering
 * - Zero-result prevention
 * - Geospatial accuracy
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { searchVendors } = require('../services/unifiedSearchService');
const Vendor = require('../models/VendorNew');
const City = require('../models/City');
const Area = require('../models/Area');

// Test configuration
const TEST_CONFIG = {
  runCleanup: false, // Set to true to clean up test data after tests
  verbose: true      // Set to false for less output
};

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(70));
}

function logTest(testName) {
  log(`\n▶ TEST: ${testName}`, colors.yellow);
}

function logPass(message) {
  log(`  ✓ ${message}`, colors.green);
}

function logFail(message) {
  log(`  ✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`  ℹ ${message}`, colors.blue);
}

// Test counter
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    logPass(message);
  } else {
    failedTests++;
    logFail(message);
  }
}

// Test data IDs (will be populated from database)
let testCityId;
let testAreaId;
let testVendorIds = [];

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log('✓ Connected to MongoDB', colors.green);
  } catch (error) {
    log(`✗ MongoDB connection failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

/**
 * Get test data from database
 */
async function prepareTestData() {
  logSection('PREPARING TEST DATA');
  
  // Find a city with areas (prefer Delhi or Indore)
  const city = await City.findOne({ name: { $in: ['Delhi', 'Indore'] } });
  if (!city) {
    logFail('No test city found. Please run area population scripts first.');
    process.exit(1);
  }
  testCityId = city._id;
  logPass(`Using test city: ${city.name}`);
  
  // Find an area in that city
  const area = await Area.findOne({ city_id: testCityId });
  if (!area) {
    logFail('No areas found in test city.');
    process.exit(1);
  }
  testAreaId = area._id;
  logPass(`Using test area: ${area.name}`);
  
  // Check if there are vendors in the area
  const vendorsInArea = await Vendor.find({ 
    city: city.name, 
    area: area.name,
    isActive: true 
  }).limit(5);
  
  testVendorIds = vendorsInArea.map(v => v._id);
  logInfo(`Found ${vendorsInArea.length} vendors in ${area.name}, ${city.name}`);
  
  if (vendorsInArea.length === 0) {
    log('\n⚠ WARNING: No vendors found in test area. Some tests may not produce results.', colors.yellow);
    log('  Consider adding test vendors or using a different city/area.\n', colors.yellow);
  }
  
  return { city, area };
}

/**
 * TEST 1: Exact Area Match (Tier 1)
 */
async function testExactAreaMatch(city, area) {
  logTest('Exact Area Match - Tier 1 Priority');
  
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 10
    },
    page: 1,
    limit: 20
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed successfully');
  assert(result.results !== undefined, 'Results array exists');
  
  if (result.results.length > 0) {
    // Check if tier 1 results come first
    const tier1Results = result.results.filter(v => v.matchTier === 'exact_area');
    const firstResult = result.results[0];
    
    if (tier1Results.length > 0) {
      assert(
        firstResult.matchTier === 'exact_area',
        'First result is from Tier 1 (exact area match)'
      );
      assert(
        tier1Results.every(v => v.tierPriority === 1),
        'All Tier 1 results have tierPriority = 1'
      );
      logInfo(`Found ${tier1Results.length} exact area matches`);
    } else {
      logInfo('No Tier 1 results found (this is OK if no vendors in exact area)');
    }
    
    // Check tier breakdown in metadata
    if (result.searchQuality && result.searchQuality.tierBreakdown) {
      logInfo(`Tier breakdown: ${JSON.stringify(result.searchQuality.tierBreakdown)}`);
    }
  } else {
    logInfo('No results returned (check if vendors exist in database)');
  }
}

/**
 * TEST 2: Nearby Vendors (Tier 2)
 */
async function testNearbyVendors(city, area) {
  logTest('Nearby Vendors - Tier 2 Priority with Distance Sorting');
  
  // Use area coordinates
  const params = {
    location: {
      latitude: area.location.coordinates[1],
      longitude: area.location.coordinates[0],
      radius: 10
    },
    page: 1,
    limit: 20
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed successfully');
  
  if (result.results.length > 0) {
    const tier2Results = result.results.filter(v => v.matchTier === 'nearby');
    
    if (tier2Results.length > 1) {
      // Check if sorted by distance
      const distances = tier2Results.map(v => v.distance);
      const isSorted = distances.every((dist, i) => 
        i === 0 || dist >= distances[i - 1]
      );
      
      assert(isSorted, 'Tier 2 results are sorted by distance (ascending)');
      logInfo(`Distance range: ${distances[0].toFixed(2)}km - ${distances[distances.length-1].toFixed(2)}km`);
      logInfo(`Found ${tier2Results.length} nearby vendors within ${params.location.radius}km`);
    }
    
    // Verify no results exceed the radius
    const withinRadius = tier2Results.every(v => v.distance <= params.location.radius);
    assert(withinRadius, `All Tier 2 results within ${params.location.radius}km radius`);
  }
}

/**
 * TEST 3: Same City Vendors (Tier 3)
 */
async function testSameCityVendors(city, area) {
  logTest('Same City Vendors - Tier 3 Priority');
  
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 2 // Small radius to force Tier 3
    },
    page: 1,
    limit: 50
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed successfully');
  
  if (result.results.length > 0) {
    const tier3Results = result.results.filter(v => v.matchTier === 'same_city');
    
    if (tier3Results.length > 0) {
      // Verify all tier 3 results are from the same city
      const allSameCity = tier3Results.every(v => v.location.city === city.name);
      assert(allSameCity, `All Tier 3 results are from ${city.name}`);
      logInfo(`Found ${tier3Results.length} vendors from same city`);
    }
    
    // Verify priority ordering: Tier 1 → Tier 2 → Tier 3
    const tiers = result.results.map(v => v.tierPriority);
    const isOrdered = tiers.every((tier, i) => 
      i === 0 || tier >= tiers[i - 1]
    );
    assert(isOrdered, 'Results maintain strict priority ordering (1 → 2 → 3)');
  }
}

/**
 * TEST 4: Budget Filtering - Strict Mode
 */
async function testBudgetFilteringStrict(city, area) {
  logTest('Budget Filtering - Strict Mode (Tier 1 & 2)');
  
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 10
    },
    budget: {
      min: 20000,
      max: 50000
    },
    page: 1,
    limit: 20
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed successfully');
  
  if (result.results.length > 0) {
    // Check Tier 1 & 2 results for strict budget matching
    const tier1And2 = result.results.filter(v => 
      v.matchTier === 'exact_area' || v.matchTier === 'nearby'
    );
    
    if (tier1And2.length > 0) {
      const withinBudget = tier1And2.every(v => {
        // Vendor must have pricing that overlaps with search budget
        const vendorMin = v.pricing?.min || 0;
        const vendorMax = v.pricing?.max || Infinity;
        const searchMin = params.budget.min;
        const searchMax = params.budget.max;
        
        // Overlapping range check
        return (vendorMax >= searchMin && vendorMin <= searchMax);
      });
      
      assert(withinBudget, 'Tier 1 & 2 results match budget strictly (no flexibility)');
      logInfo(`${tier1And2.length} vendors within budget range ₹${params.budget.min}-₹${params.budget.max}`);
    }
  }
}

/**
 * TEST 5: Budget Filtering - Flexible Mode
 */
async function testBudgetFilteringFlexible(city, area) {
  logTest('Budget Filtering - Flexible Mode (Tier 3 & 4)');
  
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 2 // Force Tier 3
    },
    budget: {
      min: 20000,
      max: 50000
    },
    page: 1,
    limit: 50
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed successfully');
  
  if (result.results.length > 0) {
    // Check Tier 3 results for flexible budget (±20%)
    const tier3Results = result.results.filter(v => v.matchTier === 'same_city');
    
    if (tier3Results.length > 0) {
      const flexibleMin = params.budget.min * 0.8; // -20%
      const flexibleMax = params.budget.max * 1.2; // +20%
      
      const withinFlexibleBudget = tier3Results.every(v => {
        const vendorMin = v.pricing?.min || 0;
        const vendorMax = v.pricing?.max || Infinity;
        
        // Check if overlaps with flexible range
        return (vendorMax >= flexibleMin && vendorMin <= flexibleMax);
      });
      
      assert(
        withinFlexibleBudget,
        `Tier 3 results within flexible budget (±20%): ₹${flexibleMin.toFixed(0)}-₹${flexibleMax.toFixed(0)}`
      );
      logInfo(`${tier3Results.length} vendors within flexible budget range`);
    }
  }
}

/**
 * TEST 6: Service Type Filtering
 */
async function testServiceTypeFilter(city, area) {
  logTest('Service Type Filtering');
  
  // Find a common service type
  const sampleVendor = await Vendor.findOne({ isActive: true });
  if (!sampleVendor || !sampleVendor.serviceType) {
    logInfo('Skipping: No vendors with serviceType found');
    return;
  }
  
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 50
    },
    serviceId: sampleVendor.serviceType,
    page: 1,
    limit: 20
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed successfully');
  
  if (result.results.length > 0) {
    const allMatchService = result.results.every(v => 
      v.serviceType === params.serviceId
    );
    assert(allMatchService, `All results match serviceType: ${params.serviceId}`);
    logInfo(`Found ${result.results.length} vendors for service: ${params.serviceId}`);
  }
}

/**
 * TEST 7: Verified Vendors Filter
 */
async function testVerifiedFilter(city, area) {
  logTest('Verified Vendors Filter');
  
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 50
    },
    verified: true,
    page: 1,
    limit: 20
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed successfully');
  
  if (result.results.length > 0) {
    const allVerified = result.results.every(v => v.verified === true);
    assert(allVerified, 'All results are verified vendors');
    logInfo(`Found ${result.results.length} verified vendors`);
  } else {
    logInfo('No verified vendors found in this area');
  }
}

/**
 * TEST 8: Rating Filter
 */
async function testRatingFilter(city, area) {
  logTest('Minimum Rating Filter');
  
  const minRating = 4.0;
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 50
    },
    rating: minRating,
    page: 1,
    limit: 20
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed successfully');
  
  if (result.results.length > 0) {
    const allAboveRating = result.results.every(v => 
      (v.rating || 0) >= minRating
    );
    assert(allAboveRating, `All results have rating >= ${minRating}`);
    logInfo(`Found ${result.results.length} vendors with rating >= ${minRating}`);
  }
}

/**
 * TEST 9: Text Query Search
 */
async function testTextQuery(city, area) {
  logTest('Text Query Search');
  
  const params = {
    query: 'photography',
    location: {
      city: city.name,
      area: area.name,
      radius: 50
    },
    page: 1,
    limit: 20
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed successfully');
  
  if (result.results.length > 0) {
    logInfo(`Found ${result.results.length} vendors matching query: "${params.query}"`);
    
    // Check if results contain the search term in relevant fields
    const relevantResults = result.results.filter(v => {
      const searchableText = `
        ${v.name} ${v.businessName} ${v.description} 
        ${v.serviceType} ${(v.keywords || []).join(' ')}
      `.toLowerCase();
      
      return searchableText.includes(params.query.toLowerCase());
    });
    
    logInfo(`${relevantResults.length}/${result.results.length} results contain search term in text fields`);
  }
}

/**
 * TEST 10: Pagination
 */
async function testPagination(city, area) {
  logTest('Pagination Functionality');
  
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 50
    },
    page: 1,
    limit: 5
  };
  
  const page1 = await searchVendors(params);
  assert(page1.success === true, 'Page 1 search completed');
  assert(page1.page === 1, 'Correct page number returned (page 1)');
  
  if (page1.total > 5) {
    params.page = 2;
    const page2 = await searchVendors(params);
    
    assert(page2.success === true, 'Page 2 search completed');
    assert(page2.page === 2, 'Correct page number returned (page 2)');
    
    // Ensure no duplicate results between pages
    const page1Ids = page1.results.map(v => v._id.toString());
    const page2Ids = page2.results.map(v => v._id.toString());
    const noDuplicates = page1Ids.every(id => !page2Ids.includes(id));
    
    assert(noDuplicates, 'No duplicate vendors across pages');
    logInfo(`Page 1: ${page1.results.length} results, Page 2: ${page2.results.length} results`);
  } else {
    logInfo('Not enough results to test pagination (need > 5)');
  }
}

/**
 * TEST 11: Location Resolution - Direct Coordinates
 */
async function testLocationResolutionCoordinates(city, area) {
  logTest('Location Resolution - Direct Coordinates');
  
  const params = {
    location: {
      latitude: area.location.coordinates[1],
      longitude: area.location.coordinates[0],
      radius: 10
    },
    page: 1,
    limit: 10
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search with direct coordinates completed');
  
  if (result.metadata && result.metadata.searchLocation) {
    assert(
      result.metadata.searchLocation.coordinates !== undefined,
      'Search location coordinates included in metadata'
    );
    logInfo('Successfully resolved location from direct coordinates');
  }
}

/**
 * TEST 12: Location Resolution - Area ID
 */
async function testLocationResolutionAreaId(city, area) {
  logTest('Location Resolution - Area ID');
  
  const params = {
    location: {
      areaId: area._id.toString(),
      radius: 10
    },
    page: 1,
    limit: 10
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search with areaId completed');
  
  if (result.metadata && result.metadata.searchLocation) {
    assert(
      result.metadata.searchLocation.area === area.name,
      `Correctly resolved area: ${area.name}`
    );
    logInfo('Successfully resolved location from areaId');
  }
}

/**
 * TEST 13: Location Resolution - City + Area Name
 */
async function testLocationResolutionCityArea(city, area) {
  logTest('Location Resolution - City + Area Name');
  
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 10
    },
    page: 1,
    limit: 10
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search with city + area name completed');
  
  if (result.metadata && result.metadata.searchLocation) {
    assert(
      result.metadata.searchLocation.city === city.name &&
      result.metadata.searchLocation.area === area.name,
      `Correctly resolved: ${city.name}, ${area.name}`
    );
    logInfo('Successfully resolved location from city + area names');
  }
}

/**
 * TEST 14: Zero Results Prevention - Adjacent Cities
 */
async function testZeroResultsPrevention(city, area) {
  logTest('Zero Results Prevention - Adjacent Cities (Tier 4)');
  
  // Use very restrictive filters to trigger Tier 4
  const params = {
    location: {
      city: city.name,
      area: 'NonexistentArea123',
      radius: 1 // Very small radius
    },
    verified: true,
    rating: 4.9,
    budget: {
      min: 999999,
      max: 1000000
    },
    page: 1,
    limit: 20
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed even with restrictive filters');
  
  if (result.searchQuality && result.searchQuality.tierBreakdown) {
    const hasAdjacentCity = result.searchQuality.tierBreakdown.adjacentCity > 0;
    
    if (result.total < 5) {
      logInfo('Tier 4 (adjacent cities) may be triggered for low result counts');
    }
    
    if (hasAdjacentCity) {
      logPass('Adjacent city vendors included to prevent zero results');
      logInfo(`Adjacent city results: ${result.searchQuality.tierBreakdown.adjacentCity}`);
    } else {
      logInfo('Adjacent cities not needed (sufficient results found)');
    }
  }
}

/**
 * TEST 15: Combined Filters
 */
async function testCombinedFilters(city, area) {
  logTest('Combined Filters - Service + Budget + Rating + Verified');
  
  const sampleVendor = await Vendor.findOne({ isActive: true, verified: true });
  if (!sampleVendor) {
    logInfo('Skipping: No verified vendors found for testing');
    return;
  }
  
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 50
    },
    serviceId: sampleVendor.serviceType,
    budget: {
      min: 10000,
      max: 100000
    },
    rating: 3.0,
    verified: true,
    page: 1,
    limit: 20
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search with combined filters completed');
  
  if (result.results.length > 0) {
    // Verify all filters applied correctly
    const allMatch = result.results.every(v => {
      const matchesService = v.serviceType === params.serviceId;
      const matchesRating = (v.rating || 0) >= params.rating;
      const matchesVerified = v.verified === params.verified;
      
      return matchesService && matchesRating && matchesVerified;
    });
    
    assert(allMatch, 'All results match all applied filters');
    logInfo(`Found ${result.results.length} vendors matching all filters`);
  } else {
    logInfo('No results match all combined filters (this is OK)');
  }
}

/**
 * TEST 16: Tier Priority Ordering Validation
 */
async function testTierPriorityOrdering(city, area) {
  logTest('Tier Priority Ordering - Strict Sequence');
  
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 50
    },
    page: 1,
    limit: 100 // Large limit to get multiple tiers
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed successfully');
  
  if (result.results.length > 1) {
    // Extract tier priorities
    const priorities = result.results.map(v => v.tierPriority);
    
    // Check if strictly ordered (non-decreasing)
    const isStrictlyOrdered = priorities.every((priority, i) => 
      i === 0 || priority >= priorities[i - 1]
    );
    
    assert(isStrictlyOrdered, 'Results maintain strict priority ordering');
    
    // Check for tier transitions
    const uniqueTiers = [...new Set(priorities)];
    logInfo(`Tiers present in results: ${uniqueTiers.join(' → ')}`);
    
    // Verify no tier is skipped (e.g., Tier 1 → Tier 3 without Tier 2)
    const hasValidSequence = uniqueTiers.every((tier, i) => 
      i === 0 || tier <= uniqueTiers[i - 1] + 1
    );
    assert(hasValidSequence, 'No tier numbers are skipped in sequence');
  }
}

/**
 * TEST 17: Distance Calculation Accuracy
 */
async function testDistanceCalculation(city, area) {
  logTest('Distance Calculation Accuracy - Haversine Formula');
  
  const params = {
    location: {
      latitude: area.location.coordinates[1],
      longitude: area.location.coordinates[0],
      radius: 10
    },
    page: 1,
    limit: 10
  };
  
  const result = await searchVendors(params);
  
  assert(result.success === true, 'Search completed successfully');
  
  if (result.results.length > 0) {
    const resultsWithDistance = result.results.filter(v => v.distance !== undefined);
    
    if (resultsWithDistance.length > 0) {
      // Verify all distances are >= 0
      const allPositive = resultsWithDistance.every(v => v.distance >= 0);
      assert(allPositive, 'All distance values are non-negative');
      
      // Verify distances are within radius for Tier 2
      const tier2 = resultsWithDistance.filter(v => v.matchTier === 'nearby');
      if (tier2.length > 0) {
        const withinRadius = tier2.every(v => v.distance <= params.location.radius);
        assert(withinRadius, `All Tier 2 distances <= ${params.location.radius}km radius`);
      }
      
      logInfo(`Distance range: ${Math.min(...resultsWithDistance.map(v => v.distance)).toFixed(2)}km - ${Math.max(...resultsWithDistance.map(v => v.distance)).toFixed(2)}km`);
    }
  }
}

/**
 * TEST 18: Response Format Validation
 */
async function testResponseFormat(city, area) {
  logTest('Response Format - Metadata & Structure');
  
  const params = {
    location: {
      city: city.name,
      area: area.name,
      radius: 10
    },
    page: 1,
    limit: 10
  };
  
  const result = await searchVendors(params);
  
  // Validate response structure
  assert(result.success !== undefined, 'Response has "success" field');
  assert(result.results !== undefined, 'Response has "results" array');
  assert(result.total !== undefined, 'Response has "total" count');
  assert(result.page !== undefined, 'Response has "page" number');
  assert(result.limit !== undefined, 'Response has "limit" value');
  assert(result.metadata !== undefined, 'Response has "metadata" object');
  
  // Validate metadata structure
  if (result.metadata) {
    assert(result.metadata.searchLocation !== undefined, 'Metadata includes searchLocation');
    assert(result.metadata.timestamp !== undefined, 'Metadata includes timestamp');
  }
  
  // Validate search quality metrics
  if (result.searchQuality) {
    assert(result.searchQuality.tierBreakdown !== undefined, 'Search quality includes tierBreakdown');
    assert(result.searchQuality.radiusUsed !== undefined, 'Search quality includes radiusUsed');
    logInfo('Response includes comprehensive search quality metrics');
  }
  
  // Validate individual result structure
  if (result.results.length > 0) {
    const firstResult = result.results[0];
    assert(firstResult.matchTier !== undefined, 'Result has matchTier');
    assert(firstResult.tierPriority !== undefined, 'Result has tierPriority');
    assert(firstResult.location !== undefined, 'Result has location object');
    logInfo('Results have required fields: matchTier, tierPriority, location');
  }
}

/**
 * Print test summary
 */
function printTestSummary() {
  logSection('TEST SUMMARY');
  
  console.log('');
  log(`Total Tests:  ${totalTests}`, colors.bright);
  log(`✓ Passed:     ${passedTests}`, colors.green);
  log(`✗ Failed:     ${failedTests}`, failedTests > 0 ? colors.red : colors.green);
  
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  log(`Success Rate: ${successRate}%`, successRate >= 90 ? colors.green : colors.yellow);
  
  console.log('');
  
  if (failedTests === 0) {
    log('🎉 ALL TESTS PASSED! 🎉', colors.bright + colors.green);
  } else {
    log('⚠ SOME TESTS FAILED - REVIEW OUTPUT ABOVE', colors.yellow);
  }
  
  console.log('');
}

/**
 * Main test runner
 */
async function runAllTests() {
  try {
    // Connect to database
    await connectDB();
    
    // Prepare test data
    const { city, area } = await prepareTestData();
    
    // Run all tests
    logSection('RUNNING UNIFIED SEARCH TESTS');
    
    await testExactAreaMatch(city, area);
    await testNearbyVendors(city, area);
    await testSameCityVendors(city, area);
    await testBudgetFilteringStrict(city, area);
    await testBudgetFilteringFlexible(city, area);
    await testServiceTypeFilter(city, area);
    await testVerifiedFilter(city, area);
    await testRatingFilter(city, area);
    await testTextQuery(city, area);
    await testPagination(city, area);
    await testLocationResolutionCoordinates(city, area);
    await testLocationResolutionAreaId(city, area);
    await testLocationResolutionCityArea(city, area);
    await testZeroResultsPrevention(city, area);
    await testCombinedFilters(city, area);
    await testTierPriorityOrdering(city, area);
    await testDistanceCalculation(city, area);
    await testResponseFormat(city, area);
    
    // Print summary
    printTestSummary();
    
  } catch (error) {
    log(`\n✗ TEST SUITE FAILED: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log('\n✓ MongoDB connection closed', colors.green);
  }
}

// Run tests
runAllTests();
