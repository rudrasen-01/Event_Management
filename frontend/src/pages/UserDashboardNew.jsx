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
  Building2, DollarSign, MessageCircle, AlertCircle, Bell, X
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

  // Stats Card Component
  const StatsCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-semibold text-gray-700 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  // Notification Component
  const Notification = () => {
    if (!notification) return null;
    
    const bgColor = notification.type === 'success' ? 'bg-green-500' : 
                    notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    return (
      <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3`}>
        {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
        {notification.type === 'error' && <XCircle className="w-5 h-5" />}
        {notification.type === 'info' && <Bell className="w-5 h-5" />}
        <span className="font-semibold">{notification.message}</span>
        <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-80">
          <X className="w-4 h-4" />
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
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Inquiries"
          value={stats?.total || 0}
          subtitle="All your inquiries"
          icon={FileText}
          color="bg-blue-600"
        />
        <StatsCard
          title="Pending Review"
          value={stats?.pending || 0}
          subtitle="Awaiting admin approval"
          icon={Clock}
          color="bg-yellow-600"
        />
        <StatsCard
          title="Approved"
          value={stats?.approved || 0}
          subtitle="Sent to vendors"
          icon={CheckCircle}
          color="bg-green-600"
        />
        <StatsCard
          title="Rejected"
          value={stats?.rejected || 0}
          subtitle="Not approved"
          icon={XCircle}
          color="bg-red-600"
        />
        <StatsCard
          title="Responses"
          value={stats?.responded || 0}
          subtitle="Vendor replied"
          icon={MessageCircle}
          color="bg-purple-600"
        />
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Inquiries</option>
          <option value="approval-pending">Pending Admin Review</option>
          <option value="approval-approved">Approved by Admin</option>
          <option value="approval-rejected">Rejected by Admin</option>
        </select>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.length > 0 ? filteredInquiries.map((inquiry) => (
          <div key={inquiry._id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
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
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Full Details
            </button>
          </div>
        )) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-md border border-gray-100">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="font-semibold text-gray-900 text-lg">No inquiries yet</p>
            <p className="text-sm text-gray-600 mt-2">Start exploring vendors and send your first inquiry!</p>
          </div>
        )}
      </div>
    </div>
  );

  // Profile Tab
  const renderProfile = () => (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleUpdateProfile}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                Save
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
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                disabled={!editMode}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={!editMode}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                disabled={!editMode}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      <Notification />

      {/* Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Inquiry Details</h3>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Event Type</p>
                    <p className="font-semibold text-gray-900">{selectedInquiry.eventType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-semibold text-gray-900">₹{selectedInquiry.budget?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-semibold text-gray-900">{selectedInquiry.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Approval Status</p>
                    <ApprovalStatusBadge status={selectedInquiry.approvalStatus} />
                  </div>
                </div>
                
                {selectedInquiry.message && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Your Message</p>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedInquiry.message}</p>
                  </div>
                )}

                {selectedInquiry.vendorResponse && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Vendor Response</p>
                    <p className="text-gray-900 bg-blue-50 p-4 rounded-lg">{selectedInquiry.vendorResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            </div>
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
          <nav className="flex space-x-8">
            {[
              { id: 'inquiries', label: `My Inquiries (${inquiries.length})`, icon: FileText },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
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
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
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
