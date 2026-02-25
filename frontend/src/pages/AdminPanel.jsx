/**
 * Production Admin Panel - Professional Dashboard with Complete Admin Control
 * 
 * INQUIRY WORKFLOW (Fully Controlled):
 * 1. Pending → Admin reviews and changes status via dropdown (requires confirmation)
 * 2. Approved → Admin can explicitly FORWARD to vendors (requires vendor selection)
 * 3. Active/Inactive → Admin controls visibility to vendors (requires confirmation)
 * 4. Rejected → No further actions possible (requires rejection reason)
 * 
 * VENDOR MANAGEMENT (All Actions Require Confirmation):
 * - Verify/Unverify: Controls trusted vendor status
 * - Activate/Deactivate: Controls vendor visibility to users
 * - Delete: Permanent removal (requires typing "DELETE")
 * 
 * USER MANAGEMENT (All Actions Require Confirmation):
 * - Block/Unblock: Controls user access to platform
 * 
 * KEY PRINCIPLES:
 * ✅ Every critical action requires explicit admin confirmation
 * ✅ No automatic forwarding or state changes
 * ✅ Clear messaging about consequences of each action
 * ✅ Professional notifications with context
 * ✅ Real-time data sync with backend
 * ✅ Production-grade error handling
 * 
 * Features: Forward Inquiry, Toggle Active, Dynamic Approval Status, Real-time Sync
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users, Mail, TrendingUp, Calendar, CheckCircle, XCircle,
  UserCheck, UserX, Filter, Search, Eye, Edit, Trash2,
  Plus, RefreshCw, MapPin, DollarSign, Phone, Award,
  AlertCircle, BarChart3, PieChart, Shield, EyeOff,
  Clock, Ban, X, Check, Building2, FileText, Upload, Image, Star
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  fetchAdminStats,
  fetchRecentActivity,
  fetchAllUsers,
  updateUserStatus,
  fetchAllVendorsAdmin,
  fetchVendorById,
  fetchVendorByIdAdmin,
  toggleVendorVerification,
  toggleVendorStatus,
  deleteVendorPermanent,
  fetchAllInquiriesAdmin,
  approveInquiry,
  rejectInquiry,
  fetchInquiryApprovalStats,
  forwardInquiry,
  toggleInquiryActive,
  fetchAllReviewsAdmin,
  fetchReviewStats,
  fetchPendingReviews,
  approveReviewAdmin,
  rejectReviewAdmin,
  deleteReviewAdmin,
  fetchAllMediaAdmin,
  fetchMediaStats,
  fetchPendingMedia,
  approveMediaAdmin,
  rejectMediaAdmin,
  deleteMediaAdmin,
  fetchAllBlogsAdmin as fetchAllVendorBlogsAdmin,
  fetchBlogStats,
  fetchPendingBlogs,
  approveBlogAdmin,
  rejectBlogAdmin,
  deleteBlogAdmin
} from '../services/api';
import {
  fetchAllBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogPublish,
  getBlogStats,
  uploadBlogImage
} from '../services/blogService';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout, loading: authLoading } = useAuth();

  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  
  // Data States
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [blogStats, setBlogStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('all'); // all, pending, approved, rejected
  const [media, setMedia] = useState([]);
  const [mediaStats, setMediaStats] = useState(null);
  const [mediaFilter, setMediaFilter] = useState('all'); // all, pending, approved, rejected
  const [vendorBlogs, setVendorBlogs] = useState([]);
  const [vendorBlogStats, setVendorBlogStats] = useState(null);
  const [vendorBlogFilter, setVendorBlogFilter] = useState('all'); // all, pending, approved, rejected
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [inquiryFilter, setInquiryFilter] = useState('all'); // all, vendor, contact
  const [approvalFilter, setApprovalFilter] = useState('all'); // all, pending, approved, rejected
  const [blogStatusFilter, setBlogStatusFilter] = useState('all'); // all, published, draft
  const [notification, setNotification] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Dialog States
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning',
    requireInput: false
  });

  // Notification Helper
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Verify admin access
  useEffect(() => {
    console.log('🔐 Admin Panel - Verifying access...');
    console.log('User:', user);
    console.log('Is Admin:', isAdmin());
    
    // Check localStorage token
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    console.log('📦 LocalStorage check:', {
      hasToken: !!storedToken,
      hasUser: !!storedUser,
      tokenPreview: storedToken ? storedToken.substring(0, 30) + '...' : 'none'
    });
    
    if (!user || !isAdmin()) {
      console.error('❌ Access denied - not an admin');
      showNotification('error', 'Access denied. Admin privileges required.');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
      return;
    }
    
    console.log('✅ Admin access verified for:', user.email);
  }, [user, isAdmin]);

  // Load Data on Mount & Auto-refresh
  useEffect(() => {
    // Wait for auth to finish loading before making API calls
    if (authLoading) {
      console.log('⏳ Waiting for auth to load...');
      return;
    }
    
    // Only load data if user is admin
    if (user && isAdmin()) {
      console.log('📊 Initial data load (auth ready)...');
      loadDashboardData();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        if (user && isAdmin()) {
          console.log('🔄 Auto-refreshing dashboard...');
          loadDashboardData();
        }
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    // Wait for auth to finish loading before making API calls
    if (authLoading) return;
    
    if (user && isAdmin()) {
      if (activeTab === 'vendors') loadVendors();
      else if (activeTab === 'users') loadUsers();
      else if (activeTab === 'inquiries') loadInquiries();
      else if (activeTab === 'blogs') loadBlogs();
      else if (activeTab === 'reviews') loadReviews();
      else if (activeTab === 'media') loadMedia();
      else if (activeTab === 'vendor-blogs') loadVendorBlogs();
    }
  }, [activeTab, user, isAdmin, authLoading]);

  // Data Loading Functions
  const loadDashboardData = async (showSuccessNotification = false) => {
    setLoading(true);
    try {
      console.log('🔄 Loading dashboard data...');
      const [statsData, activityData] = await Promise.all([
        fetchAdminStats(),
        fetchRecentActivity(10)
      ]);
      console.log('✅ Stats data received:', statsData);
      console.log('✅ Activity data received:', activityData);
      
      // Data is already extracted from response.data in API service
      setStats(statsData || {});
      setRecentActivity(activityData || {});
      
      if (showSuccessNotification) {
        showNotification('success', 'Dashboard data loaded successfully');
      }
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      showNotification('error', 'Failed to load dashboard data: ' + error.message);
      // Set empty defaults to prevent UI crashes
      setStats({});
      setRecentActivity({});
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async (showSuccessNotification = false) => {
    setLoading(true);
    try {
      console.log('🔄 Loading vendors...');
      const response = await fetchAllVendorsAdmin({ page: 1, limit: 100 });
      console.log('✅ Vendors data received:', response);
      
      // Response is already extracted: { vendors: [], total, page, totalPages }
      const vendorsList = response?.vendors || [];
      
      setVendors(vendorsList);
      
      if (showSuccessNotification) {
        if (vendorsList.length === 0) {
          showNotification('info', 'No vendors found in database');
        } else {
          showNotification('success', `Loaded ${vendorsList.length} vendors successfully`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading vendors:', error);
      showNotification('error', 'Failed to load vendors: ' + error.message);
      setVendors([]); // Set empty array to prevent UI crashes
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (showSuccessNotification = false) => {
    setLoading(true);
    try {
      console.log('🔄 Loading users...');
      const data = await fetchAllUsers({ page: 1, limit: 100 });
      console.log('✅ Users data received:', data);
      
      // Data is already extracted: { users: [], total, page, totalPages }
      const usersList = data?.users || [];
      setUsers(usersList);
      
      if (showSuccessNotification) {
        showNotification('success', `Loaded ${usersList.length} users successfully`);
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      showNotification('error', 'Failed to load users: ' + error.message);
      setUsers([]); // Set empty array to prevent UI crashes
    } finally {
      setLoading(false);
    }
  };

  const loadInquiries = async (showSuccessNotification = false) => {
    setLoading(true);
    try {
      console.log('🔄 Loading inquiries...');
      const data = await fetchAllInquiriesAdmin({ page: 1, limit: 200 });
      console.log('✅ Inquiries data received:', data);
      
      // Data is already extracted: { inquiries: [...], total, page, totalPages }
      const inquiriesList = data?.inquiries || [];
      setInquiries(inquiriesList);
      
      if (showSuccessNotification) {
        showNotification('success', `Loaded ${inquiriesList.length} inquiries successfully`);
      }
    } catch (error) {
      console.error('❌ Error loading inquiries:', error);
      showNotification('error', 'Failed to load inquiries: ' + error.message);
      setInquiries([]); // Set empty array to prevent UI crashes
    } finally {
      setLoading(false);
    }
  };

  const loadBlogs = async (showSuccessNotification = false) => {
    setLoading(true);
    try {
      console.log('🔄 Loading blogs...');
      const [blogsData, statsData] = await Promise.all([
        fetchAllBlogsAdmin({ page: 1, limit: 100 }),
        getBlogStats()
      ]);
      console.log('✅ Blogs data received:', blogsData);
      console.log('✅ Blog stats received:', statsData);
      
      // Backend returns { success: true, data: [...blogs], pagination: {...} }
      // apiClient returns response.data, so blogsData.data is the blogs array
      const blogsList = blogsData?.data || [];
      setBlogs(blogsList);
      
      console.log('📊 Loaded blogs count:', blogsList.length);
      console.log('📋 Blogs list:', blogsList);
      
      // Extract stats from response
      const stats = statsData?.data || statsData || {};
      setBlogStats(stats);
      
      if (showSuccessNotification) {
        if (blogsList.length === 0) {
          showNotification('info', 'No blogs found. Create your first blog post!');
        } else {
          showNotification('success', `Loaded ${blogsList.length} blogs successfully`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading blogs:', error);
      showNotification('error', 'Failed to load blogs: ' + error.message);
      setBlogs([]); // Set empty array to prevent UI crashes
      setBlogStats({}); // Set empty object to prevent UI crashes
    } finally {
      setLoading(false);
    }
  };

  // Load Reviews
  const loadReviews = async (showSuccessNotification = false) => {
    setLoading(true);
    try {
      console.log('🔄 Loading reviews...');
      
      // Fetch reviews and stats in parallel
      const [reviewsData, statsData] = await Promise.all([
        fetchAllReviewsAdmin({ 
          status: reviewFilter,
          page: 1, 
          limit: 100 
        }),
        fetchReviewStats()
      ]);
      
      console.log('✅ Reviews data received:', reviewsData);
      console.log('✅ Review stats received:', statsData);
      
      const reviewsList = reviewsData?.data?.reviews || [];
      setReviews(reviewsList);
      
      const stats = statsData?.data || {};
      setReviewStats(stats);
      
      console.log('📊 Loaded reviews count:', reviewsList.length);
      
      if (showSuccessNotification) {
        if (reviewsList.length === 0) {
          showNotification('info', 'No reviews found');
        } else {
          showNotification('success', `Loaded ${reviewsList.length} reviews successfully`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading reviews:', error);
      showNotification('error', 'Failed to load reviews: ' + error.message);
      setReviews([]);
      setReviewStats({});
    } finally {
      setLoading(false);
    }
  };

  // Approve Review
  const handleApproveReview = async (reviewId) => {
    try {
      await approveReviewAdmin(reviewId);
      showNotification('success', 'Review approved successfully');
      loadReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      showNotification('error', 'Failed to approve review: ' + error.message);
    }
  };

  // Reject Review
  const handleRejectReview = async (reviewId, reason) => {
    try {
      await rejectReviewAdmin(reviewId, reason);
      showNotification('success', 'Review rejected successfully');
      loadReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      showNotification('error', 'Failed to reject review: ' + error.message);
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Review',
      message: 'Are you sure you want to permanently delete this review? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteReviewAdmin(reviewId);
          showNotification('success', 'Review deleted successfully');
          loadReviews();
        } catch (error) {
          console.error('Error deleting review:', error);
          showNotification('error', 'Failed to delete review: ' + error.message);
        }
      }
    });
  };

  // ========== MEDIA MANAGEMENT ==========

  // Load Media
  const loadMedia = async (showSuccessNotification = false) => {
    try {
      setLoading(true);
      console.log('🔄 Loading media...');

      // Fetch media and stats in parallel
      const [mediaData, statsData] = await Promise.all([
        fetchAllMediaAdmin({ 
          approvalStatus: mediaFilter === 'all' ? undefined : mediaFilter,
          page: 1, 
          limit: 100 
        }),
        fetchMediaStats()
      ]);
      
      console.log('✅ Media data received:', mediaData);
      console.log('✅ Media stats received:', statsData);
      
      const mediaList = mediaData?.data?.media || [];
      setMedia(mediaList);
      
      const stats = statsData?.data || {};
      setMediaStats(stats);
      
      console.log('📊 Loaded media count:', mediaList.length);
      
      if (showSuccessNotification) {
        if (mediaList.length === 0) {
          showNotification('info', 'No media found');
        } else {
          showNotification('success', `Loaded ${mediaList.length} media items successfully`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading media:', error);
      showNotification('error', 'Failed to load media: ' + error.message);
      setMedia([]);
      setMediaStats({});
    } finally {
      setLoading(false);
    }
  };

  // Approve Media
  const handleApproveMedia = async (mediaId) => {
    try {
      await approveMediaAdmin(mediaId);
      showNotification('success', 'Media approved successfully');
      loadMedia();
    } catch (error) {
      console.error('Error approving media:', error);
      showNotification('error', 'Failed to approve media: ' + error.message);
    }
  };

  // Reject Media
  const handleRejectMedia = async (mediaId, reason) => {
    try {
      await rejectMediaAdmin(mediaId, reason);
      showNotification('success', 'Media rejected successfully');
      loadMedia();
    } catch (error) {
      console.error('Error rejecting media:', error);
      showNotification('error', 'Failed to reject media: ' + error.message);
    }
  };

  // Delete Media
  const handleDeleteMedia = async (mediaId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Media',
      message: 'Are you sure you want to permanently delete this media? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteMediaAdmin(mediaId);
          showNotification('success', 'Media deleted successfully');
          loadMedia();
        } catch (error) {
          console.error('Error deleting media:', error);
          showNotification('error', 'Failed to delete media: ' + error.message);
        }
      }
    });
  };

  // ========== VENDOR BLOG MANAGEMENT ==========

  // Load Vendor Blogs
  const loadVendorBlogs = async (showSuccessNotification = false) => {
    try {
      setLoading(true);
      console.log('🔄 Loading vendor blogs...');

      // Fetch blogs and stats in parallel
      const [blogsData, statsData] = await Promise.all([
        fetchAllVendorBlogsAdmin({ 
          approvalStatus: vendorBlogFilter === 'all' ? undefined : vendorBlogFilter,
          page: 1, 
          limit: 100 
        }),
        fetchBlogStats()
      ]);
      
      console.log('✅ Vendor blogs data received:', blogsData);
      console.log('✅ Vendor blog stats received:', statsData);
      
      const blogList = blogsData?.data?.blogs || [];
      setVendorBlogs(blogList);
      
      const stats = statsData?.data || {};
      setVendorBlogStats(stats);
      
      console.log('📊 Loaded vendor blogs count:', blogList.length);
      
      if (showSuccessNotification) {
        if (blogList.length === 0) {
          showNotification('info', 'No vendor blogs found');
        } else {
          showNotification('success', `Loaded ${blogList.length} vendor blogs successfully`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading vendor blogs:', error);
      showNotification('error', 'Failed to load vendor blogs: ' + error.message);
      setVendorBlogs([]);
      setVendorBlogStats({});
    } finally {
      setLoading(false);
    }
  };

  // Approve Vendor Blog
  const handleApproveVendorBlog = async (blogId) => {
    try {
      await approveBlogAdmin(blogId);
      showNotification('success', 'Blog approved successfully');
      loadVendorBlogs();
    } catch (error) {
      console.error('Error approving blog:', error);
      showNotification('error', 'Failed to approve blog: ' + error.message);
    }
  };

  // Reject Vendor Blog
  const handleRejectVendorBlog = async (blogId, reason) => {
    try {
      await rejectBlogAdmin(blogId, reason);
      showNotification('success', 'Blog rejected successfully');
      loadVendorBlogs();
    } catch (error) {
      console.error('Error rejecting blog:', error);
      showNotification('error', 'Failed to reject blog: ' + error.message);
    }
  };

  // Delete Vendor Blog
  const handleDeleteVendorBlog = async (blogId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Blog',
      message: 'Are you sure you want to permanently delete this blog? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteBlogAdmin(blogId);
          showNotification('success', 'Blog deleted successfully');
          loadVendorBlogs();
        } catch (error) {
          console.error('Error deleting blog:', error);
          showNotification('error', 'Failed to delete blog: ' + error.message);
        }
      }
    });
  };

  // Refresh Current View
  const handleRefresh = () => {
    if (activeTab === 'overview') loadDashboardData(true);
    else if (activeTab === 'vendors') loadVendors(true);
    else if (activeTab === 'users') loadUsers(true);
    else if (activeTab === 'inquiries') loadInquiries(true);
    else if (activeTab === 'blogs') loadBlogs(true);
    else if (activeTab === 'reviews') loadReviews(true);
    else if (activeTab === 'media') loadMedia(true);
    else if (activeTab === 'vendor-blogs') loadVendorBlogs(true);
  };

  // ========== INQUIRY ACTIONS ==========
  
  const handleApproveInquiry = (inquiry) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Approve Inquiry',
      message: `Approve inquiry from ${inquiry.userName}? Vendor will see this.`,
      type: 'success',
      requireInput: false,
      onConfirm: async () => {
        try {
          await approveInquiry(inquiry._id);
          showNotification('success', 'Inquiry approved!');
          loadDashboardData();
          loadInquiries();
        } catch (error) {
          showNotification('error', 'Failed to approve inquiry');
        }
      }
    });
  };

  const handleRejectInquiry = (inquiry) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Inquiry',
      message: `Reject inquiry from ${inquiry.userName}? Provide reason:`,
      type: 'danger',
      requireInput: true,
      inputPlaceholder: 'Enter rejection reason...',
      onConfirm: async (reason) => {
        try {
          await rejectInquiry(inquiry._id, reason);
          showNotification('success', 'Inquiry rejected');
          loadDashboardData();
          loadInquiries();
        } catch (error) {
          showNotification('error', 'Failed to reject inquiry');
        }
      }
    });
  };

  // Dynamic Approval Status Change - With Confirmation
  const handleApprovalStatusChange = async (inquiry, newStatus) => {
    if (newStatus === inquiry.approvalStatus) return;
    
    // Show confirmation dialog before changing status
    setConfirmDialog({
      isOpen: true,
      title: `Change Status to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      message: `Are you sure you want to ${newStatus} this inquiry from ${inquiry.userName}?`,
      type: newStatus === 'approved' ? 'success' : newStatus === 'rejected' ? 'danger' : 'warning',
      requireInput: newStatus === 'rejected',
      inputPlaceholder: newStatus === 'rejected' ? 'Enter rejection reason (required)...' : '',
      onConfirm: async (inputValue) => {
        try {
          if (newStatus === 'approved') {
            await approveInquiry(inquiry._id);
            showNotification('success', '✅ Inquiry approved successfully! You can now forward it to vendors.');
          } else if (newStatus === 'rejected') {
            if (!inputValue || inputValue.trim().length === 0) {
              showNotification('error', 'Rejection reason is required');
              return;
            }
            await rejectInquiry(inquiry._id, inputValue);
            showNotification('success', '❌ Inquiry rejected');
          }
          loadDashboardData();
          loadInquiries();
        } catch (error) {
          showNotification('error', `Failed to ${newStatus} inquiry: ${error.message}`);
        }
      }
    });
  };

  // Handle Forward Inquiry - Explicit Admin Action Only
  const handleForwardInquiry = async (inquiry) => {
    // Verify inquiry is approved before forwarding
    if (inquiry.approvalStatus !== 'approved') {
      showNotification('error', '❌ Only approved inquiries can be forwarded');
      return;
    }

    // If inquiry already has a vendor, forward directly to that vendor
    if (inquiry.vendorId && (inquiry.vendorId._id || inquiry.vendorId)) {
      const targetVendorId = inquiry.vendorId._id || inquiry.vendorId;
      const vendorName = inquiry.vendorId.businessName || inquiry.vendorId.name || 'vendor';
      
      setConfirmDialog({
        isOpen: true,
        title: '📤 Forward Inquiry to Vendor',
        message: `Forward this inquiry from ${inquiry.userName} to ${vendorName}?\n\nThis will make the inquiry visible to the vendor in their dashboard.`,
        type: 'info',
        onConfirm: async () => {
          try {
            await forwardInquiry(inquiry._id, targetVendorId, 'Inquiry forwarded by admin');
            showNotification('success', `✅ Inquiry forwarded successfully to ${vendorName}!`);
            loadInquiries();
            loadDashboardData();
          } catch (error) {
            showNotification('error', `Failed to forward inquiry: ${error.message}`);
          }
        }
      });
      return;
    }

    // If no vendor specified, show vendor selection dialog
    try {
      const vendorsData = await fetchAllVendorsAdmin({ limit: 1000 });
      const availableVendors = vendorsData.data.vendors.filter(v => 
        v.isActive && 
        v.verified
      );

      if (availableVendors.length === 0) {
        showNotification('error', 'No active verified vendors available for forwarding');
        return;
      }

      setConfirmDialog({
        isOpen: true,
        title: '📤 Forward Inquiry to Vendor',
        message: `Select a verified vendor to forward this inquiry from ${inquiry.userName}:`,
        type: 'info',
        requireInput: true,
        inputType: 'select',
        selectOptions: availableVendors.map(v => ({
          value: v._id,
          label: `${v.businessName || v.name} • ${v.serviceType} • ${v.city || 'N/A'} ${v.verified ? '✓' : ''}`
        })),
        inputPlaceholder: 'Optional: Add forwarding notes...',
        onConfirm: async (data) => {
          const { selectValue: newVendorId, inputValue: notes } = data;
          
          if (!newVendorId) {
            showNotification('error', 'Please select a vendor to forward to');
            return;
          }

          try {
            await forwardInquiry(inquiry._id, newVendorId, notes || 'Forwarded by admin');
            showNotification('success', '✅ Inquiry forwarded successfully to vendor!');
            loadInquiries();
            loadDashboardData();
          } catch (error) {
            showNotification('error', `Failed to forward inquiry: ${error.message}`);
          }
        }
      });
    } catch (error) {
      showNotification('error', 'Failed to load vendors for forwarding');
    }
  };

  const handleToggleInquiryActive = (inquiry) => {
    const willDeactivate = inquiry.isActive !== false;
    setConfirmDialog({
      isOpen: true,
      title: willDeactivate ? '🔒 Deactivate Inquiry' : '✅ Activate Inquiry',
      message: `Are you sure you want to ${willDeactivate ? 'deactivate' : 'activate'} this inquiry from ${inquiry.userName}? ${willDeactivate ? 'Vendors will not be able to see this inquiry.' : 'This inquiry will become visible to vendors again.'}`,
      type: 'warning',
      requireInput: false,
      onConfirm: async () => {
        try {
          await toggleInquiryActive(inquiry._id, !willDeactivate);
          showNotification('success', `✅ Inquiry ${!willDeactivate ? 'activated' : 'deactivated'} successfully`);
          loadInquiries();
        } catch (error) {
          showNotification('error', `Failed to update inquiry status: ${error.message}`);
        }
      }
    });
  };

  // ========== VENDOR ACTIONS ==========
  
  const handleToggleVendorVerification = (vendor) => {
    const willVerify = !vendor.verified;
    setConfirmDialog({
      isOpen: true,
      title: willVerify ? '✅ Verify Vendor' : '❌ Remove Verification',
      message: `Are you sure you want to ${willVerify ? 'verify' : 'remove verification from'} ${vendor.businessName || vendor.name}? ${willVerify ? 'This vendor will be marked as trusted.' : 'This vendor will lose verified status.'}`,
      type: willVerify ? 'success' : 'warning',
      requireInput: false,
      onConfirm: async () => {
        try {
          await toggleVendorVerification(vendor._id, willVerify);
          showNotification('success', `✅ Vendor ${willVerify ? 'verified' : 'unverified'} successfully`);
          loadVendors();
        } catch (error) {
          showNotification('error', `Failed to update vendor: ${error.message}`);
        }
      }
    });
  };

  const handleToggleVendorStatus = (vendor) => {
    const willActivate = !vendor.isActive;
    setConfirmDialog({
      isOpen: true,
      title: willActivate ? '✅ Activate Vendor' : '🔒 Deactivate Vendor',
      message: `Are you sure you want to ${willActivate ? 'activate' : 'deactivate'} ${vendor.businessName || vendor.name}? ${willActivate ? 'This vendor will become visible to users.' : 'This vendor will be hidden from users and search results.'}`,
      type: 'warning',
      requireInput: false,
      onConfirm: async () => {
        try {
          await toggleVendorStatus(vendor._id, willActivate);
          showNotification('success', `✅ Vendor ${willActivate ? 'activated' : 'deactivated'} successfully`);
          loadVendors();
        } catch (error) {
          showNotification('error', `Failed to update vendor: ${error.message}`);
        }
      }
    });
  };

  const handleDeleteVendor = (vendor) => {
    setConfirmDialog({
      isOpen: true,
      title: '⚠️ Delete Vendor Permanently',
      message: `Are you ABSOLUTELY SURE you want to permanently delete ${vendor.businessName || vendor.name}? This action CANNOT be undone and will remove all vendor data including inquiries and bookings!`,
      type: 'danger',
      requireInput: true,
      inputPlaceholder: `Type "DELETE" to confirm permanent deletion...`,
      onConfirm: async (confirmText) => {
        if (confirmText?.toUpperCase() !== 'DELETE') {
          showNotification('error', 'You must type DELETE to confirm');
          return;
        }
        try {
          await deleteVendorPermanent(vendor._id);
          showNotification('success', '✅ Vendor deleted permanently');
          loadVendors();
          loadDashboardData();
        } catch (error) {
          showNotification('error', `Failed to delete vendor: ${error.message}`);
        }
      }
    });
  };

  // ========== USER ACTIONS ==========
  
  const handleToggleUserStatus = (user) => {
    const willBlock = user.isActive;
    setConfirmDialog({
      isOpen: true,
      title: willBlock ? '🔒 Block User' : '✅ Unblock User',
      message: `Are you sure you want to ${willBlock ? 'block' : 'unblock'} ${user.name || user.email}? ${willBlock ? 'This user will not be able to login or access the platform.' : 'This user will regain access to the platform.'}`,
      type: 'warning',
      requireInput: willBlock,
      inputPlaceholder: willBlock ? 'Optional: Reason for blocking...' : '',
      onConfirm: async (reason) => {
        try {
          await updateUserStatus(user._id, !user.isActive);
          showNotification('success', `✅ User ${willBlock ? 'blocked' : 'unblocked'} successfully`);
          loadUsers();
        } catch (error) {
          showNotification('error', `Failed to update user: ${error.message}`);
        }
      }
    });
  };

  // ========== BLOG ACTIONS ==========

  const handleCreateBlog = () => {
    setEditingBlog(null);
    setShowBlogModal(true);
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setShowBlogModal(true);
  };

  const handleSaveBlog = async (blogData) => {
    try {
      if (editingBlog) {
        await updateBlog(editingBlog._id, blogData);
        showNotification('success', 'Blog updated successfully');
      } else {
        await createBlog(blogData);
        showNotification('success', 'Blog created successfully');
      }
      setShowBlogModal(false);
      setEditingBlog(null);
      loadBlogs();
    } catch (error) {
      showNotification('error', `Failed to save blog: ${error.message}`);
    }
  };

  const handleDeleteBlog = (blog) => {
    setConfirmDialog({
      isOpen: true,
      title: '⚠️ Delete Blog',
      message: `Are you sure you want to delete "${blog.title}"? This action cannot be undone.`,
      type: 'danger',
      requireInput: false,
      onConfirm: async () => {
        try {
          await deleteBlog(blog._id);
          showNotification('success', 'Blog deleted successfully');
          loadBlogs();
        } catch (error) {
          showNotification('error', `Failed to delete blog: ${error.message}`);
        }
      }
    });
  };

  const handleToggleBlogStatus = async (blog) => {
    try {
      await toggleBlogPublish(blog._id);
      showNotification('success', `Blog ${blog.status === 'published' ? 'unpublished' : 'published'} successfully`);
      loadBlogs();
    } catch (error) {
      showNotification('error', `Failed to update blog status: ${error.message}`);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      const result = await uploadBlogImage(file);
      // result is {url, publicId}
      return result;
    } catch (error) {
      showNotification('error', 'Failed to upload image');
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Banner with Gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h2>
          <p className="text-blue-100 text-lg">Here's what's happening with your platform today</p>
        </div>
      </div>

      {/* Stats Cards with Gradients and Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Vendors</p>
              <p className="text-4xl font-bold mt-2">{stats?.overview?.totalVendors || 0}</p>
              <p className="text-blue-200 text-xs mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Active businesses
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <Building2 className="w-10 h-10" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Users</p>
              <p className="text-4xl font-bold mt-2">{stats?.overview?.totalUsers || 0}</p>
              <p className="text-green-200 text-xs mt-2 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                Registered accounts
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <Users className="w-10 h-10" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Inquiries</p>
              <p className="text-4xl font-bold mt-2">{stats?.overview?.totalInquiries || 0}</p>
              <p className="text-purple-200 text-xs mt-2 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Customer requests
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <Mail className="w-10 h-10" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Pending Approval</p>
              <p className="text-4xl font-bold mt-2">{stats?.overview?.pendingApproval || 0}</p>
              <p className="text-orange-200 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Need attention
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <Clock className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Verified Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.overview?.verifiedVendors || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.overview?.activeVendors || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Approval Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overview?.totalInquiries > 0 
                  ? Math.round(((stats?.overview?.totalInquiries - stats?.overview?.pendingApproval) / stats?.overview?.totalInquiries) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Quick Actions & Overview</h3>
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Action
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">View All Inquiries</p>
                <p className="text-sm text-gray-600">{stats?.overview?.totalInquiries || 0} total</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Manage Vendors</p>
                <p className="text-sm text-gray-600">{stats?.overview?.totalVendors || 0} registered</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">View All Users</p>
                <p className="text-sm text-gray-600">{stats?.overview?.totalUsers || 0} accounts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Inquiries Tab
  const renderInquiries = () => {
    const filteredInquiries = inquiries.filter(inquiry => {
      const matchesType = inquiryFilter === 'all' || 
        (inquiryFilter === 'vendor' && inquiry.inquiryType === 'vendor_inquiry') ||
        (inquiryFilter === 'contact' && inquiry.inquiryType === 'contact_inquiry');
      
      const matchesApproval = approvalFilter === 'all' || inquiry.approvalStatus === approvalFilter;
      
      const matchesSearch = searchTerm === '' || 
        inquiry.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.userContact?.includes(searchTerm);
      
      return matchesType && matchesApproval && matchesSearch;
    });

    return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">📧 Inquiry Management</h2>
              <p className="text-white text-opacity-90">Manage and process customer inquiries</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{filteredInquiries.length}</p>
                <p className="text-sm text-white text-opacity-90">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters with Modern Design */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, contact, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <select
              value={inquiryFilter}
              onChange={(e) => setInquiryFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
            >
              <option value="all">📋 All Types</option>
              <option value="vendor">🏢 Vendor Inquiries</option>
              <option value="contact">📞 Contact Form</option>
            </select>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
            >
              <option value="all">🔄 All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
        </div>

        {/* Inquiries Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredInquiries.length > 0 ? (
            filteredInquiries.map((inquiry) => (
              <div key={inquiry._id} className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className={`h-2 ${
                inquiry.approvalStatus === 'approved' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                inquiry.approvalStatus === 'rejected' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                'bg-gradient-to-r from-yellow-400 to-orange-500'
              }`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      inquiry.inquiryType === 'vendor_inquiry' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <Mail className={`w-6 h-6 ${
                        inquiry.inquiryType === 'vendor_inquiry' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{inquiry.userName}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />{inquiry.userContact} • {inquiry.userEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {/* Dynamic Status Dropdown */}
                    <select
                      value={inquiry.approvalStatus || 'pending'}
                      onChange={(e) => handleApprovalStatusChange(inquiry, e.target.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border-2 cursor-pointer transition-all ${
                        inquiry.approvalStatus === 'approved' 
                          ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100' 
                          : inquiry.approvalStatus === 'rejected'
                          ? 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100'
                          : 'bg-yellow-50 border-yellow-500 text-yellow-700 hover:bg-yellow-100'
                      }`}
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="approved">✓ Approved</option>
                      <option value="rejected">✗ Rejected</option>
                    </select>
                    <span className={`px-3 py-2 rounded-xl text-sm font-bold ${
                      inquiry.inquiryType === 'vendor_inquiry' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {inquiry.inquiryType === 'vendor_inquiry' ? '🏢 Vendor' : '📞 Contact'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
                    <p className="text-xs text-blue-600 font-medium mb-1">Event Type</p>
                    <p className="font-bold text-gray-900">{inquiry.eventType}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
                    <p className="text-xs text-green-600 font-medium mb-1">Budget</p>
                    <p className="font-bold text-gray-900">₹{inquiry.budget}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
                    <p className="text-xs text-purple-600 font-medium mb-1">City</p>
                    <p className="font-bold text-gray-900">{inquiry.city || 'N/A'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl">
                    <p className="text-xs text-orange-600 font-medium mb-1">Date</p>
                    <p className="font-bold text-gray-900">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-3 rounded-xl">
                    <p className="text-xs text-pink-600 font-medium mb-1">Vendor</p>
                    <p className="font-bold text-gray-900 truncate">
                      {inquiry.vendorId ? (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const vendorObj = inquiry.vendorId && (inquiry.vendorId._id || inquiry.vendorId.businessName) ? inquiry.vendorId : null;
                              if (vendorObj && vendorObj.businessName) {
                                setSelectedItem(vendorObj);
                                return;
                              }

                              const vendorId = inquiry.vendorId._id || inquiry.vendorId;
                              if (!vendorId) {
                                showNotification('info', 'No vendor details available');
                                return;
                              }

                              const data = await fetchVendorByIdAdmin(vendorId);
                              if (data) setSelectedItem(data);
                              else showNotification('error', 'Vendor not found');
                            } catch (err) {
                              console.error('Failed to load vendor:', err);
                              showNotification('error', 'Failed to load vendor details');
                            }
                          }}
                          className="text-left underline hover:text-indigo-600"
                        >
                          {inquiry.vendorId?.businessName || inquiry.vendorId?.name || String(inquiry.vendorId)}
                        </button>
                      ) : 'General'}
                    </p>
                  </div>
                </div>

                {inquiry.message && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{inquiry.message}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {inquiry.approvalStatus === 'rejected' && inquiry.rejectionReason && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl">
                    <p className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Rejection Reason:
                    </p>
                    <p className="text-sm text-red-700">{inquiry.rejectionReason}</p>
                  </div>
                )}

                {/* Action Buttons - Professional Workflow */}
                <div className="mt-4 flex flex-wrap gap-3 items-center">
                  {/* Show actions based on inquiry status */}
                  {inquiry.approvalStatus === 'pending' && (
                    <div className="px-5 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl text-sm text-yellow-800 flex items-center gap-2 font-semibold">
                      <Clock className="w-5 h-5" />
                      Awaiting Admin Review
                    </div>
                  )}

                  {inquiry.approvalStatus === 'approved' && (
                    <>
                      <button
                        onClick={() => handleForwardInquiry(inquiry)}
                        className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Forward to Vendor
                      </button>
                      <button
                        onClick={() => handleToggleInquiryActive(inquiry)}
                        className={`px-5 py-3 ${inquiry.isActive !== false ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'} text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105`}
                      >
                        {inquiry.isActive !== false ? <><EyeOff className="w-5 h-5" />Make Inactive</> : <><Eye className="w-5 h-5" />Make Active</>}
                      </button>
                      {inquiry.isActive === false && (
                        <span className="px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-400 text-red-800 rounded-xl text-sm font-bold flex items-center gap-2">
                          <Ban className="w-5 h-5" />Inactive - Not Visible to Vendors
                        </span>
                      )}
                      {inquiry.isActive !== false && (
                        <span className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 text-green-800 rounded-xl text-sm font-bold flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />Active - Visible to Vendors
                        </span>
                      )}
                    </>
                  )}

                  {inquiry.approvalStatus === 'rejected' && (
                    <div className="px-5 py-3 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-400 rounded-xl text-sm text-red-800 flex items-center gap-2 font-bold">
                      <XCircle className="w-5 h-5" />
                      Rejected - No Further Action
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedItem(inquiry)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
          ) : (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">No inquiries found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Vendors Tab
  const renderVendors = () => {
    const filteredVendors = vendors.filter(vendor => {
      const matchesSearch = searchTerm === '' || 
        vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && vendor.isActive) ||
        (filterStatus === 'inactive' && !vendor.isActive) ||
        (filterStatus === 'verified' && vendor.verified);
      
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">🏢 Vendor Management</h2>
              <p className="text-white text-opacity-90">Manage verified vendors and service providers</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{filteredVendors.length}</p>
                <p className="text-sm text-white text-opacity-90">Vendors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Search & Filter</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, business..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
            >
              <option value="all">🔄 All Status</option>
              <option value="active">✅ Active</option>
              <option value="inactive">🔒 Inactive</option>
              <option value="verified">✓ Verified</option>
            </select>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredVendors.length > 0 ? (
            filteredVendors.map((vendor) => (
              <div key={vendor._id} className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className={`h-2 ${
                vendor.verified && vendor.isActive ? 'bg-gradient-to-r from-green-400 to-emerald-600' :
                vendor.isActive ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                'bg-gradient-to-r from-gray-400 to-gray-600'
              }`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      vendor.verified ? 'bg-gradient-to-br from-blue-100 to-indigo-100' : 'bg-gray-100'
                    }`}>
                      <Building2 className={`w-8 h-8 ${
                        vendor.verified ? 'text-indigo-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{vendor.businessName || vendor.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />{vendor.contact?.email || vendor.email}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" />{vendor.contact?.phone || vendor.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {vendor.verified && (
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 rounded-xl text-sm font-bold flex items-center gap-1 border-2 border-indigo-300">
                        <Shield className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                      vendor.isActive 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' 
                        : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                    }`}>
                      {vendor.isActive ? '✅ Active' : '🔒 Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
                    <p className="text-xs text-purple-600 font-medium mb-1">Service Type</p>
                    <p className="font-bold text-gray-900 capitalize">{vendor.serviceType || 'N/A'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
                    <p className="text-xs text-blue-600 font-medium mb-1">City</p>
                    <p className="font-bold text-gray-900">{vendor.city || 'N/A'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
                    <p className="text-xs text-green-600 font-medium mb-1">Registered</p>
                    <p className="font-bold text-gray-900">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-3 rounded-xl">
                    <p className="text-xs text-orange-600 font-medium mb-1">Rating</p>
                    <p className="font-bold text-gray-900">
                      {vendor.rating ? `${vendor.rating} ⭐` : 'No ratings'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleToggleVendorVerification(vendor)}
                    className={`px-5 py-3 ${vendor.verified ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105`}
                  >
                    <Shield className="w-5 h-5" />
                    {vendor.verified ? 'Remove Verification' : 'Verify Vendor'}
                  </button>
                  <button
                    onClick={() => handleToggleVendorStatus(vendor)}
                    className={`px-5 py-3 ${vendor.isActive ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'} text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105`}
                  >
                    {vendor.isActive ? <><Ban className="w-5 h-5" />Deactivate</> : <><CheckCircle className="w-5 h-5" />Activate</>}
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor)}
                    className="px-5 py-3 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedItem(vendor)}
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Eye className="w-5 h-5" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
          ) : (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold text-lg">No vendors found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Users Tab
  const renderUsers = () => {
    const filteredUsers = users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && user.isActive) ||
        (filterStatus === 'blocked' && !user.isActive);
      
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">👥 User Management</h2>
              <p className="text-white text-opacity-90">Monitor and manage platform users</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{filteredUsers.length}</p>
                <p className="text-sm text-white text-opacity-90">Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Search & Filter</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
            >
              <option value="all">🔄 All Status</option>
              <option value="active">✅ Active</option>
              <option value="blocked">🔒 Blocked</option>
            </select>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className={`h-2 ${
                user.isActive ? 'bg-gradient-to-r from-green-400 to-emerald-600' : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      user.isActive ? 'bg-gradient-to-br from-green-100 to-emerald-100' : 'bg-gradient-to-br from-red-100 to-red-200'
                    }`}>
                      <Users className={`w-8 h-8 ${
                        user.isActive ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{user.name || 'No Name'}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />{user.email}
                      </p>
                      {user.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone className="w-4 h-4" />{user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                      user.isActive 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' 
                        : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                    }`}>
                      {user.isActive ? '✅ Active' : '🔒 Blocked'}
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl text-sm font-bold border-2 border-gray-300">
                      {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
                    <p className="text-xs text-blue-600 font-medium mb-1">Joined</p>
                    <p className="font-bold text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
                    <p className="text-xs text-purple-600 font-medium mb-1">Last Login</p>
                    <p className="font-bold text-gray-900">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
                    <p className="text-xs text-green-600 font-medium mb-1">Inquiries</p>
                    <p className="font-bold text-gray-900">{user.inquiriesCount || 0}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleToggleUserStatus(user)}
                    className={`px-5 py-3 ${user.isActive ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'} text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105`}
                  >
                    {user.isActive ? <><Ban className="w-5 h-5" />Block User</> : <><CheckCircle className="w-5 h-5" />Unblock User</>}
                  </button>
                  <button
                    onClick={() => setSelectedItem(user)}
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Eye className="w-5 h-5" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
          ) : (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold text-lg">No users found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBlogs = () => {
    const filteredBlogs = blogs.filter(blog => {
      const matchesSearch = searchTerm === '' || 
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = blogStatusFilter === 'all' || 
        blog.status === blogStatusFilter;
      
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">📝 Blog Management</h2>
              <p className="text-white text-opacity-90">Create and manage your content</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{blogStats?.totalBlogs || 0}</p>
                <p className="text-sm text-white text-opacity-90">Total</p>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{blogStats?.publishedBlogs || 0}</p>
                <p className="text-sm text-white text-opacity-90">Published</p>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{blogStats?.draftBlogs || 0}</p>
                <p className="text-sm text-white text-opacity-90">Drafts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Search & Filter</h3>
            </div>
            <button
              onClick={handleCreateBlog}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create New Blog
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search blogs by title, excerpt, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <select
              value={blogStatusFilter}
              onChange={(e) => setBlogStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
            >
              <option value="all">🔄 All Status</option>
              <option value="published">✅ Published</option>
              <option value="draft">📝 Draft</option>
            </select>
          </div>
        </div>

        {/* Blogs Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Published</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBlogs.length > 0 ? (
                  filteredBlogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {blog.featuredImage && (
                            <img 
                              src={blog.featuredImage} 
                              alt={blog.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-bold text-gray-900">{blog.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{blog.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {blog.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          blog.status === 'published' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {blog.status === 'published' ? '✅ Published' : '📝 Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{blog.views || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 font-medium">
                            {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Not published'}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {blog.readTime} min read
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditBlog(blog)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                            title="Edit Blog"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleBlogStatus(blog)}
                            className={`p-2 rounded-lg transition-colors ${
                              blog.status === 'published'
                                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                                : 'bg-green-100 hover:bg-green-200 text-green-700'
                            }`}
                            title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                          >
                            {blog.status === 'published' ? <EyeOff className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                            title="Delete Blog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-semibold text-lg">No blogs found</p>
                        <p className="text-sm text-gray-500 mt-1">Create your first blog post to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Notification Component
  const Notification = () => notification && (
    <div className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
      notification.type === 'success' ? 'bg-green-500' :
      notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white`}>

      {notification.message}
    </div>
  );

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Render Reviews Tab
  const renderReviews = () => {
    const filteredReviews = reviews.filter(review => {
      const matchesSearch = searchTerm === '' || 
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.vendorId?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = reviewFilter === 'all' || review.status === reviewFilter;
      
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">⭐ Review Management</h2>
              <p className="text-white text-opacity-90">Approve, reject, or delete customer reviews</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{reviewStats?.totalReviews || 0}</p>
                <p className="text-sm text-white text-opacity-90">Total</p>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{reviewStats?.pendingReviews || 0}</p>
                <p className="text-sm text-white text-opacity-90">Pending</p>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{reviewStats?.approvedReviews || 0}</p>
                <p className="text-sm text-white text-opacity-90">Approved</p>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{reviewStats?.rejectedReviews || 0}</p>
                <p className="text-sm text-white text-opacity-90">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Search & Filter</h3>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reviews by comment, vendor, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                />
              </div>
            </div>
            <select
              value={reviewFilter}
              onChange={(e) => {
                setReviewFilter(e.target.value);
                loadReviews();
              }}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 font-medium bg-white"
            >
              <option value="all">🔄 All Reviews</option>
              <option value="pending">⏳ Pending</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {filteredReviews.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <div key={review._id} className="p-6 hover:bg-yellow-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Vendor Info */}
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        {review.vendorId?.businessName?.charAt(0).toUpperCase() || 'V'}
                      </div>
                      
                      <div className="flex-1">
                        {/* Vendor Name */}
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {review.vendorId?.businessName || 'Unknown Vendor'}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-semibold text-gray-700">
                            {review.rating} / 5
                          </span>
                        </div>
                        
                        {/* Review Comment */}
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          "{review.comment}"
                        </p>
                        
                        {/* Reviewer Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {review.userId?.name || 'Anonymous'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Status Badge */}
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        review.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {review.status === 'pending' ? '⏳ Pending' :
                         review.status === 'approved' ? '✅ Approved' :
                         '❌ Rejected'}
                      </span>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveReview(review._id)}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              title="Approve Review"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Reject Review',
                                  message: 'Please provide a reason for rejecting this review:',
                                  type: 'warning',
                                  requireInput: true,
                                  inputPlaceholder: 'Rejection reason...',
                                  onConfirm: async (reason) => {
                                    await handleRejectReview(review._id, reason || 'Does not meet community guidelines');
                                  }
                                });
                              }}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              title="Reject Review"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Found</h3>
              <p className="text-gray-600">
                {reviewFilter !== 'all' 
                  ? `No ${reviewFilter} reviews found. Try changing the filter.`
                  : 'No reviews have been submitted yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMedia = () => {
    const filteredMedia = media.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vendorId?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = mediaFilter === 'all' || item.approvalStatus === mediaFilter;
      
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">📸 Media Management</h2>
              <p className="text-white text-opacity-90">Approve, reject, or delete vendor media</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{mediaStats?.totalMedia || 0}</p>
                <p className="text-sm text-white text-opacity-90">Total</p>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{mediaStats?.pendingMedia || 0}</p>
                <p className="text-sm text-white text-opacity-90">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={mediaFilter}
            onChange={(e) => setMediaFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No media found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img src={item.url} alt={item.caption} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <p className="font-semibold">{item.vendorId?.businessName}</p>
                  <p className="text-sm text-gray-600">{item.caption}</p>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      item.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      item.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.approvalStatus}
                    </span>
                  </div>
                  {item.approvalStatus === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleApproveMedia(item._id)}
                        className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectMedia(item._id, 'Content policy violation')}
                        className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteMedia(item._id)}
                    className="w-full mt-2 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderVendorBlogs = () => {
    const filteredBlogs = vendorBlogs.filter(blog => {
      const matchesSearch = searchTerm === '' || 
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.vendorId?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = vendorBlogFilter === 'all' || blog.approvalStatus === vendorBlogFilter;
      
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">📝 Vendor Blog Management</h2>
              <p className="text-white text-opacity-90">Approve, reject, or delete vendor blogs</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{vendorBlogStats?.totalBlogs || 0}</p>
                <p className="text-sm text-white text-opacity-90">Total</p>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{vendorBlogStats?.pendingBlogs || 0}</p>
                <p className="text-sm text-white text-opacity-90">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={vendorBlogFilter}
            onChange={(e) => setVendorBlogFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Blogs List */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No blogs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBlogs.map((blog) => (
              <div key={blog._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{blog.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{blog.vendorId?.businessName}</p>
                    <p className="text-gray-700 mt-2 line-clamp-2">{blog.excerpt || blog.content?.substring(0, 150) + '...'}</p>
                    <div className="flex gap-2 mt-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        blog.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        blog.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.approvalStatus}
                      </span>
                      <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                        {blog.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {blog.approvalStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveVendorBlog(blog._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectVendorBlog(blog._id, 'Content policy violation')}
                          className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteVendorBlog(blog._id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Dashboard', icon: BarChart3 },
              { id: 'inquiries', label: 'All Inquiries', icon: Mail },
              { id: 'vendors', label: 'Vendors', icon: Building2 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'blogs', label: 'Blogs', icon: FileText },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'media', label: 'Media', icon: Image },
              { id: 'vendor-blogs', label: 'Vendor Blogs', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'inquiries' && renderInquiries()}
            {activeTab === 'vendors' && renderVendors()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'blogs' && renderBlogs()}
            {activeTab === 'reviews' && renderReviews()}
            {activeTab === 'media' && renderMedia()}
            {activeTab === 'vendor-blogs' && renderVendorBlogs()}
          </>
        )}
      </div>

      {/* Notification */}
      <Notification />
      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setSelectedItem(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 z-50 p-6 animate-modalSlideIn">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Details</h3>
              <button onClick={() => setSelectedItem(null)} className="text-gray-600 hover:text-gray-900"><X className="w-5 h-5" /></button>
            </div>

            {/* Vendor - CHECK FIRST (vendors have 'name' too, so check serviceType or contact) */}
            {(selectedItem.serviceType || selectedItem.contact) && (
              <div className="space-y-3">
                <p className="text-lg font-bold text-gray-900">{selectedItem.businessName || selectedItem.name}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700"><span className="font-semibold">Email:</span> {selectedItem.contact?.email || selectedItem.contactInfo?.email || 'N/A'}</p>
                  {selectedItem.contact?.phone && <p className="text-gray-700"><span className="font-semibold">Phone:</span> {selectedItem.contact.phone}</p>}
                  <p className="text-gray-600"><span className="font-semibold">Service:</span> {selectedItem.serviceType || 'N/A'}</p>
                  <p className="text-gray-600"><span className="font-semibold">City:</span> {selectedItem.city || 'N/A'}</p>
                  <p className="text-gray-600"><span className="font-semibold">Verified:</span> <span className={selectedItem.verified ? 'text-green-600 font-medium' : 'text-gray-500'}>{selectedItem.verified ? '✓ Yes' : 'No'}</span></p>
                  <p className="text-gray-600"><span className="font-semibold">Status:</span> <span className={selectedItem.isActive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{selectedItem.isActive ? 'Active' : 'Inactive'}</span></p>
                  {selectedItem.rating && <p className="text-gray-600"><span className="font-semibold">Rating:</span> {selectedItem.rating} ⭐ ({selectedItem.reviewCount || 0} reviews)</p>}
                  {selectedItem.pricing && (
                    <p className="text-gray-600"><span className="font-semibold">Pricing:</span> ₹{selectedItem.pricing.min?.toLocaleString()} - ₹{selectedItem.pricing.max?.toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}

            {/* User - CHECK AFTER VENDOR */}
            {selectedItem.role && !selectedItem.serviceType && (
              <div className="space-y-2">
                <p className="text-lg font-bold">{selectedItem.name}</p>
                <p className="text-sm text-gray-600">{selectedItem.email}</p>
                {selectedItem.phone && <p className="text-sm text-gray-600">{selectedItem.phone}</p>}
                <p className="text-sm text-gray-500">Role: {selectedItem.role || 'user'}</p>
                <p className="text-sm text-gray-500">Joined: {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
            )}

            {/* Inquiry */}
            {selectedItem.userName && (
              <div className="space-y-2">
                <p className="text-lg font-bold">Inquiry from {selectedItem.userName}</p>
                <p className="text-sm text-gray-600">Contact: {selectedItem.userContact} • {selectedItem.userEmail}</p>
                <p className="text-sm text-gray-500">Event: {selectedItem.eventType}</p>
                <p className="text-sm text-gray-500">City: {selectedItem.city || 'N/A'}</p>
                <p className="text-sm text-gray-500">Budget: ₹{selectedItem.budget || 'N/A'}</p>
                {selectedItem.message && <div className="mt-2 p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-700">{selectedItem.message}</p></div>}
              </div>
            )}

            <div className="mt-6 text-right">
              <button onClick={() => setSelectedItem(null)} className="px-4 py-2 bg-gray-200 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        requireInput={confirmDialog.requireInput}
        inputPlaceholder={confirmDialog.inputPlaceholder}
        inputType={confirmDialog.inputType}
        selectOptions={confirmDialog.selectOptions}
      />

      {/* Blog Modal */}
      {showBlogModal && (
        <BlogModal 
          blog={editingBlog}
          onSave={handleSaveBlog}
          onClose={() => {
            setShowBlogModal(false);
            setEditingBlog(null);
          }}
          uploadingImage={uploadingImage}
          onImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
};

// Blog Modal Component
const BlogModal = ({ blog, onSave, onClose, uploadingImage, onImageUpload }) => {
  const [formData, setFormData] = useState({
    title: blog?.title || '',
    slug: blog?.slug || '',
    excerpt: blog?.excerpt || '',
    content: blog?.content || '',
    featuredImage: typeof blog?.featuredImage === 'string' ? blog?.featuredImage : blog?.featuredImage?.url || '',
    category: blog?.category || 'Event Planning',
    tags: blog?.tags?.join(', ') || '',
    status: blog?.status || 'draft'
  });
  const [manualSlug, setManualSlug] = useState(!!blog?.slug);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from title if not manually set
      if (name === 'title' && !manualSlug) {
        newData.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return newData;
    });
  };

  const handleSlugChange = (e) => {
    setManualSlug(true);
    setFormData(prev => ({ ...prev, slug: e.target.value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imageData = await onImageUpload(file);
        // imageData is {url, publicId} from uploadBlogImage
        setFormData(prev => ({ ...prev, featuredImage: imageData }));
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare blog data with proper structure
    const blogData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      // Handle featuredImage - can be string URL or {url, publicId} object
      featuredImage: typeof formData.featuredImage === 'object' && formData.featuredImage?.url
        ? formData.featuredImage
        : { url: formData.featuredImage, publicId: '' },
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      status: formData.status
    };
    
    console.log('📤 Submitting blog data:', blogData);
    onSave(blogData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-modalSlideIn">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {blog ? '✏️ Edit Blog' : '➕ Create New Blog'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Enter an engaging blog title..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="Event Planning">Event Planning</option>
                <option value="Wedding Ideas">Wedding Ideas</option>
                <option value="Corporate Events">Corporate Events</option>
                <option value="Party Tips">Party Tips</option>
                <option value="Vendor Guides">Vendor Guides</option>
                <option value="Industry News">Industry News</option>
              </select>
            </div>
          </div>

          {/* URL Slug - Auto-generated */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              URL Slug <span className="text-xs text-gray-500 font-normal">(auto-generated, editable)</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="url-friendly-slug"
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>🔗</span> URL: <span className="font-mono text-indigo-600">/blogs/{formData.slug || 'your-slug'}</span>
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Excerpt <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">(Brief summary - max 300 chars)</span>
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              placeholder="Write a compelling short description that will appear in blog cards..."
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.excerpt.length}/300</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">(Full blog post content)</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={12}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y"
              placeholder="Write your full blog content here...\n\nTips:\n• Use clear paragraphs\n• Add headings for sections\n• Keep it engaging and informative\n• Include relevant examples"
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Featured Image <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {/* Upload Button - Primary Option */}
              <label className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-md hover:shadow-lg">
                <Upload className="w-5 h-5" />
                {uploadingImage ? 'Uploading Image...' : 'Upload Featured Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              
              {/* OR Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-sm text-gray-500 font-medium">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
              
              {/* URL Input - Secondary Option */}
              <input
                type="url"
                name="featuredImage"
                value={typeof formData.featuredImage === 'object' ? formData.featuredImage?.url || '' : formData.featuredImage}
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Or paste image URL here..."
              />
              
              {/* Image Preview */}
              {(typeof formData.featuredImage === 'string' ? formData.featuredImage : formData.featuredImage?.url) && (
                <div className="relative rounded-xl overflow-hidden border-2 border-indigo-200">
                  <img 
                    src={typeof formData.featuredImage === 'string' ? formData.featuredImage : formData.featuredImage?.url} 
                    alt="Featured preview" 
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags & Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tags <span className="text-xs text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="wedding, party, planning (comma-separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="draft">📝 Draft</option>
                <option value="published">✅ Published</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              {blog ? 'Update Blog' : 'Create Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
