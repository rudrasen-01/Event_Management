const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  inquiryId: {
    type: String,
    unique: true,
    default: () => `INQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
    required: [true, 'Budget is required'],
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
  
  // Vendor Reference
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: function() {
      return this.inquiryType === 'vendor_inquiry';
    }
  },
  
  // Message/Requirements
  message: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Inquiry Type
  inquiryType: {
    type: String,
    enum: ['vendor_inquiry', 'general_inquiry', 'contact_inquiry'],
    default: 'vendor_inquiry'
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
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
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
  timestamps: true
});

// Indexes for efficient queries
inquirySchema.index({ vendorId: 1, status: 1, createdAt: -1 });
inquirySchema.index({ userContact: 1, createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ inquiryType: 1, createdAt: -1 });

// Update timestamps on save
inquirySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for age of inquiry
inquirySchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Method to mark as responded
inquirySchema.methods.markAsResponded = function(response) {
  this.status = 'responded';
  this.respondedAt = Date.now();
  this.vendorResponse = response;
  return this.save();
};

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;
