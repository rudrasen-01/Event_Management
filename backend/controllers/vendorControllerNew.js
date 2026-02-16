const Vendor = require('../models/VendorNew');
const Service = require('../models/Service');

exports.loginVendor = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Please provide email and password'
        }
      });
    }
    
    // Find vendor by email and include password
    const vendor = await Vendor.findOne({ 'contact.email': email.toLowerCase() }).select('+password');
    
    if (!vendor) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Check password
    const isPasswordMatch = await vendor.matchPassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Check if vendor is active (admin must activate after registration)
    if (!vendor.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_PENDING_APPROVAL',
          message: 'Your account is pending admin approval. You will be able to login once activated by admin.'
        }
      });
    }

    // Generate JWT token
    const token = vendor.generateAuthToken();

    // Return vendor data with token
    res.status(200).json({
      success: true,
      token,
      data: {
        vendorId: vendor.vendorId,
        _id: vendor._id,
        name: vendor.name,
        businessName: vendor.businessName,
        email: vendor.contact.email,
        phone: vendor.contact.phone,
        serviceType: vendor.serviceType,
        city: vendor.city,
        verified: vendor.verified,
        isActive: vendor.isActive,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        role: 'vendor'
      },
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Login failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

exports.registerVendor = async (req, res, next) => {
  try {
    const {
      name,
      serviceType,
      city,
      area,
      address,
      pincode,
      landmark, // New: Landmark/nearby reference
      pricing,
      filters,
      contact,
      password,
      businessName,
      yearsInBusiness,
      description,
      portfolio,
      serviceAreas
    } = req.body;
    
    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password must be at least 6 characters',
          details: {}
        }
      });
    }
    
    // Check if email already exists
    const existingVendor = await Vendor.findOne({ 'contact.email': contact.email.toLowerCase() });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'A vendor with this email already exists',
          details: {}
        }
      });
    }
    
    // Validate service type
    if (!serviceType || typeof serviceType !== 'string' || serviceType.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SERVICE_TYPE',
          message: 'Service type is required',
          details: {}
        }
      });
    }
    
    // Validate city and area
    if (!city || !area) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_LOCATION',
          message: 'City and area are required',
          details: {}
        }
      });
    }
    
    // Optional: Validate filters against service schema
    const service = await Service.findOne({ 
      serviceId: serviceType.toLowerCase(),
      isActive: true 
    });
    
    if (service && filters) {
      const validation = service.validateFilters(filters);
      if (!validation.isValid) {
        console.warn('⚠️  Filter validation failed but proceeding:', validation.errors);
      }
    }
    
    // ========================================================================
    // GEOCODING: Convert address to coordinates (ONCE at registration)
    // ========================================================================
    const geocodingService = require('../services/geocodingService');
    const City = require('../models/City');
    const Area = require('../models/Area');
    
    let coordinates, geocodedAddress;
    
    try {
      console.log(`🌍 Geocoding vendor location: ${city}, ${area}, ${pincode}`);
      
      // Use smart fallback strategy for better accuracy
      const geocodeResult = await geocodingService.geocodeWithFallback({
        area,
        city,
        pincode,
        landmark
      });
      
      coordinates = [geocodeResult.lon, geocodeResult.lat];
      geocodedAddress = geocodeResult.displayName;
      
      console.log(`✅ Geocoded to: [${coordinates[0]}, ${coordinates[1]}]`);
      
    } catch (geocodeError) {
      console.error(`❌ Geocoding failed: ${geocodeError.message}`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'GEOCODING_FAILED',
          message: `Could not find location: ${area}, ${city}, ${pincode}. Please verify the address is correct.`,
          details: { error: geocodeError.message }
        }
      });
    }
    
    // ========================================================================
    // AUTO-CREATE OR UPDATE AREA in areas collection
    // ========================================================================
    try {
      // Find city in database
      const cityDoc = await City.findOne({ 
        name: new RegExp(`^${city}$`, 'i')
      });
      
      if (cityDoc && area) {
        // Auto-create/update area
        await Area.createOrUpdateFromVendor({
          cityId: cityDoc._id,
          cityName: cityDoc.name,
          cityOsmId: cityDoc.osm_id,
          area: area,
          lat: coordinates[1],
          lon: coordinates[0]
        });
      }
    } catch (areaError) {
      console.warn(`⚠️  Failed to auto-create area: ${areaError.message}`);
      // Don't block vendor registration if area creation fails
    }
    
    // ========================================================================
    // CREATE VENDOR with geocoded coordinates
    // ========================================================================
    const vendor = await Vendor.create({
      name,
      serviceType: serviceType.toLowerCase(),
      location: {
        type: 'Point',
        coordinates: coordinates // [longitude, latitude] from geocoding
      },
      city,
      area,
      address: address || geocodedAddress,
      pincode,
      pricing: {
        min: pricing.min,
        max: pricing.max,
        average: pricing.average || Math.floor((pricing.min + pricing.max) / 2),
        currency: pricing.currency || 'INR',
        unit: pricing.unit || 'per event',
        customPackages: pricing.customPackages || []
      },
      filters: filters || {},
      contact: {
        phone: contact.phone,
        email: contact.email,
        whatsapp: contact.whatsapp,
        website: contact.website,
        socialMedia: contact.socialMedia || {}
      },
      password, // Will be hashed by pre-save hook
      businessName,
      yearsInBusiness: yearsInBusiness || 0,
      description,
      portfolio: portfolio || [],
      serviceAreas: serviceAreas || [],
      verified: false,
      isActive: false  // Vendors start inactive, admin must activate
    });
    
    console.log(`✅ Vendor registered: ${vendor.name} at ${area}, ${city}`);
    
    res.status(201).json({
      success: true,
      message: 'Vendor registration successful! Your profile is pending admin approval and will go live once verified.',
      data: {
        vendorId: vendor.vendorId,
        name: vendor.name,
        serviceType: vendor.serviceType,
        location: {
          city: vendor.city,
          area: vendor.area,
          coordinates: vendor.location.coordinates
        },
        verified: vendor.verified,
        isActive: vendor.isActive,
        status: 'pending_approval'
      }
    });
    
  } catch (error) {
    // Handle duplicate vendor
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_VENDOR',
          message: 'A vendor with this information already exists',
          details: {}
        }
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check the input fields',
          details: { errors }
        }
      });
    }
    
    next(error);
  }
};

exports.updateVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const updates = req.body;
    
    // Don't allow updating these fields directly
    delete updates.vendorId;
    delete updates.verified;
    delete updates.isActive;
    delete updates.rating;
    delete updates.reviewCount;
    delete updates.reviews;
    
    const vendor = await Vendor.findOne({ vendorId });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
          details: { vendorId }
        }
      });
    }
    
    // If filters are being updated, validate them
    if (updates.filters) {
      const service = await Service.findOne({ serviceId: vendor.serviceType });
      if (service) {
        const validation = service.validateFilters(updates.filters);
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_FILTERS',
              message: 'Filter validation failed',
              details: { errors: validation.errors }
            }
          });
        }
      }
    }
    
    // Update vendor
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        vendor[key] = updates[key];
      }
    });
    
    await vendor.save();
    
    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: vendor.toSearchResult()
    });
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check the input fields',
          details: { errors }
        }
      });
    }
    
    next(error);
  }
};

exports.getVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    
    const vendor = await Vendor.findOne({ vendorId, isActive: true })
      .select('-verificationDocuments');
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
          details: { vendorId }
        }
      });
    }
    
    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { rating, comment, eventType, userName } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RATING',
          message: 'Rating must be between 1 and 5',
          details: {}
        }
      });
    }
    
    const vendor = await Vendor.findOne({ vendorId });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
          details: { vendorId }
        }
      });
    }
    
    // Add review
    vendor.reviews.push({
      userName: userName || 'Anonymous',
      rating,
      comment,
      eventType,
      verifiedBooking: false // Set to true if user has booking record
    });
    
    // Update rating
    vendor.updateRating();
    
    await vendor.save();
    
    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        rating: vendor.rating,
        reviewCount: vendor.reviewCount
      }
    });
    
  } catch (error) {
    next(error);
  }
};

exports.deleteVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    
    const vendor = await Vendor.findOne({ vendorId });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
          details: { vendorId }
        }
      });
    }
    
    vendor.isActive = false;
    await vendor.save();
    
    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

exports.getAllVendors = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, serviceType } = req.query;
    
    let query = {};
    
    if (status === 'pending') {
      query.isActive = false;
      query.verified = false;
    } else if (status === 'active') {
      query.isActive = true;
    } else if (status === 'verified') {
      query.verified = true;
    }
    
    if (serviceType) {
      query.serviceType = serviceType.toLowerCase();
    }
    
    const skip = (page - 1) * limit;
    
    const vendors = await Vendor.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews -verificationDocuments');
    
    const total = await Vendor.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        vendors
      }
    });
    
  } catch (error) {
    next(error);
  }
};

exports.approveVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    
    const vendor = await Vendor.findOne({ vendorId });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
          details: { vendorId }
        }
      });
    }
    
    vendor.isActive = true;
    vendor.verified = true;
    vendor.approvedAt = new Date();
    
    await vendor.save();
    
    res.json({
      success: true,
      message: 'Vendor approved successfully',
      data: vendor.toSearchResult()
    });
    
  } catch (error) {
    next(error);
  }
};

exports.rejectVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;
    
    const vendor = await Vendor.findOne({ vendorId });
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: 'Vendor not found',
          details: { vendorId }
        }
      });
    }
    
    vendor.isActive = false;
    vendor.rejectionReason = reason;
    
    await vendor.save();
    
    res.json({
      success: true,
      message: 'Vendor rejected',
      data: {
        vendorId: vendor.vendorId,
        reason
      }
    });
    
  } catch (error) {
    next(error);
  }
};
