const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ServiceKeywords = require('./ServiceKeywords');

const portfolioImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: String,
  eventType: String,
  isPrimary: { type: Boolean, default: false }
}, { _id: false });

const pricingSchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  average: Number,
  currency: { type: String, default: 'INR' },
  unit: String, // e.g., 'per event', 'per plate', 'per hour'
  customPackages: [{
    name: String,
    price: Number,
    description: String,
    features: [String]
  }]
}, { _id: false });

const contactSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  whatsapp: String,
  website: String,
  socialMedia: {
    instagram: String,
    facebook: String,
    youtube: String
  }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(coords) {
        return coords.length === 2 && 
               coords[0] >= -180 && coords[0] <= 180 && // longitude
               coords[1] >= -90 && coords[1] <= 90;     // latitude
      },
      message: 'Invalid coordinates format [longitude, latitude]'
    }
  }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  eventType: String,
  images: [String],
  verifiedBooking: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const vendorSchema = new mongoose.Schema({
  // Basic Information
  vendorId: {
    type: String,
    unique: true,
    default: () => `VENDOR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    index: 'text'
  },
  
  // Service Type (links to Service model)
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    lowercase: true,
    index: true,
    ref: 'Service'
  },
  
  // Location (Geospatial)
  location: {
    type: locationSchema,
    required: [true, 'Location is required'],
    index: '2dsphere'
  },
  
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    index: true
  },
  
  area: {
    type: String,
    trim: true,
    index: true
  },
  
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  
  pincode: {
    type: String,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
  },
  
  // Pricing
  pricing: {
    type: pricingSchema,
    required: [true, 'Pricing information is required']
  },
  
  // Dynamic Filters (CRITICAL - Service-Specific)
  // This object can have ANY keys based on service type
  // Example for photography: { photography_type: ['candid'], coverage_duration: 'full-day' }
  // Example for tent: { tent_type: 'frame', capacity: 500 }
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    index: true
  },
  
  // Ratings & Reviews
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
    index: true
  },
  
  reviewCount: {
    type: Number,
    default: 0,
    index: true
  },
  
  reviews: [reviewSchema],
  
  // Verification & Trust
  verified: {
    type: Boolean,
    default: false,
    index: true
  },
  
  verificationDocuments: [{
    type: String,
    url: String,
    uploadedAt: Date
  }],
  
  responseTime: {
    type: String,
    enum: ['within 1 hour', 'within 2 hours', 'within 4 hours', 'within 24 hours', 'slow'],
    default: 'within 24 hours'
  },
  
  // Portfolio
  portfolio: [portfolioImageSchema],
  
  featuredImage: {
    type: String,
    default: ''
  },
  
  // Contact Information
  contact: {
    type: contactSchema,
    required: [true, 'Contact information is required']
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  
  // Business Details
  businessName: String,
  
  contactPerson: {
    type: String,
    trim: true,
    index: true  // For searching by contact person name
  },
  
  yearsInBusiness: {
    type: Number,
    min: 0,
    default: 0
  },
  
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Service Areas
  serviceAreas: [{
    city: String,
    radius: Number // in km
  }],
  
  // Availability
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available'
    },
    bookedDates: [Date],
    blockedDates: [Date]
  },
  
  // Performance Metrics
  totalBookings: {
    type: Number,
    default: 0
  },
  
  completedBookings: {
    type: Number,
    default: 0
  },
  
  responseRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Search Optimization
  searchKeywords: [String],
  
  popularityScore: {
    type: Number,
    default: 0,
    index: true
  },
  
  // Admin
  isActive: {
    type: Boolean,
    default: false,  // New vendors must be activated by admin
    index: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  rejectionReason: String,
  
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Subscription & Payment
  subscription: {
    planId: {
      type: String,
      enum: ['free', 'starter', 'growth', 'premium'],
      default: 'free',
      index: true
    },
    planName: {
      type: String,
      default: 'Free'
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'active',
      index: true
    },
    amount: {
      type: Number,
      default: 0
    },
    paymentId: String,
    orderId: String,
    startDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days free trial
    },
    autoRenew: {
      type: Boolean,
      default: false
    },
    features: [String],
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'lifetime'],
      default: 'lifetime' // free plan is lifetime
    }
  },
  
  // Payment History
  paymentHistory: [{
    paymentId: {
      type: String,
      required: true,
      index: true
    },
    orderId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    gst: Number,
    totalAmount: Number,
    planId: {
      type: String,
      required: true
    },
    planName: String,
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'other'],
      required: true
    },
    paidAt: {
      type: Date,
      default: Date.now
    },
    razorpaySignature: String,
    receiptUrl: String,
    receiptNumber: String,
    failureReason: String,
    refundedAt: Date,
    refundAmount: Number
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ====================================
// INDEXES FOR PERFORMANCE
// ====================================

// Geospatial index for location-based search
vendorSchema.index({ location: '2dsphere' });

// Compound indexes for common queries
vendorSchema.index({ serviceType: 1, city: 1, rating: -1 });
vendorSchema.index({ serviceType: 1, isActive: 1, verified: 1 });
vendorSchema.index({ city: 1, area: 1 });
vendorSchema.index({ 'pricing.average': 1 });
vendorSchema.index({ popularityScore: -1 });
vendorSchema.index({ isFeatured: 1, rating: -1 });

// Text index for comprehensive search (business name, contact person, keywords)
vendorSchema.index({ 
  name: 'text',
  businessName: 'text',
  contactPerson: 'text',
  description: 'text', 
  searchKeywords: 'text' 
}, {
  weights: {
    name: 10,              // Highest priority
    businessName: 10,       // Highest priority
    contactPerson: 8,       // High priority
    searchKeywords: 5,      // Medium priority
    description: 2          // Lower priority
  },
  name: 'vendor_search_text_index'
});

// ====================================
// VIRTUALS
// ====================================

// Calculate average rating from reviews
vendorSchema.virtual('calculatedRating').get(function() {
  if (!this.reviews || !Array.isArray(this.reviews) || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

// ====================================
// METHODS
// ====================================

// Format vendor for search results
vendorSchema.methods.toSearchResult = function(distance = null) {
  return {
    vendorId: this.vendorId,
    name: this.name,
    serviceType: this.serviceType,
    rating: this.rating,
    reviewCount: this.reviewCount,
    distance: distance,
    distanceUnit: distance ? 'km' : null,
    pricing: {
      min: this.pricing.min,
      max: this.pricing.max,
      average: this.pricing.average,
      currency: this.pricing.currency,
      unit: this.pricing.unit
    },
    matchedFilters: this.filters,
    location: {
      city: this.city,
      area: this.area,
      address: this.address
    },
    contact: {
      phone: this.contact.phone,
      email: this.contact.email,
      whatsapp: this.contact.whatsapp
    },
    verified: this.verified,
    responseTime: this.responseTime,
    portfolio: this.portfolio.slice(0, 3).map(p => p.url),
    featuredImage: this.featuredImage
  };
};

// Update rating after new review
vendorSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = parseFloat((sum / this.reviews.length).toFixed(1));
    this.reviewCount = this.reviews.length;
  }
};

// Match password for login
vendorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
vendorSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: this._id,
      vendorId: this.vendorId,
      role: 'vendor',
      email: this.contact.email
    },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '30d' }
  );
};

// Hash password before saving
vendorSchema.pre('save', async function(next) {
  // 1. Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // 2. Auto-populate searchKeywords dynamically from database
  if (this.isModified('serviceType') || this.isModified('name') || this.isModified('businessName') || !this.searchKeywords || this.searchKeywords.length === 0) {
    const keywords = new Set();
    
    // Fetch service-specific keywords from database
    if (this.serviceType) {
      const serviceType = this.serviceType.toLowerCase();
      keywords.add(serviceType);
      
      try {
        // Fetch keywords dynamically from ServiceKeywords collection
        const serviceKeywords = await ServiceKeywords.getKeywordsForService(serviceType);
        serviceKeywords.forEach(keyword => keywords.add(keyword.toLowerCase()));
      } catch (error) {
        console.error('⚠️  Failed to fetch service keywords from database:', error.message);
        // Continue without service keywords if fetch fails
      }
    }
    
    // Add name variations
    if (this.name) {
      const nameParts = this.name.toLowerCase().split(/\s+/);
      nameParts.forEach(part => {
        if (part.length > 2) keywords.add(part);
      });
    }
    
    // Add business name variations
    if (this.businessName) {
      const businessParts = this.businessName.toLowerCase().split(/\s+/);
      businessParts.forEach(part => {
        if (part.length > 2) keywords.add(part);
      });
    }
    
    // Add city and area for location-based searches
    if (this.city) keywords.add(this.city.toLowerCase());
    if (this.area) keywords.add(this.area.toLowerCase());
    
    this.searchKeywords = Array.from(keywords);
  }
  
  next();
});

// ====================================
// STATIC METHODS
// ====================================

/**
 * JUSTDIAL-GRADE COMPREHENSIVE SEARCH
 * Supports: text search, location, budget, category, keywords, verified status
 * Ensures verified vendors are always discoverable when matching criteria
 */
vendorSchema.statics.comprehensiveSearch = async function(searchParams) {
  const {
    query: searchQuery,           // Text search (business name, contact person, keywords)
    serviceType,                   // Service category filter
    location,                      // { city, area, latitude, longitude, radius }
    budget,                        // { min, max }
    filters = {},                  // Service-specific filters
    verified,                      // Filter by verified status
    rating,                        // Minimum rating filter
    sort = 'relevance',
    page = 1,
    limit = 20
  } = searchParams;
  
  console.log('🔍 VendorModel.comprehensiveSearch - Building query...');
  console.log('📥 Search params received:', {
    query: searchQuery,
    serviceType,
    location: location ? {
      city: location.city,
      area: location.area,
      hasCoordinates: !!(location.latitude && location.longitude),
      radius: location.radius
    } : null,
    budget,
    verified,
    rating,
    sort,
    page,
    limit
  });
  
  // Base query: Only active vendors appear in public search
  // Verified is just a badge/trust indicator, not a search filter
  let query = { 
    isActive: true
  };
  let useTextScore = false;
  
  // Optional: Admin can explicitly filter by verified status
  if (verified !== undefined && verified !== null) {
    query.verified = verified === true || verified === 'true';
    console.log('   Verified filter:', query.verified);
  }
  
  console.log('🔍 Search:', { searchQuery, serviceType, city: location?.city, verified: verified !== undefined ? verified : 'any', rating });
  
  // COMPREHENSIVE TEXT SEARCH - Use regex for flexible partial matching
  // This approach works better for real-time search as users type
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = searchQuery.trim();
    
    // Create flexible regex that handles spaces, hyphens, and partial matches
    // "Corporate Event Photography" matches "corporate-event-photography"
    // "photography" matches "photographer", "photography", "photo"
    const flexibleTerm = searchTerm
      .replace(/\s+/g, '[-\\s]*')  // Spaces can be spaces or hyphens
      .replace(/[^a-zA-Z0-9\-\s*]/g, ''); // Remove special chars except hyphen
    const searchRegex = new RegExp(flexibleTerm, 'i'); // Case-insensitive
    
    // Also create a simple partial match for single words
    const simpleTerm = searchTerm.split(/\s+/)[0]; // First word
    const simpleRegex = new RegExp(simpleTerm, 'i');
    
    // Build OR condition to search across multiple fields
    // Using regex allows partial matching: "photo" matches "photography", "photographer"
    const searchConditions = [
      { name: searchRegex },
      { businessName: searchRegex },
      { contactPerson: searchRegex },
      { description: searchRegex },
      { searchKeywords: simpleRegex }, // Use simple regex for keywords array
      { serviceType: searchRegex },
      { city: simpleRegex },
      { area: simpleRegex }
    ];
    
    query.$or = searchConditions;
    
    console.log('   Text search:', searchTerm, '(multi-field flexible regex match)');
    console.log('   Flexible pattern:', flexibleTerm);
  }
  
  // SERVICE TYPE FILTER (Case-insensitive partial match)
  // Only apply if explicitly provided AND no search query
  // When user types text, let the regex search in $or handle serviceType matching
  if (serviceType && !searchQuery) {
    // Normalize and create flexible regex pattern
    const normalizedService = serviceType.toLowerCase().trim();
    
    // Create regex that matches partial words
    // "photo" matches "photography", "photographer", "photo"
    // "video" matches "videography", "videographer", "video"
    query.serviceType = new RegExp(normalizedService, 'i');
    
    console.log('   Service type filter:', normalizedService, '(partial match)');
  }
  // NOTE: If both searchQuery and serviceType exist, serviceType is already
  // included in the $or conditions above, so no need to add it as AND condition
  
  // LOCATION
  let useGeospatial = false;
  let geospatialData = null;
  
  if (location) {
    // City filter (exact or contains)
    if (location.city && location.city.trim()) {
      query.city = new RegExp(location.city.trim(), 'i');
      console.log('   City filter:', location.city);
    }
    
    if (location.area && location.area.trim()) {
      query.area = new RegExp(location.area.trim(), 'i');
      console.log('   Area filter:', location.area);
    }
    
    // Geospatial search - takes precedence over city/area text search
    if (location.latitude && location.longitude && location.radius) {
      const radiusInMeters = (parseFloat(location.radius) || 10) * 1000;
      
      // Remove text-based city/area filters when using geospatial
      delete query.city;
      delete query.area;
      
      // Use $geoWithin instead of $nearSphere for compatibility with other filters
      query.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(location.longitude), parseFloat(location.latitude)],
            parseFloat(location.radius) / 6378.1  // Convert km to radians (Earth radius = 6378.1 km)
          ]
        }
      };
      
      useGeospatial = true;
      geospatialData = {
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude),
        radius: parseFloat(location.radius)
      };
      
      console.log('   Geospatial search:', {
        lat: location.latitude,
        lng: location.longitude,
        radius: `${location.radius}km (${radiusInMeters}m)`
      });
    }
  }
  
  // BUDGET FILTER
  if (budget && (budget.min || budget.max)) {
    console.log('   Budget filter:', { min: budget.min, max: budget.max });
    
    const budgetQuery = [];
    
    if (budget.min !== undefined && budget.min !== null && budget.max !== undefined && budget.max !== null) {
      // Both min and max specified - vendor's price range should overlap with user's budget
      budgetQuery.push({
        $or: [
          // Vendor's min price is within user's budget range
          { 
            $and: [
              { 'pricing.min': { $gte: budget.min } },
              { 'pricing.min': { $lte: budget.max } }
            ]
          },
          // Vendor's max price is within user's budget range
          { 
            $and: [
              { 'pricing.max': { $gte: budget.min } },
              { 'pricing.max': { $lte: budget.max } }
            ]
          },
          // Vendor's average price is within user's budget range
          { 
            $and: [
              { 'pricing.average': { $gte: budget.min } },
              { 'pricing.average': { $lte: budget.max } }
            ]
          },
          // Vendor's range completely encompasses user's budget
          {
            $and: [
              { 'pricing.min': { $lte: budget.min } },
              { 'pricing.max': { $gte: budget.max } }
            ]
          }
        ]
      });
    } else if (budget.min !== undefined && budget.min !== null) {
      // Only minimum budget specified - vendor's max price should be >= user's min budget
      budgetQuery.push({ 
        $or: [
          { 'pricing.max': { $gte: budget.min } },
          { 'pricing.average': { $gte: budget.min } }
        ]
      });
    } else if (budget.max !== undefined && budget.max !== null) {
      // Only maximum budget specified - vendor's min price should be <= user's max budget
      budgetQuery.push({ 
        $or: [
          { 'pricing.min': { $lte: budget.max } },
          { 'pricing.average': { $lte: budget.max } }
        ]
      });
    }
    
    if (budgetQuery.length > 0) {
      query.$and = query.$and || [];
      query.$and.push(...budgetQuery);
    }
  }
  
  // RATING FILTER
  if (rating !== undefined && rating !== null && parseFloat(rating) > 0) {
    query.rating = { $gte: parseFloat(rating) };
  }
  
  // SERVICE-SPECIFIC FILTERS
  if (filters && Object.keys(filters).length > 0) {
    console.log('   Service-specific filters:', filters);
    
    Object.keys(filters).forEach(filterKey => {
      // Skip common filters that are handled separately
      if (['verified', 'rating', 'city', 'area', 'budget', 'budgetMin', 'budgetMax'].includes(filterKey)) return;
      
      const filterValue = filters[filterKey];
      
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          // Array filter (e.g., multiple photography types)
          query[`filters.${filterKey}`] = { $in: filterValue };
        } else if (typeof filterValue === 'boolean') {
          // Boolean filter (e.g., has_backup_equipment)
          query[`filters.${filterKey}`] = filterValue;
        } else if (typeof filterValue === 'number') {
          // Numeric filter (e.g., capacity >= 500)
          query[`filters.${filterKey}`] = filterValue;
        } else {
          // Single value filter (string)
          query[`filters.${filterKey}`] = filterValue;
        }
      }
    });
  }
  
  // SORTING STRATEGY
  let sortOption = {};
  // Note: We use $geoWithin instead of $nearSphere, so distance sorting needs manual calculation
  switch (sort) {
    case 'rating':
      sortOption = { rating: -1, reviewCount: -1 };
      break;
    case 'price-low':
      sortOption = { 'pricing.average': 1, rating: -1 };
      break;
    case 'price-high':
      sortOption = { 'pricing.average': -1, rating: -1 };
      break;
    case 'reviews':
      sortOption = { reviewCount: -1, rating: -1 };
      break;
    case 'distance':
      // For geospatial queries, we'll calculate distance manually after fetching
      // For now, sort by rating as fallback
      sortOption = { rating: -1 };
      break;
    case 'popularity':
      sortOption = { popularityScore: -1, rating: -1 };
      break;
    default: // 'relevance'
      sortOption = { isFeatured: -1, rating: -1, popularityScore: -1 };
  }
  
  // PAGINATION
  const skip = (page - 1) * limit;
  
  console.log('   Sorting by:', sort);
  console.log('   Page:', page, '| Limit:', limit);
  console.log('📋 Final MongoDB query:', JSON.stringify(query, null, 2));
  
  const queryBuilder = this.find(query);
  
  const vendors = await queryBuilder
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .select('-reviews -verificationDocuments -password')
    .lean();
  
  const total = await this.countDocuments(query);
  
  // Calculate distance for geospatial searches
  let processedVendors = vendors;
  if (useGeospatial && geospatialData) {
    processedVendors = vendors.map(vendor => {
      if (vendor.location && vendor.location.coordinates) {
        const distance = calculateDistance(
          geospatialData.lat,
          geospatialData.lng,
          vendor.location.coordinates[1], // latitude
          vendor.location.coordinates[0]  // longitude
        );
        return {
          ...vendor,
          distance: parseFloat(distance.toFixed(2))
        };
      }
      return vendor;
    });
    
    // Sort by distance if sort option is 'distance'
    if (sort === 'distance') {
      processedVendors.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
  }
  
  console.log(`✅ Query executed: ${vendors.length} vendors returned (${total} total match)`);
  
  return {
    results: processedVendors,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1
  };
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
