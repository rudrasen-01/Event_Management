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
import {
  Users, Mail, TrendingUp, Calendar, CheckCircle, XCircle,
  UserCheck, UserX, Filter, Search, Eye, Edit, Trash2,
  Plus, RefreshCw, MapPin, DollarSign, Phone, Award,
  AlertCircle, BarChart3, PieChart, Shield, EyeOff,
  Clock, Ban, X, Check, Building2, FileText, Upload, Image
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
  toggleInquiryActive
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

  // Load Data on Mount & Auto-refresh
  useEffect(() => {
    loadDashboardData();
    
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'vendors') loadVendors();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'inquiries') loadInquiries();
    else if (activeTab === 'blogs') loadBlogs();
  }, [activeTab]);

  // Data Loading Functions
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, activityData] = await Promise.all([
        fetchAdminStats(),
        fetchRecentActivity(10)
      ]);
      setStats(statsData?.data || statsData);
      setRecentActivity(activityData?.data || activityData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      showNotification('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    setLoading(true);
    try {
      const response = await fetchAllVendorsAdmin({ page: 1, limit: 100 });
      
      // Response structure: { success: true, data: { vendors: [], total, page, totalPages } }
      const vendorsList = response?.data?.vendors || [];
      
      setVendors(vendorsList);
      
      if (vendorsList.length === 0) {
        showNotification('info', 'No vendors found in database');
      } else {
        showNotification('success', `Loaded ${vendorsList.length} vendors`);
      }
    } catch (error) {
      console.error('❌ Error loading vendors:', error);
      showNotification('error', 'Failed to load vendors: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers({ page: 1, limit: 100 });
      setUsers(data?.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const data = await fetchAllInquiriesAdmin({ page: 1, limit: 200 });
      // Backend returns: { inquiries: [...], total, page, totalPages }
      const inquiriesList = data?.inquiries || [];
      setInquiries(inquiriesList);
    } catch (error) {
      console.error('Error loading inquiries:', error);
      showNotification('error', 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const [blogsData, statsData] = await Promise.all([
        fetchAllBlogsAdmin({ page: 1, limit: 100 }),
        getBlogStats()
      ]);
      setBlogs(blogsData?.data?.blogs || blogsData?.blogs || []);
      setBlogStats(statsData?.data || statsData);
      showNotification('success', `Loaded ${blogsData?.data?.blogs?.length || 0} blogs`);
    } catch (error) {
      console.error('Error loading blogs:', error);
      showNotification('error', 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  // Notification Helper
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Refresh Current View
  const handleRefresh = () => {
    if (activeTab === 'overview') loadDashboardData();
    else if (activeTab === 'vendors') loadVendors();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'inquiries') loadInquiries();
    else if (activeTab === 'blogs') loadBlogs();
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
      return result.url;
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
                <p className="text-3xl font-bold">{blogStats?.total || 0}</p>
                <p className="text-sm text-white text-opacity-90">Total</p>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{blogStats?.published || 0}</p>
                <p className="text-sm text-white text-opacity-90">Published</p>
              </div>
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center">
                <p className="text-3xl font-bold">{blogStats?.draft || 0}</p>
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
              { id: 'blogs', label: 'Blogs', icon: FileText }
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
    featuredImage: blog?.featuredImage || '',
    category: blog?.category || '',
    tags: blog?.tags?.join(', ') || '',
    status: blog?.status || 'draft',
    metaTitle: blog?.metaTitle || '',
    metaDescription: blog?.metaDescription || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from title if slug is empty
      ...(name === 'title' && !prev.slug ? { 
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') 
      } : {})
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await onImageUpload(file);
        setFormData(prev => ({ ...prev, featuredImage: url }));
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const blogData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter blog title..."
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="url-friendly-slug"
            />
            <p className="text-xs text-gray-500 mt-1">Will be used in the URL: /blogs/{formData.slug}</p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Excerpt *
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Short description for preview..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={10}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              placeholder="Write your blog content here... (Supports Markdown)"
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Featured Image
            </label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Image URL or upload below..."
                />
              </div>
              <label className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {uploadingImage ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
            {formData.featuredImage && (
              <img 
                src={formData.featuredImage} 
                alt="Preview" 
                className="mt-3 w-full max-w-md h-48 object-cover rounded-xl border-2 border-gray-200"
              />
            )}
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Event Planning"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="draft">📝 Draft</option>
                <option value="published">✅ Published</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="wedding, party, planning (comma-separated)"
            />
          </div>

          {/* SEO Fields */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">SEO Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Leave empty to use blog title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Leave empty to use excerpt"
                />
              </div>
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
