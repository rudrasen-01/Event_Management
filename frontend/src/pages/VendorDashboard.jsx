/**
 * Production-Ready Vendor Panel
 * Real-time inquiry management synchronized with admin panel
 * 
 * Features:
 * - Real-time approved inquiries (only admin-approved)
 * - Professional dashboard with statistics
 * - Inquiry response management
 * - Status tracking and updates
 * - Responsive design with confirmation dialogs
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Phone, Calendar, DollarSign, MapPin, Clock,
  CheckCircle, AlertCircle, RefreshCw, Eye, MessageCircle,
  TrendingUp, BarChart3, Filter, Search, X, Send,
  Building2, User, FileText, Award, Bell
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VendorDashboard = () => {
  const navigate = useNavigate();
  
  // Get vendor info from localStorage
  const vendorToken = localStorage.getItem('authToken') || localStorage.getItem('vendorToken');
  const vendorId = localStorage.getItem('vendorId');
  const vendorBusinessName = localStorage.getItem('vendorBusinessName');
  const vendorEmail = localStorage.getItem('vendorEmail');
  
  // Check authentication
  useEffect(() => {
    if (!vendorToken || !vendorId) {
      navigate('/');
    }
  }, [vendorToken, vendorId, navigate]);

  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    responded: 0,
    closed: 0
  });
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [notification, setNotification] = useState(null);
  
  // Dialog States
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'inquiries') {
      loadInquiries();
    }
  }, [activeTab]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'inquiries') {
        loadInquiries();
      } else if (activeTab === 'dashboard') {
        loadDashboardData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Load Dashboard Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (!vendorToken) {
        showNotification('error', 'Authentication required');
        navigate('/');
        return;
      }
      
      console.log('📊 Loading dashboard data...');
      console.log('API URL:', `${API_BASE_URL}/vendors/dashboard/inquiries`);
      console.log('Token:', vendorToken ? 'Present' : 'Missing');
      
      const [inquiriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/vendors/dashboard/inquiries?limit=100`, {
          headers: { 
            'Authorization': `Bearer ${vendorToken}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      console.log('Response status:', inquiriesRes.status);
      
      if (!inquiriesRes.ok) {
        const errorText = await inquiriesRes.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API error: ${inquiriesRes.status}`);
      }
      
      const inquiriesData = await inquiriesRes.json();
      console.log('Dashboard data received:', inquiriesData);
      
      if (inquiriesData.success) {
        // Handle different response formats
        const allInquiries = Array.isArray(inquiriesData.data)
          ? inquiriesData.data
          : (inquiriesData.data?.inquiries || []);
        
        console.log('Total inquiries found:', allInquiries.length);
        
        setStats({
          total: allInquiries.length,
          new: allInquiries.filter(i => i.status === 'pending' || i.status === 'sent').length,
          responded: allInquiries.filter(i => i.status === 'responded').length,
          closed: allInquiries.filter(i => i.status === 'closed' || i.status === 'completed').length
        });
      } else {
        console.warn('API returned success=false:', inquiriesData.message);
        showNotification('error', inquiriesData.message || 'Failed to load data');
        setStats({ total: 0, new: 0, responded: 0, closed: 0 });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.message.includes('Failed to fetch')) {
        showNotification('error', 'Cannot connect to server. Please check if backend is running on port 5000');
      } else {
        showNotification('error', 'Failed to load dashboard data: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load Inquiries
  const loadInquiries = async () => {
    setLoading(true);
    try {
      if (!vendorToken) {
        showNotification('error', 'Authentication required');
        navigate('/');
        return;
      }
      
      console.log('📧 Loading inquiries...');
      console.log('API URL:', `${API_BASE_URL}/vendors/dashboard/inquiries`);
      console.log('Vendor ID:', vendorId);
      
      const response = await fetch(`${API_BASE_URL}/vendors/dashboard/inquiries?limit=100`, {
        headers: { 
          'Authorization': `Bearer ${vendorToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Inquiries response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Inquiries API Error:', errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Inquiries data received:', data);
      
      if (data.success) {
        // Handle different response formats
        const allInquiries = Array.isArray(data.data)
          ? data.data
          : (data.data?.inquiries || []);
        
        console.log('Total inquiries from API:', allInquiries.length);
        
        // Only show approved inquiries
        const approvedInquiries = allInquiries.filter(i => i.approvalStatus === 'approved');
        console.log('Approved inquiries:', approvedInquiries.length);
        
        setInquiries(approvedInquiries);
        
        if (approvedInquiries.length === 0 && allInquiries.length > 0) {
          showNotification('info', `Found ${allInquiries.length} inquiries but none are approved yet`);
        }
      } else {
        console.warn('API returned success=false:', data.message);
        setInquiries([]);
        showNotification('error', data.message || 'Failed to load inquiries');
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      if (error.message.includes('Failed to fetch')) {
        showNotification('error', 'Cannot connect to server. Please check if backend is running');
      } else {
        showNotification('error', 'Failed to load inquiries: ' + error.message);
      }
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Respond to Inquiry
  const handleRespondToInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setResponseText('');
  };

  // Submit Response
  const submitResponse = async () => {
    if (!responseText.trim()) {
      showNotification('error', 'Please enter a response');
      return;
    }

    if (!vendorToken) {
      showNotification('error', 'Authentication required');
      navigate('/');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/inquiries/${selectedInquiry._id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${vendorToken}`
          },
          body: JSON.stringify({
            vendorResponse: responseText,
            status: 'responded'
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        showNotification('success', 'Response sent successfully');
        setSelectedInquiry(null);
        setResponseText('');
        loadInquiries();
      } else {
        showNotification('error', data.message || 'Failed to send response');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      showNotification('error', 'Failed to send response');
    }
  };

  // Show Notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Refresh All Data
  const handleRefresh = () => {
    if (activeTab === 'dashboard') {
      loadDashboardData();
    } else if (activeTab === 'inquiries') {
      loadInquiries();
    }
    showNotification('info', 'Data refreshed');
  };

  // Filter Inquiries
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = searchTerm === '' ||
      inquiry.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.userContact?.includes(searchTerm) ||
      inquiry.eventType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Stats Card Component
  const StatsCard = ({ title, value, subtitle, icon: Icon, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Icon className="w-8 h-8" />
        </div>
      </div>
      <div>
        <p className="text-4xl font-bold mb-1">{value}</p>
        <p className="text-lg font-semibold text-white text-opacity-90">{title}</p>
        {subtitle && <p className="text-sm text-white text-opacity-75 mt-1">{subtitle}</p>}
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
        {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
        {notification.type === 'info' && <Bell className="w-5 h-5" />}
        <span className="font-semibold">{notification.message}</span>
        <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">Welcome Back! 👋</h2>
            <p className="text-xl text-white text-opacity-90">{vendorBusinessName}</p>
            <p className="text-blue-100 mt-1">Manage your inquiries and grow your business</p>
          </div>
          <div className="hidden md:block">
            <Building2 className="w-24 h-24 text-white opacity-20" />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Inquiries"
          value={stats?.total || 0}
          subtitle="All approved inquiries"
          icon={Mail}
          gradient="from-blue-500 to-blue-700"
        />
        <StatsCard
          title="New Inquiries"
          value={stats?.new || 0}
          subtitle="Awaiting response"
          icon={Bell}
          gradient="from-orange-500 to-red-600"
        />
        <StatsCard
          title="Responded"
          value={stats?.responded || 0}
          subtitle="Responses sent"
          icon={MessageCircle}
          gradient="from-green-500 to-emerald-700"
        />
        <StatsCard
          title="Closed"
          value={stats?.closed || 0}
          subtitle="Completed deals"
          icon={CheckCircle}
          gradient="from-purple-500 to-purple-700"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-indigo-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('inquiries')}
            className="flex items-center gap-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-xl"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">View Inquiries</p>
              <p className="text-sm text-gray-600">Manage customer requests</p>
            </div>
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-4 p-5 bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-xl"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Refresh Data</p>
              <p className="text-sm text-gray-600">Get latest updates</p>
            </div>
          </button>
          <button
            className="flex items-center gap-4 p-5 bg-gradient-to-br from-purple-50 to-pink-100 hover:from-purple-100 hover:to-pink-200 rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-xl"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Your Profile</p>
              <p className="text-sm text-gray-600">Update business info</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Inquiries Tab
  const renderInquiries = () => (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-1">📧 Customer Inquiries</h2>
            <p className="text-white text-opacity-90">Manage and respond to customer requests</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl text-center backdrop-blur-sm">
              <p className="text-3xl font-bold">{filteredInquiries.length}</p>
              <p className="text-sm text-white text-opacity-90">Inquiries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900">Search & Filter</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, contact, or event type..."
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
            <option value="pending">⏳ Pending</option>
            <option value="sent">📤 Sent</option>
            <option value="responded">✅ Responded</option>
            <option value="closed">✔️ Closed</option>
          </select>
        </div>
      </div>

      {/* Inquiries Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredInquiries.length > 0 ? (
          filteredInquiries.map((inquiry) => (
            <div key={inquiry._id} className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className={`h-2 ${
                inquiry.status === 'responded' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                inquiry.status === 'closed' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                'bg-gradient-to-r from-yellow-400 to-orange-500'
              }`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      inquiry.status === 'responded' ? 'bg-gradient-to-br from-green-100 to-green-200' : 'bg-gradient-to-br from-blue-100 to-indigo-200'
                    }`}>
                      <User className={`w-7 h-7 ${
                        inquiry.status === 'responded' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{inquiry.userName}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {inquiry.userContact}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {inquiry.userEmail}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={inquiry.status} type="inquiry" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
                    <p className="text-xs text-blue-600 font-medium mb-1">Event Type</p>
                    <p className="font-bold text-gray-900">{inquiry.eventType}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
                    <p className="text-xs text-green-600 font-medium mb-1">Budget</p>
                    <p className="font-bold text-gray-900">₹{inquiry.budget?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
                    <p className="text-xs text-purple-600 font-medium mb-1">Event Date</p>
                    <p className="font-bold text-gray-900">{inquiry.eventDate ? new Date(inquiry.eventDate).toLocaleDateString() : 'TBD'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl">
                    <p className="text-xs text-orange-600 font-medium mb-1">City</p>
                    <p className="font-bold text-gray-900">{inquiry.city || 'N/A'}</p>
                  </div>
                </div>

                {inquiry.message && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                    <p className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Customer Message:
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{inquiry.message}</p>
                  </div>
                )}

                {inquiry.vendorResponse && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                    <p className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Your Response:
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{inquiry.vendorResponse}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {(inquiry.status === 'pending' || inquiry.status === 'sent') && !inquiry.vendorResponse && (
                    <button
                      onClick={() => handleRespondToInquiry(inquiry)}
                      className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Respond
                    </button>
                  )}
                  {inquiry.vendorResponse && (
                    <div className="px-5 py-3 bg-green-100 text-green-700 rounded-xl font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Response Sent
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-bold text-lg">
                {filterStatus !== 'all' || searchTerm ? 'No matching inquiries found' : 'No inquiries yet'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {filterStatus !== 'all' || searchTerm 
                  ? 'Try adjusting your filters' 
                  : 'New approved inquiries will appear here'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      <Notification />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />

      {/* Response Modal */}
      {selectedInquiry && responseText !== '' && (selectedInquiry.status === 'pending' || selectedInquiry.status === 'sent') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Respond to Inquiry</h3>
                <button
                  onClick={() => { setSelectedInquiry(null); setResponseText(''); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="font-semibold text-gray-900">Customer: {selectedInquiry.userName}</p>
                <p className="text-sm text-gray-600">{selectedInquiry.userContact}</p>
              </div>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Customer Message:</p>
                <p className="text-sm text-gray-700">{selectedInquiry.message || 'No message provided'}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response to the customer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="6"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={submitResponse}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Response
                </button>
                <button
                  onClick={() => { setSelectedInquiry(null); setResponseText(''); }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Vendor Panel</h1>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-5 py-2.5 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: Mail }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-4 border-b-3 font-bold transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 transform scale-105'
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
        {loading && activeTab === 'dashboard' ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'inquiries' && renderInquiries()}
          </>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
