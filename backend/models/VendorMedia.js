const mongoose = require('mongoose');

/**
 * Vendor Media Collection
 * Stores all images and videos for vendor portfolios
 * Supports gallery, featured images, and reordering
 */
const vendorMediaSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorNew',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
    default: 'image'
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String, // Cloudinary public_id for deletion
    required: true
  },
  caption: {
    type: String,
    maxlength: 500,
    default: ''
  },
  orderIndex: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'hidden'],
    default: 'public'
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    width: Number,
    height: Number,
    format: String,
    size: Number // bytes
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
vendorMediaSchema.index({ vendorId: 1, visibility: 1, orderIndex: 1 });
vendorMediaSchema.index({ vendorId: 1, type: 1 });
vendorMediaSchema.index({ vendorId: 1, isFeatured: -1 });

// Virtual for thumbnail URL (can be used for videos)
vendorMediaSchema.virtual('thumbnailUrl').get(function() {
  if (this.type === 'video' && this.url) {
    // Generate video thumbnail from Cloudinary
    return this.url.replace('/upload/', '/upload/w_400,h_300,c_fill/');
  }
  return this.url;
});

// Ensure virtuals are included in JSON
vendorMediaSchema.set('toJSON', { virtuals: true });
vendorMediaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('VendorMedia', vendorMediaSchema);
