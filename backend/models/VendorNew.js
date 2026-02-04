const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    default: true,
    index: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  rejectionReason: String,
  
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
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

// Hash password before saving
vendorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
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
  
  let query = { isActive: true };
  
  console.log('🔍 Search:', { serviceType, city: location?.city, verified, rating });
  
  // VERIFIED FILTER
  if (verified !== undefined) {
    query.verified = verified;
  }
  
  // TEXT SEARCH
  if (searchQuery && searchQuery.trim()) {
    query.$text = { 
      $search: searchQuery.trim(),
      $caseSensitive: false
    };
  }
  
  // SERVICE TYPE FILTER (Case-insensitive partial match)
  if (serviceType) {
    // Normalize and create flexible regex pattern
    const normalizedService = serviceType.toLowerCase().trim();
    
    // Create regex that matches partial words
    // "photo" matches "photography", "photographer", "photo"
    // "video" matches "videography", "videographer", "video"
    query.serviceType = new RegExp(normalizedService, 'i');
    
    console.log('   Service type filter:', normalizedService, '(partial match)');
  }
  
  // LOCATION
  if (location) {
    // City filter (exact or contains)
    if (location.city) {
      query.city = new RegExp(location.city, 'i');
    }
    
    if (location.area) {
      query.area = new RegExp(location.area, 'i');
    }
    
    // Geospatial search
    if (location.latitude && location.longitude && location.radius) {
      const radiusInMeters = (location.radius || 10) * 1000;
      delete query.city;
      delete query.area;
      
      query.location = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]
          },
          $maxDistance: radiusInMeters
        }
      };
    }
  }
  
  // BUDGET FILTER
  if (budget && (budget.min || budget.max)) {
    const budgetQuery = [];
    
    if (budget.min && budget.max) {
      budgetQuery.push({
        $or: [
          // Vendor min price within user budget
          { 'pricing.min': { $gte: budget.min, $lte: budget.max } },
          { 'pricing.max': { $gte: budget.min, $lte: budget.max } },
          // Vendor range encompasses user budget
          {
            $and: [
              { 'pricing.min': { $lte: budget.min } },
              { 'pricing.max': { $gte: budget.max } }
            ]
          }
        ]
      });
    } else if (budget.min) {
      // Only minimum budget specified
      budgetQuery.push({ 'pricing.max': { $gte: budget.min } });
    } else if (budget.max) {
      // Only maximum budget specified
      budgetQuery.push({ 'pricing.min': { $lte: budget.max } });
    }
    
    if (budgetQuery.length > 0) {
      query.$and = query.$and || [];
      query.$and.push(...budgetQuery);
    }
  }
  
  // RATING FILTER
  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }
  
  // SERVICE-SPECIFIC FILTERS
  Object.keys(filters).forEach(filterKey => {
    if (['verified', 'rating'].includes(filterKey)) return;
    
    const filterValue = filters[filterKey];
    
    if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
      if (Array.isArray(filterValue) && filterValue.length > 0) {
        query[`filters.${filterKey}`] = { $in: filterValue };
      } else if (typeof filterValue === 'boolean') {
        // Boolean filter (e.g., has_backup_equipment)
        query[`filters.${filterKey}`] = filterValue;
      } else {
        // Single value filter
        query[`filters.${filterKey}`] = filterValue;
      }
    }
  });
  
  // SORTING STRATEGY
  let sortOption = {};
  if (searchQuery && query.$text) {
    // Text search: sort by text score (relevance) first
    sortOption = { score: { $meta: 'textScore' }, rating: -1, popularityScore: -1 };
  } else {
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
        // Distance sorting is automatic with $near geospatial query
        sortOption = { rating: -1 };
        break;
      case 'popularity':
        sortOption = { popularityScore: -1, rating: -1 };
        break;
      default: // 'relevance'
        sortOption = { isFeatured: -1, rating: -1, popularityScore: -1 };
    }
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
  
  console.log(`✅ Query executed: ${vendors.length} vendors returned (${total} total match)`);
  
  return {
    results: vendors,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1
  };
};

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
