import apiClient from './api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Blog Service
 * Handles all blog-related API calls (admin and public)
 */

// ==================== ADMIN BLOG APIs ====================

export const fetchAllBlogsAdmin = async (params = {}) => {
  try {
    console.log('📝 Fetching all blogs with params:', params);
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/blogs?${queryString}`);
    console.log('✅ Blogs response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching admin blogs:', error);
    throw error;
  }
};

export const getBlogByIdAdmin = async (blogId) => {
  try {
    console.log('📝 Fetching blog by ID:', blogId);
    const response = await apiClient.get(`/admin/blogs/${blogId}`);
    console.log('✅ Blog response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching blog:', error);
    throw error;
  }
};

export const createBlog = async (blogData) => {
  try {
    console.log('✏️ Creating blog:', blogData);
    const response = await apiClient.post('/admin/blogs', blogData);
    console.log('✅ Create blog response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error creating blog:', error);
    throw error;
  }
};

export const updateBlog = async (blogId, blogData) => {
  try {
    console.log('✏️ Updating blog:', blogId, blogData);
    const response = await apiClient.put(`/admin/blogs/${blogId}`, blogData);
    console.log('✅ Update blog response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error updating blog:', error);
    throw error;
  }
};

export const deleteBlog = async (blogId) => {
  try {
    console.log('🗑️ Deleting blog:', blogId);
    const response = await apiClient.delete(`/admin/blogs/${blogId}`);
    console.log('✅ Delete blog response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error deleting blog:', error);
    throw error;
  }
};

export const toggleBlogPublish = async (blogId) => {
  try {
    console.log('✏️ Toggling blog publish status:', blogId);
    const response = await apiClient.patch(`/admin/blogs/${blogId}/toggle-publish`, {});
    console.log('✅ Toggle publish response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error toggling blog status:', error);
    throw error;
  }
};

export const getBlogStats = async () => {
  try {
    console.log('📊 Fetching blog stats...');
    const response = await apiClient.get('/admin/blogs/stats');
    console.log('✅ Blog stats response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching blog stats:', error);
    throw error;
  }
};

// ==================== PUBLIC BLOG APIs ====================

export const fetchPublishedBlogs = async (params = {}) => {
  try {
    console.log('📰 Fetching published blogs...');
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/blogs?${queryString}`);
    console.log('✅ Published blogs response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching published blogs:', error);
    throw error;
  }
};

export const getBlogBySlug = async (slug) => {
  try {
    console.log('📰 Fetching blog by slug:', slug);
    const response = await apiClient.get(`/blogs/${slug}`);
    console.log('✅ Blog response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching blog by slug:', error);
    throw error;
  }
};

export const getBlogCategories = async () => {
  try {
    console.log('📂 Fetching blog categories...');
    const response = await apiClient.get('/blogs/categories');
    console.log('✅ Categories response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching blog categories:', error);
    throw error;
  }
};

export const getBlogTags = async () => {
  try {
    console.log('🏷️ Fetching blog tags...');
    const response = await apiClient.get('/blogs/tags');
    console.log('✅ Tags response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching blog tags:', error);
    throw error;
  }
};

// ==================== CLOUDINARY IMAGE UPLOAD ====================

export const uploadBlogImage = async (file) => {
  try {
    console.log('📤 Uploading blog image...');
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    
    if (!cloudName || cloudName === 'your-cloud-name') {
      throw new Error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME in .env file.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'blogs');

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // Import axios only for Cloudinary upload (external service)
    const axios = (await import('axios')).default;
    const response = await axios.post(cloudinaryUrl, formData);

    console.log('✅ Image uploaded:', response.data.secure_url);
    return {
      url: response.data.secure_url,
      publicId: response.data.public_id
    };
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image. Please check your Cloudinary configuration.');
  }
};
