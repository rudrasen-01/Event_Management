import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Blog Service
 * Handles all blog-related API calls (admin and public)
 */

// ==================== ADMIN BLOG APIs ====================

export const fetchAllBlogsAdmin = async (params = {}) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_BASE}/admin/blogs`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    throw error.response?.data || error;
  }
};

export const getBlogByIdAdmin = async (blogId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_BASE}/admin/blogs/${blogId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error.response?.data || error;
  }
};

export const createBlog = async (blogData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.post(`${API_BASE}/admin/blogs`, blogData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error.response?.data || error;
  }
};

export const updateBlog = async (blogId, blogData) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.put(`${API_BASE}/admin/blogs/${blogId}`, blogData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error.response?.data || error;
  }
};

export const deleteBlog = async (blogId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.delete(`${API_BASE}/admin/blogs/${blogId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error.response?.data || error;
  }
};

export const toggleBlogPublish = async (blogId) => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.patch(
      `${API_BASE}/admin/blogs/${blogId}/toggle-publish`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling blog status:', error);
    throw error.response?.data || error;
  }
};

export const getBlogStats = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_BASE}/admin/blogs/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    throw error.response?.data || error;
  }
};

// ==================== PUBLIC BLOG APIs ====================

export const fetchPublishedBlogs = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/blogs`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    throw error.response?.data || error;
  }
};

export const getBlogBySlug = async (slug) => {
  try {
    const response = await axios.get(`${API_BASE}/blogs/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    throw error.response?.data || error;
  }
};

export const getBlogCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE}/blogs/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    throw error.response?.data || error;
  }
};

export const getBlogTags = async () => {
  try {
    const response = await axios.get(`${API_BASE}/blogs/tags`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    throw error.response?.data || error;
  }
};

// ==================== CLOUDINARY IMAGE UPLOAD ====================

export const uploadBlogImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Use your Cloudinary upload preset
    formData.append('folder', 'blogs');

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'}/image/upload`;

    const response = await axios.post(cloudinaryUrl, formData);

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error.response?.data || error;
  }
};
