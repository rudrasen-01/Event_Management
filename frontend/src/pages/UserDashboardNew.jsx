/**
 * Production-Ready User Panel
 * Real-time inquiry tracking synchronized with admin decisions
 * 
 * Features:
 * - View all inquiry statuses (pending/approved/rejected)
 * - Real-time status updates from admin
 * - Inquiry history with vendor responses
 * - Profile management
 * - Responsive professional design
 */

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Calendar, MapPin, Edit, FileText,
  Clock, CheckCircle, XCircle, RefreshCw, Eye, TrendingUp,
  Building2, DollarSign, MessageCircle, AlertCircle, Bell, X,
  Activity, Award, Zap, Star, Target, Send, Search, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { getApiUrl } from '../config/api';

const UserDashboard = () => {
  const { user } = useAuth();

  // State Management
  const [activeTab, setActiveTab] = useState('inquiries');
  const [loading, setLoading] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    responded: 0
  });
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [notification, setNotification] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadInquiries();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'inquiries') {
        loadInquiries();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Load User Inquiries
  const loadInquiries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        showNotification('error', 'Please login to view your inquiries');
        return;
      }

      // Backend automatically filters inquiries based on logged-in user
      // No need to pass userContact - backend uses req.user.email and req.user.phone
      const response = await fetch(
        getApiUrl('inquiries'),
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        // Handle different response formats
        const inquiriesArray = Array.isArray(data.data) 
          ? data.data 
          : (data.data?.inquiries || []);
        
        setInquiries(inquiriesArray);
        
        // Calculate stats
        setStats({
          total: inquiriesArray.length,
          pending: inquiriesArray.filter(i => i.approvalStatus === 'pending').length,
          approved: inquiriesArray.filter(i => i.approvalStatus === 'approved').length,
          rejected: inquiriesArray.filter(i => i.approvalStatus === 'rejected').length,
          responded: inquiriesArray.filter(i => i.vendorResponse).length
        });
      } else {
        setInquiries([]);
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0, responded: 0 });
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      showNotification('error', 'Failed to load inquiries');
      setInquiries([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0, responded: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('users/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      if (data.success) {
        showNotification('success', 'Profile updated successfully');
        setEditMode(false);
      } else {
        showNotification('error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('error', 'Failed to update profile');
    }
  };

  // Show Notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Refresh Data
  const handleRefresh = () => {
    loadInquiries();
    showNotification('info', 'Data refreshed');
  };

  // Filter Inquiries
  const filteredInquiries = inquiries.filter(inquiry => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'approval-pending') return inquiry.approvalStatus === 'pending';
    if (filterStatus === 'approval-approved') return inquiry.approvalStatus === 'approved';
    if (filterStatus === 'approval-rejected') return inquiry.approvalStatus === 'rejected';
    return inquiry.status === filterStatus;
  });

  // Enhanced Stats Card Component with gradients and animations
  const StatsCard = ({ title, value, subtitle, icon: Icon, gradient, accentColor }) => (
    <div className="group relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Gradient background overlay */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className={`text-xs font-bold ${accentColor} bg-opacity-10 px-3 py-1 rounded-full`}>
            {((value / (stats?.total || 1)) * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {value}
          </p>
          <p className="text-sm font-bold text-gray-700 mt-2">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      
      {/* Decorative corner element */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${gradient} opacity-5 rounded-full`}></div>
    </div>
  );

  // Enhanced Notification Component
  const Notification = () => {
    if (!notification) return null;
    
    const config = {
      success: { 
        bg: 'bg-gradient-to-r from-green-500 to-emerald-600', 
        icon: CheckCircle,
        border: 'border-green-400'
      },
      error: { 
        bg: 'bg-gradient-to-r from-red-500 to-pink-600', 
        icon: XCircle,
        border: 'border-red-400'
      },
      info: { 
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', 
        icon: Bell,
        border: 'border-blue-400'
      }
    };
    
    const { bg, icon: Icon, border } = config[notification.type] || config.info;
    
    return (
      <div className={`fixed top-6 right-6 z-50 ${bg} text-white px-6 py-4 rounded-2xl shadow-2xl border-2 ${border} flex items-center gap-3 animate-slide-in-right max-w-md`}>
        <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <span className="font-bold flex-1">{notification.message}</span>
        <button 
          onClick={() => setNotification(null)} 
          className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  };

  // Approval Status Badge
  const ApprovalStatusBadge = ({ status }) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
    };
    
    const { color, icon: Icon, label } = config[status] || config.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // Inquiries Tab
  const renderInquiries = () => (
    <div className="space-y-6">
      {/* Enhanced Statistics Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inquiry Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Track your event planning progress</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-gray-900">Activity Score: {Math.min(100, (stats?.total || 0) * 10)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Inquiries"
            value={stats?.total || 0}
            subtitle="All your inquiries"
            icon={Target}
            gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
            accentColor="text-blue-600"
          />
          <StatsCard
            title="Pending Review"
            value={stats?.pending || 0}
            subtitle="Awaiting approval"
            icon={Clock}
            gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
            accentColor="text-yellow-600"
          />
          <StatsCard
            title="Approved"
            value={stats?.approved || 0}
            subtitle="Sent to vendors"
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            accentColor="text-green-600"
          />
          <StatsCard
            title="Rejected"
            value={stats?.rejected || 0}
            subtitle="Not approved"
            icon={XCircle}
            gradient="bg-gradient-to-br from-red-500 to-pink-600"
            accentColor="text-red-600"
          />
          <StatsCard
            title="Responses"
            value={stats?.responded || 0}
            subtitle="Vendor replied"
            icon={Award}
            gradient="bg-gradient-to-br from-purple-600 to-pink-600"
            accentColor="text-purple-600"
          />
        </div>
      </div>

      {/* Enhanced Filter Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <label className="text-sm font-bold text-gray-700 mb-2 block">Filter Inquiries</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900 transition-all"
              >
                <option value="all">🎯 All Inquiries ({inquiries.length})</option>
                <option value="approval-pending">⏳ Pending Review ({stats?.pending || 0})</option>
                <option value="approval-approved">✅ Approved ({stats?.approved || 0})</option>
                <option value="approval-rejected">❌ Rejected ({stats?.rejected || 0})</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Showing:</span>
            <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-md">
              {filteredInquiries.length} {filteredInquiries.length === 1 ? 'Inquiry' : 'Inquiries'}
            </span>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.length > 0 ? filteredInquiries.map((inquiry, index) => (
          <div 
            key={inquiry._id} 
            className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">Inquiry #{inquiry._id.slice(-8)}</p>
                <p className="font-bold text-gray-900 text-lg mt-1">{inquiry.eventType}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <ApprovalStatusBadge status={inquiry.approvalStatus} />
                <StatusBadge status={inquiry.status} type="inquiry" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Vendor</p>
                <p className="font-semibold text-gray-900 text-sm">{inquiry.vendorDetails?.businessName || 'General Inquiry'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Budget</p>
                <p className="font-semibold text-gray-900 text-sm">₹{inquiry.budget?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">City</p>
                <p className="font-semibold text-gray-900 text-sm">{inquiry.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Submitted</p>
                <p className="font-semibold text-gray-900 text-sm">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Approval Status Messages */}
            {inquiry.approvalStatus === 'pending' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Pending Admin Review</p>
                  <p className="text-xs text-yellow-700 mt-1">Your inquiry is being reviewed by our team. You'll be notified once approved.</p>
                </div>
              </div>
            )}

            {inquiry.approvalStatus === 'approved' && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Approved & Sent to Vendor</p>
                  <p className="text-xs text-green-700 mt-1">Your inquiry has been approved and forwarded to the vendor. They will respond soon.</p>
                </div>
              </div>
            )}

            {inquiry.approvalStatus === 'rejected' && inquiry.rejectionReason && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Inquiry Not Approved</p>
                  <p className="text-xs text-red-700 mt-1"><strong>Reason:</strong> {inquiry.rejectionReason}</p>
                </div>
              </div>
            )}

            {inquiry.message && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-1">Your Message:</p>
                <p className="text-sm text-gray-700">{inquiry.message}</p>
              </div>
            )}

            {inquiry.vendorResponse && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-900">Vendor Response:</p>
                </div>
                <p className="text-sm text-blue-800">{inquiry.vendorResponse}</p>
              </div>
            )}

            {inquiry.adminNotes && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs font-semibold text-purple-700 mb-1">Admin Notes:</p>
                <p className="text-xs text-purple-700">{inquiry.adminNotes}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedInquiry(inquiry)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-xl transform group-hover:scale-[1.02]"
            >
              <Eye className="w-5 h-5" />
              View Full Details
            </button>
          </div>
        )) : (
          <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-3xl p-16 text-center shadow-xl border-2 border-dashed border-blue-300 overflow-hidden">
            <div className="absolute inset-0 bg-blue-600 opacity-5"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center transform rotate-3">
                <Send className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No inquiries found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {filterStatus === 'all' 
                  ? "Start your event planning journey by sending your first inquiry to vendors!"
                  : "No inquiries match this filter. Try selecting a different option."}
              </p>
              {filterStatus === 'all' && (
                <button
                  onClick={() => window.location.href = '/search'}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Inquiry
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Profile Tab
  const renderProfile = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-2xl border border-gray-200 overflow-hidden relative">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-indigo-600 opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <User className="w-9 h-9 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Your Profile</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your personal information</p>
              </div>
            </div>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateProfile}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  ✔ Save
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setProfileData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || ''
                    });
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all duration-200"
                >
                  ✖ Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!editMode}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 font-semibold text-gray-900 transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!editMode}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 font-semibold text-gray-900 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!editMode}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 font-semibold text-gray-900 transition-all"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{stats?.total || 0}</p>
                    <p className="text-xs font-semibold text-blue-700">Total Inquiries</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900">{stats?.responded || 0}</p>
                    <p className="text-xs font-semibold text-purple-700">Responses Received</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Welcome Banner Component
  const WelcomeBanner = () => (
    <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 shadow-2xl overflow-hidden mb-8">
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
              <p className="text-blue-100 text-sm mt-1">Manage your event inquiries and track responses</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Target className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">{stats?.total || 0} Total Inquiries</span>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">{stats?.responded || 0} Responses</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.href = '/search'}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            New Inquiry
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-opacity-30 transition-all duration-200 border border-white border-opacity-30"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Notification */}
      <Notification />

      {/* Enhanced Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform animate-scale-in">
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Inquiry Details</h3>
                    <p className="text-blue-100 text-sm mt-1">#{selectedInquiry._id.slice(-8)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="space-y-6">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-3">
                  <ApprovalStatusBadge status={selectedInquiry.approvalStatus} />
                  <StatusBadge status={selectedInquiry.status} type="inquiry" />
                </div>

                {/* Key Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-700 uppercase mb-1">Event Type</p>
                        <p className="font-bold text-blue-900 text-lg">{selectedInquiry.eventType}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-700 uppercase mb-1">Budget</p>
                        <p className="font-bold text-green-900 text-lg">₹{selectedInquiry.budget?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-purple-700 uppercase mb-1">City</p>
                        <p className="font-bold text-purple-900 text-lg">{selectedInquiry.city || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 border border-orange-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-orange-700 uppercase mb-1">Vendor</p>
                        <p className="font-bold text-orange-900 text-lg">{selectedInquiry.vendorDetails?.businessName || 'General'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Your Message */}
                {selectedInquiry.message && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="w-5 h-5 text-gray-700" />
                      <h4 className="font-bold text-gray-900">Your Message</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{selectedInquiry.message}</p>
                  </div>
                )}

                {/* Vendor Response */}
                {selectedInquiry.vendorResponse && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-bold text-blue-900">Vendor Response</h4>
                    </div>
                    <p className="text-blue-800 leading-relaxed font-medium">{selectedInquiry.vendorResponse}</p>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedInquiry.adminNotes && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-300">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-purple-700" />
                      <h4 className="font-bold text-purple-900">Admin Notes</h4>
                    </div>
                    <p className="text-purple-700 leading-relaxed">{selectedInquiry.adminNotes}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 font-semibold">Created:</span>
                      <span className="text-gray-900 font-bold">{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedInquiry.updatedAt && (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 font-semibold">Updated:</span>
                        <span className="text-gray-900 font-bold">{new Date(selectedInquiry.updatedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">My Dashboard</h1>
                <p className="text-sm text-gray-600">Track and manage your event inquiries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Enhanced */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2">
            {[
              { id: 'inquiries', label: 'My Inquiries', count: inquiries.length, icon: FileText, color: 'blue' },
              { id: 'profile', label: 'Profile', icon: User, color: 'indigo' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-6 py-4 font-bold transition-all duration-200 ${
                    isActive
                      ? `text-${tab.color}-600 bg-${tab.color}-50`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`ml-2 px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      isActive 
                        ? `bg-${tab.color}-600 text-white` 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${tab.color}-600 to-${tab.color}-400 rounded-t-full`}></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        {activeTab === 'inquiries' && <WelcomeBanner />}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-semibold">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {activeTab === 'inquiries' && renderInquiries()}
            {activeTab === 'profile' && renderProfile()}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
