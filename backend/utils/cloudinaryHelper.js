/**
 * Cloudinary Upload Utility
 * Handles image and video uploads to Cloudinary
 * Production-safe with error handling and optimization
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (Use environment variables in production)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Log configuration on startup (mask sensitive data)
console.log('☁️  Cloudinary Configuration:');
console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
console.log('   API Key:', process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 5) + '...' : 'NOT SET');
console.log('   API Secret:', process.env.CLOUDINARY_API_SECRET ? '***SET***' : 'NOT SET');

/**
 * Upload image to Cloudinary
 * @param {Buffer|String} fileBuffer - File buffer or base64 string or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with url and publicId
 */
const uploadImage = async (fileBuffer, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'ais-vendors/images',
      resource_type: 'image',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    // Convert Buffer to base64 data URI if it's a Buffer
    let uploadData = fileBuffer;
    if (Buffer.isBuffer(fileBuffer)) {
      uploadData = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(uploadData, defaultOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary image upload error:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Upload video to Cloudinary
 * @param {Buffer|String} fileBuffer - File buffer or base64 string or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with url and publicId
 */
const uploadVideo = async (fileBuffer, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'ais-vendors/videos',
      resource_type: 'video',
      allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    // Convert Buffer to base64 data URI if it's a Buffer
    let uploadData = fileBuffer;
    if (Buffer.isBuffer(fileBuffer)) {
      uploadData = `data:video/mp4;base64,${fileBuffer.toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(uploadData, defaultOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      thumbnail: result.secure_url.replace('/upload/', '/upload/w_400,h_300,c_fill,so_0/')
    };
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    throw new Error('Failed to upload video');
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} Deletion result
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Generate optimized image URL
 * @param {String} publicId - Cloudinary public_id
 * @param {Object} transformation - Transformation options
 * @returns {String} Optimized URL
 */
const getOptimizedUrl = (publicId, transformation = {}) => {
  return cloudinary.url(publicId, {
    quality: 'auto:good',
    fetch_format: 'auto',
    ...transformation
  });
};

module.exports = {
  uploadImage,
  uploadVideo,
  deleteFile,
  getOptimizedUrl,
  cloudinary
};
