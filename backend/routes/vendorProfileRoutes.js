/**
 * Vendor Profile Routes
 * RESTful API routes for vendor profile management
 * Separate public and authenticated routes
 */

const express = require('express');
const router = express.Router();
const vendorProfileController = require('../controllers/vendorProfileController');
const { protect, vendorProtect } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for file uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos allowed.'));
    }
  }
});

// ========================================
// AUTHENTICATED VENDOR ROUTES (Must come BEFORE parameterized routes)
// ========================================

/**
 * GET /api/vendor-profile/profile/me
 * Get vendor's own profile data for editing
 */
router.get('/profile/me', vendorProtect, vendorProfileController.getMyProfile);

/**
 * PUT /api/vendor-profile/profile/update
 * Update vendor's own profile information
 * Body: { businessName, description, city, area, contact, etc. }
 */
router.put('/profile/update', vendorProtect, vendorProfileController.updateVendorProfile);

/**
 * GET /api/vendor-profile/dashboard/me
 * Get vendor's own dashboard data (includes drafts and hidden content)
 */
router.get('/dashboard/me', vendorProtect, vendorProfileController.getVendorDashboard);

// ========================================
// PUBLIC ROUTES
// ========================================

/**
 * GET /api/vendor-profile/:vendorId
 * Get complete public vendor profile
 */
router.get('/:vendorId', vendorProfileController.getVendorProfile);

// ========================================
// MEDIA MANAGEMENT
// ========================================

/**
 * POST /api/vendor-profile/media
 * Upload new media (image or video)
 * Requires: file upload
 */
router.post('/media', vendorProtect, upload.single('file'), vendorProfileController.uploadMedia);

/**
 * DELETE /api/vendor-profile/media/:mediaId
 * Delete media by ID
 */
router.delete('/media/:mediaId', vendorProtect, vendorProfileController.deleteMedia);

/**
 * PUT /api/vendor-profile/media/reorder
 * Reorder media items
 * Body: { mediaOrder: [{ mediaId, orderIndex }] }
 */
router.put('/media/reorder', vendorProtect, vendorProfileController.reorderMedia);

/**
 * PATCH /api/vendor-profile/media/:mediaId/toggle-visibility
 * Toggle media visibility (public/hidden)
 */
router.patch('/media/:mediaId/toggle-visibility', vendorProtect, async (req, res) => {
  try {
    const VendorMedia = require('../models/VendorMedia');
    const vendorId = req.vendor._id;
    const { mediaId } = req.params;

    const media = await VendorMedia.findOne({ _id: mediaId, vendorId });
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    media.visibility = media.visibility === 'public' ? 'hidden' : 'public';
    await media.save();

    res.json({
      success: true,
      message: 'Media visibility updated',
      data: media
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update visibility'
    });
  }
});

/**
 * PATCH /api/vendor-profile/media/:mediaId/feature
 * Toggle featured status
 */
router.patch('/media/:mediaId/feature', vendorProtect, async (req, res) => {
  try {
    const VendorMedia = require('../models/VendorMedia');
    const vendorId = req.vendor._id;
    const { mediaId } = req.params;

    const media = await VendorMedia.findOne({ _id: mediaId, vendorId });
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    media.isFeatured = !media.isFeatured;
    await media.save();

    res.json({
      success: true,
      message: 'Featured status updated',
      data: media
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update featured status'
    });
  }
});

// ========================================
// BLOG MANAGEMENT
// ========================================

/**
 * POST /api/vendor-profile/blogs
 * Create new blog post
 */
router.post('/blogs', vendorProtect, vendorProfileController.createBlog);

/**
 * PUT /api/vendor-profile/blogs/:blogId
 * Update blog post
 */
router.put('/blogs/:blogId', vendorProtect, vendorProfileController.updateBlog);

/**
 * DELETE /api/vendor-profile/blogs/:blogId
 * Delete blog post
 */
router.delete('/blogs/:blogId', vendorProtect, vendorProfileController.deleteBlog);

/**
 * PATCH /api/vendor-profile/blogs/:blogId/publish
 * Publish draft blog
 */
router.patch('/blogs/:blogId/publish', vendorProtect, async (req, res) => {
  try {
    const VendorBlog = require('../models/VendorBlog');
    const vendorId = req.vendor._id;
    const { blogId } = req.params;

    const blog = await VendorBlog.findOneAndUpdate(
      { _id: blogId, vendorId },
      { status: 'published', publishedAt: new Date() },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog published successfully',
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to publish blog'
    });
  }
});

// ========================================
// VIDEO MANAGEMENT
// ========================================

/**
 * POST /api/vendor-profile/videos
 * Upload new video
 */
router.post('/videos', vendorProtect, upload.single('media'), async (req, res) => {
  try {
    const VendorVideo = require('../models/VendorVideo');
    const VendorNew = require('../models/VendorNew');
    const { uploadVideo } = require('../utils/cloudinaryHelper');
    
    const vendorId = req.vendor._id;
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    // Check limits
    const vendor = await VendorNew.findById(vendorId);
    const limits = require('../controllers/vendorProfileController').getVendorLimits ||
      ((plan) => ({ free: { videoLimit: 0 }, starter: { videoLimit: 5 }, growth: { videoLimit: 15 }, premium: { videoLimit: -1 } }[plan]));
    
    const planLimits = limits(vendor.planType || 'free');
    const currentCount = await VendorVideo.countDocuments({ vendorId });

    if (planLimits.videoLimit !== -1 && currentCount >= planLimits.videoLimit) {
      return res.status(403).json({
        success: false,
        message: `Video limit reached. Your plan allows ${planLimits.videoLimit} videos.`
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadVideo(file.buffer || file.path);

    // Create video record
    const video = new VendorVideo({
      vendorId,
      videoUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      title: title || 'Untitled Video',
      description: description || '',
      duration: uploadResult.duration,
      thumbnail: {
        url: uploadResult.thumbnail
      },
      metadata: {
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.size
      }
    });

    await video.save();

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: video
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video'
    });
  }
});

/**
 * PATCH /api/vendor-profile/videos/:videoId/toggle-visibility
 * Toggle video visibility (public/hidden)
 */
router.patch('/videos/:videoId/toggle-visibility', vendorProtect, async (req, res) => {
  try {
    const VendorVideo = require('../models/VendorVideo');
    const vendorId = req.vendor._id;
    const { videoId } = req.params;

    const video = await VendorVideo.findOne({ _id: videoId, vendorId });
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    video.visibility = video.visibility === 'public' ? 'hidden' : 'public';
    await video.save();

    res.json({
      success: true,
      message: 'Video visibility updated',
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update visibility'
    });
  }
});

/**
 * DELETE /api/vendor-profile/videos/:videoId
 * Delete video
 */
router.delete('/videos/:videoId', vendorProtect, async (req, res) => {
  try {
    const VendorVideo = require('../models/VendorVideo');
    const { deleteFile } = require('../utils/cloudinaryHelper');
    
    const vendorId = req.vendor._id;
    const { videoId } = req.params;

    const video = await VendorVideo.findOne({ _id: videoId, vendorId });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Delete from Cloudinary
    await deleteFile(video.publicId, 'video');

    // Delete from database
    await video.deleteOne();

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete video'
    });
  }
});

module.exports = router;
