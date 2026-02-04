const mongoose = require('mongoose');

/**
 * VendorInquiry Model
 * Separate collection for vendor-specific inquiries
 * Stored in MongoDB collection: 'vendorinquiries'
 */
const vendorInquirySchema = new mongoose.Schema({
  inquiryId: {
    type: String,
    unique: true,
    default: () => `VINQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Customer Information
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  
  userEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  
  userContact: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  
  // Inquiry Details
  eventType: {
    type: String,
    required: [true, 'Event type is required']
  },
  
  eventDate: {
    type: Date
  },
  
  budget: {
    type: Number,
    required: [true, 'Budget is required for vendor inquiries'],
    min: 0
  },
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  
  city: {
    type: String,
    trim: true
  },
  
  // Vendor Reference (REQUIRED for vendor inquiries)
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor ID is required for vendor inquiries']
  },
  
  // Vendor Details Snapshot (Embedded at inquiry time)
  vendorDetails: {
    name: {
      type: String,
      trim: true
    },
    businessName: {
      type: String,
      trim: true
    },
    serviceType: {
      type: String,
      trim: true
    },
    contact: {
      email: String,
      phone: String,
      whatsapp: String
    },
    address: {
      street: String,
      area: String,
      city: String,
      state: String,
      pincode: String
    },
    city: String,
    rating: Number,
    reviewCount: Number,
    verified: Boolean,
    responseTime: String,
    profileImage: String,
    coverImage: String
  },
  
  // Message/Requirements
  message: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'contacted', 'responded', 'closed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Source
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'direct'],
    default: 'website'
  },
  
  // Response tracking
  respondedAt: {
    type: Date
  },
  
  vendorResponse: {
    type: String,
    trim: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'vendorinquiries' // Explicit collection name
});

// Indexes for efficient queries
vendorInquirySchema.index({ vendorId: 1, status: 1, createdAt: -1 });
vendorInquirySchema.index({ userContact: 1, createdAt: -1 });
vendorInquirySchema.index({ status: 1, createdAt: -1 });
vendorInquirySchema.index({ createdAt: -1 });

// Virtual for age of inquiry
vendorInquirySchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Method to mark as responded
vendorInquirySchema.methods.markAsResponded = function(response) {
  this.status = 'responded';
  this.respondedAt = Date.now();
  this.vendorResponse = response;
  return this.save();
};

const VendorInquiry = mongoose.model('VendorInquiry', vendorInquirySchema);

module.exports = VendorInquiry;
