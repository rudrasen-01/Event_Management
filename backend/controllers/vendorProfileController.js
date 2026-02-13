/**
 * Vendor Profile Controller
 * Handles vendor profile management - media, blogs, videos, reviews
 * Instagram + LinkedIn style profile system
 */

const VendorNew = require('../models/VendorNew');
const VendorMedia = require('../models/VendorMedia');
const VendorBlog = require('../models/VendorBlog');
const VendorVideo = require('../models/VendorVideo');
const VendorReview = require('../models/VendorReview');
const { uploadImage, uploadVideo, deleteFile } = require('../utils/cloudinaryHelper');

/**
 * Get complete vendor profile (Public)
 * Fetches all profile data dynamically from database
 */
exports.getVendorProfile = async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log('Fetching vendor profile for ID:', vendorId);

    // Fetch vendor basic info
    const vendor = await VendorNew.findById(vendorId)
      .select('-password');

    if (!vendor) {
      console.log('Vendor not found');
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    console.log('Vendor found:', vendor.businessName);

    // Only show active and verified vendors publicly
    if (!vendor.isActive || !vendor.verified) {
      console.log('Vendor not active or verified');
      return res.status(403).json({
        success: false,
        message: 'Vendor profile is not available'
      });
    }

    // Fetch media (public only)
    const media = await VendorMedia.find({
      vendorId,
      visibility: 'public'
    }).sort({ isFeatured: -1, orderIndex: 1 }).limit(50);

    console.log('Media found:', media.length);

    // Fetch published blogs
    const blogs = await VendorBlog.find({
      vendorId,
      status: 'published'
    }).sort({ publishedAt: -1 }).limit(10);

    console.log('Blogs found:', blogs.length);

    // Fetch videos (public only)
    const videos = await VendorVideo.find({
      vendorId,
      visibility: 'public'
    }).sort({ orderIndex: 1 }).limit(20);

    console.log('Videos found:', videos.length);

    // Fetch approved reviews
    const reviews = await VendorReview.find({
      vendorId,
      status: 'approved'
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('Reviews found:', reviews.length);

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Build profile response
    const profile = {
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        ownerName: vendor.name,
        serviceType: vendor.serviceType,
        city: vendor.city,
        area: vendor.area,
        description: vendor.description,
        verified: vendor.verified,
        rating: avgRating.toFixed(1),
        totalReviews: reviews.length,
        yearsInBusiness: vendor.yearsInBusiness,
        contact: vendor.contact,
        pricing: vendor.pricing,
        planType: vendor.planType || 'free'
      },
      media: media.map(m => ({
        id: m._id,
        type: m.type,
        url: m.url,
        caption: m.caption,
        isFeatured: m.isFeatured
      })),
      blogs: blogs.map(b => ({
        id: b._id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        coverImage: b.coverImage?.url,
        publishedAt: b.publishedAt,
        readTime: b.metadata?.readTime,
        tags: b.tags
      })),
      videos: videos.map(v => ({
        id: v._id,
        videoUrl: v.videoUrl,
        thumbnail: v.thumbnail?.url,
        title: v.title,
        description: v.description,
        duration: v.duration
      })),
      reviews: reviews.map(r => ({
        id: r._id,
        userName: r.userId?.name,
        rating: r.rating,
        comment: r.comment,
        isVerified: r.isVerified,
        createdAt: r.createdAt,
        vendorResponse: r.vendorResponse
      })),
      stats: {
        totalMedia: media.length,
        totalBlogs: blogs.length,
        totalVideos: videos.length,
        totalReviews: reviews.length,
        avgRating: avgRating.toFixed(1)
      }
    };

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get vendor dashboard data (Authenticated)
 * Includes draft content and hidden media
 */
exports.getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    // Fetch all media (including hidden)
    const media = await VendorMedia.find({ vendorId })
      .sort({ orderIndex: 1 });

    // Fetch all blogs (including drafts)
    const blogs = await VendorBlog.find({ vendorId })
      .sort({ createdAt: -1 });

    // Fetch all videos
    const videos = await VendorVideo.find({ vendorId })
      .sort({ orderIndex: 1 });

    // Calculate profile completion
    const vendor = await VendorNew.findById(vendorId);
    const completionScore = calculateProfileCompletion(vendor, media, blogs, videos);

    res.json({
      success: true,
      data: {
        media,
        blogs,
        videos,
        profileCompletion: completionScore,
        planType: vendor.planType || 'free',
        limits: getVendorLimits(vendor.planType || 'free')
      }
    });
  } catch (error) {
    console.error('Get vendor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

/**
 * Upload media (image/video)
 */
exports.uploadMedia = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { type, caption, isFeatured } = req.body;
    const file = req.file; // Assumes multer middleware

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Check vendor plan limits
    const vendor = await VendorNew.findById(vendorId);
    const limits = getVendorLimits(vendor.planType || 'free');
    const currentCount = await VendorMedia.countDocuments({ vendorId, type: 'image' });

    if (limits.portfolioLimit !== -1 && currentCount >= limits.portfolioLimit) {
      return res.status(403).json({
        success: false,
        message: `Portfolio limit reached. Your plan allows ${limits.portfolioLimit} images/videos.`
      });
    }

    // Upload to Cloudinary
    let uploadResult;
    if (type === 'video') {
      uploadResult = await uploadVideo(file.buffer || file.path);
    } else {
      uploadResult = await uploadImage(file.buffer || file.path);
    }

    // Create media record
    const media = new VendorMedia({
      vendorId,
      type: type || 'image',
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      caption: caption || '',
      isFeatured: isFeatured || false,
      metadata: {
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.size
      }
    });

    await media.save();

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: media
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media'
    });
  }
};

/**
 * Delete media
 */
exports.deleteMedia = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { mediaId } = req.params;

    const media = await VendorMedia.findOne({ _id: mediaId, vendorId });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Delete from Cloudinary
    await deleteFile(media.publicId, media.type);

    // Delete from database
    await media.deleteOne();

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media'
    });
  }
};

/**
 * Reorder media
 */
exports.reorderMedia = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { mediaOrder } = req.body; // Array of { mediaId, orderIndex }

    if (!Array.isArray(mediaOrder)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid media order data'
      });
    }

    // Update order indexes
    const updates = mediaOrder.map(({ mediaId, orderIndex }) =>
      VendorMedia.updateOne(
        { _id: mediaId, vendorId },
        { orderIndex }
      )
    );

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Media order updated successfully'
    });
  } catch (error) {
    console.error('Reorder media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder media'
    });
  }
};

/**
 * Create blog post
 */
exports.createBlog = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { title, content, tags, status, coverImage } = req.body;

    const blog = new VendorBlog({
      vendorId,
      title,
      content,
      tags: tags || [],
      status: status || 'draft',
      coverImage: coverImage || {}
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog'
    });
  }
};

/**
 * Update blog post
 */
exports.updateBlog = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { blogId } = req.params;
    const updates = req.body;

    const blog = await VendorBlog.findOneAndUpdate(
      { _id: blogId, vendorId },
      updates,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog'
    });
  }
};

/**
 * Delete blog post
 */
exports.deleteBlog = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { blogId } = req.params;

    const blog = await VendorBlog.findOneAndDelete({ _id: blogId, vendorId });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog'
    });
  }
};

/**
 * Update vendor profile (Owner only)
 * Updates business information that shows in search results
 */
exports.updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.user?._id;
    console.log('📝 Updating profile for vendor:', vendorId);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Vendor ID not found. Please login again.'
      });
    }

    const {
      businessName,
      ownerName,
      serviceType,
      description,
      city,
      area,
      address,
      contact,
      email,
      whatsapp,
      website,
      instagram,
      facebook,
      yearsInBusiness,
      teamSize,
      priceRange
    } = req.body;

    // Find and update vendor
    const vendor = await VendorNew.findById(vendorId);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update basic info
    if (businessName !== undefined) vendor.businessName = businessName;
    if (ownerName !== undefined) vendor.name = ownerName;
    if (serviceType !== undefined) vendor.serviceType = serviceType;
    if (description !== undefined) vendor.description = description;

    // Update location
    if (city !== undefined) vendor.city = city;
    if (area !== undefined) vendor.area = area;
    if (address !== undefined) vendor.address = address;

    // Update contact (nested schema)
    if (!vendor.contact) vendor.contact = {};
    if (contact !== undefined) vendor.contact.phone = contact;
    // Email is readonly - don't allow updates
    if (whatsapp !== undefined) vendor.contact.whatsapp = whatsapp;
    if (website !== undefined) vendor.contact.website = website;

    // Update social media (nested in contact)
    if (!vendor.contact.socialMedia) vendor.contact.socialMedia = {};
    if (instagram !== undefined) vendor.contact.socialMedia.instagram = instagram;
    if (facebook !== undefined) vendor.contact.socialMedia.facebook = facebook;

    // Update business stats
    if (yearsInBusiness !== undefined) vendor.yearsInBusiness = yearsInBusiness;
    if (teamSize !== undefined) vendor.teamSize = teamSize;

    // Update pricing
    if (priceRange) {
      if (!vendor.pricing) vendor.pricing = {};
      if (priceRange.min !== undefined) vendor.pricing.min = priceRange.min;
      if (priceRange.max !== undefined) vendor.pricing.max = priceRange.max;
    }

    vendor.updatedAt = Date.now();

    await vendor.save();

    console.log('Profile updated successfully');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: vendor
    });

  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Get vendor's own profile for editing (Owner only)
 */
exports.getMyProfile = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.user?._id;
    console.log('🔍 Fetching profile for vendor:', vendorId);
    console.log('📝 Request user:', req.user);
    console.log('📝 Request vendor:', req.vendor);

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Vendor ID not found. Please login again.'
      });
    }

    const vendor = await VendorNew.findById(vendorId).select('-password');
    
    if (!vendor) {
      console.log('❌ Vendor not found in database');
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    console.log('✅ Vendor found:', vendor.businessName);

    res.json({
      success: true,
      data: vendor
    });

  } catch (error) {
    console.error('❌ Error fetching vendor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Helper: Calculate profile completion percentage
 */
function calculateProfileCompletion(vendor, media, blogs, videos) {
  let score = 0;
  const weights = {
    basicInfo: 20,
    contact: 15,
    description: 10,
    pricing: 10,
    media: 25,
    blogs: 10,
    videos: 10
  };

  // Basic info
  if (vendor.businessName && vendor.serviceType && vendor.city) score += weights.basicInfo;

  // Contact
  if (vendor.contact?.email && vendor.contact?.phone) score += weights.contact;

  // Description
  if (vendor.description && vendor.description.length > 50) score += weights.description;

  // Pricing
  if (vendor.pricing?.min && vendor.pricing?.max) score += weights.pricing;

  // Media (at least 3 images)
  if (media.length >= 3) score += weights.media;
  else if (media.length > 0) score += (media.length / 3) * weights.media;

  // Blogs (at least 1)
  if (blogs.length > 0) score += weights.blogs;

  // Videos (at least 1)
  if (videos.length > 0) score += weights.videos;

  return Math.round(score);
}

/**
 * Helper: Get vendor plan limits
 */
exports.getVendorLimits = function(planType) {
  const limits = {
    free: {
      portfolioLimit: 5,
      blogLimit: 2,
      videoLimit: 0,
      features: ['Basic listing', 'Up to 5 images']
    },
    starter: {
      portfolioLimit: 15,
      blogLimit: 10,
      videoLimit: 5,
      features: ['Verified badge', 'Up to 15 images/videos', 'Blog posts']
    },
    growth: {
      portfolioLimit: 30,
      blogLimit: 30,
      videoLimit: 15,
      features: ['Featured placement', 'Up to 30 images/videos', 'Unlimited blogs']
    },
    premium: {
      portfolioLimit: -1, // Unlimited
      blogLimit: -1,
      videoLimit: -1,
      features: ['Premium badge', 'Unlimited portfolio', 'Priority support']
    }
  };

  return limits[planType] || limits.free;
};
