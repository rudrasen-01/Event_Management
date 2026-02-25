/**
 * Vendor Service
 * Handles vendor profile, media uploads, and dashboard operations
 */

import apiClient from './api';

// ==================== CLOUDINARY MEDIA UPLOADS ====================

/**
 * Upload vendor image to Cloudinary
 * Used for: Profile image, Cover image, Portfolio images
 */
export const uploadVendorImage = async (file) => {
  try {
    console.log('📤 Uploading vendor image...');
    console.log('📄 File details:', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    });
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    
    console.log('☁️  Cloudinary config:', { cloudName, uploadPreset });
    
    if (!cloudName || cloudName === 'your-cloud-name') {
      throw new Error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME in .env file.');
    }
    
    if (!uploadPreset || uploadPreset === 'blog_uploads') {
      console.warn('⚠️  Using blog_uploads preset for vendor images - this should work if preset is unsigned');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'vendors/images');
    formData.append('resource_type', 'image');

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log('📡 Uploading to:', cloudinaryUrl);

    const axios = (await import('axios')).default;
    const response = await axios.post(cloudinaryUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📊 Upload progress: ${percentCompleted}%`);
      }
    });

    console.log('✅ Vendor image uploaded:', response.data.secure_url);
    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
      width: response.data.width,
      height: response.data.height,
      format: response.data.format,
      size: response.data.bytes
    };
  } catch (error) {
    console.error('❌ Error uploading vendor image:', error);
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.data?.error?.message) {
      throw new Error(`Cloudinary Error: ${error.response.data.error.message}`);
    }
    
    throw new Error(error.message || 'Failed to upload image. Please check your Cloudinary configuration.');
  }
};

/**
 * Upload vendor video to Cloudinary
 * Used for: Portfolio videos, promotional videos
 */
export const uploadVendorVideo = async (file) => {
  try {
    console.log('📤 Uploading vendor video...');
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    
    if (!cloudName || cloudName === 'your-cloud-name') {
      throw new Error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME in .env file.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'vendors/videos');
    formData.append('resource_type', 'video');

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

    const axios = (await import('axios')).default;
    const response = await axios.post(cloudinaryUrl, formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📹 Video upload progress: ${percentCompleted}%`);
      }
    });

    console.log('✅ Vendor video uploaded:', response.data.secure_url);
    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
      width: response.data.width,
      height: response.data.height,
      format: response.data.format,
      duration: response.data.duration,
      size: response.data.bytes
    };
  } catch (error) {
    console.error('❌ Error uploading vendor video:', error);
    throw new Error(error.message || 'Failed to upload video. Please check your Cloudinary configuration.');
  }
};

// ==================== VENDOR PROFILE ====================

/**
 * Get vendor profile
 */
export const getVendorProfile = async () => {
  try {
    console.log('👤 Fetching vendor profile...');
    const response = await apiClient.get('/vendor-profile/profile/me');
    console.log('✅ Vendor profile response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching vendor profile:', error);
    throw error;
  }
};

/**
 * Update vendor profile (with Cloudinary URLs)
 */
export const updateVendorProfile = async (profileData) => {
  try {
    console.log('✏️ Updating vendor profile:', profileData);
    const response = await apiClient.put('/vendor-profile/profile/update', profileData);
    console.log('✅ Update profile response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error updating vendor profile:', error);
    throw error;
  }
};

// ==================== VENDOR MEDIA (Portfolio) ====================

/**
 * Get vendor media (portfolio images/videos)
 */
export const getVendorMedia = async () => {
  try {
    console.log('🖼️ Fetching vendor media...');
    const response = await apiClient.get('/vendor-profile/media');
    console.log('✅ Vendor media response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching vendor media:', error);
    throw error;
  }
};

/**
 * Add media to vendor portfolio
 * @param {Object} mediaData - { url, publicId, type, caption, isFeatured, metadata }
 */
export const addVendorMedia = async (mediaData) => {
  try {
    console.log('➕ Adding vendor media:', mediaData);
    const response = await apiClient.post('/vendor-profile/media', mediaData);
    console.log('✅ Add media response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error adding vendor media:', error);
    throw error;
  }
};

/**
 * Delete media from vendor portfolio
 */
export const deleteVendorMedia = async (mediaId) => {
  try {
    console.log('🗑️ Deleting vendor media:', mediaId);
    const response = await apiClient.delete(`/vendor-profile/media/${mediaId}`);
    console.log('✅ Delete media response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error deleting vendor media:', error);
    throw error;
  }
};

/**
 * Update media details (caption, featured status, etc.)
 */
export const updateVendorMedia = async (mediaId, updates) => {
  try {
    console.log('✏️ Updating vendor media:', mediaId, updates);
    const response = await apiClient.put(`/vendor-profile/media/${mediaId}`, updates);
    console.log('✅ Update media response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error updating vendor media:', error);
    throw error;
  }
};

// ==================== VENDOR BLOGS ====================

/**
 * Get vendor's blogs
 */
export const getVendorBlogs = async () => {
  try {
    console.log('📝 Fetching vendor blogs...');
    const response = await apiClient.get('/vendor-profile/blogs');
    console.log('✅ Vendor blogs response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching vendor blogs:', error);
    throw error;
  }
};

/**
 * Create vendor blog (with Cloudinary cover image)
 */
export const createVendorBlog = async (blogData) => {
  try {
    console.log('➕ Creating vendor blog:', blogData);
    const response = await apiClient.post('/vendor-profile/blogs', blogData);
    console.log('✅ Create blog response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error creating vendor blog:', error);
    throw error;
  }
};

/**
 * Update vendor blog
 */
export const updateVendorBlog = async (blogId, blogData) => {
  try {
    console.log('✏️ Updating vendor blog:', blogId, blogData);
    const response = await apiClient.put(`/vendor-profile/blogs/${blogId}`, blogData);
    console.log('✅ Update blog response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error updating vendor blog:', error);
    throw error;
  }
};

/**
 * Delete vendor blog
 */
export const deleteVendorBlog = async (blogId) => {
  try {
    console.log('🗑️ Deleting vendor blog:', blogId);
    const response = await apiClient.delete(`/vendor-profile/blogs/${blogId}`);
    console.log('✅ Delete blog response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error deleting vendor blog:', error);
    throw error;
  }
};

// ==================== VENDOR REGISTRATION ====================

/**
 * Register new vendor (with Cloudinary images)
 */
export const registerVendor = async (vendorData) => {
  try {
    console.log('📝 Registering vendor:', vendorData);
    const response = await apiClient.post('/vendors/register', vendorData);
    console.log('✅ Vendor registration response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error registering vendor:', error);
    throw error;
  }
};

export default {
  uploadVendorImage,
  uploadVendorVideo,
  getVendorProfile,
  updateVendorProfile,
  getVendorMedia,
  addVendorMedia,
  deleteVendorMedia,
  updateVendorMedia,
  getVendorBlogs,
  createVendorBlog,
  updateVendorBlog,
  deleteVendorBlog,
  registerVendor
};
