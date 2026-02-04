import React, { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  MapPin,
  DollarSign,
  Phone,
  Award,
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, vendors, inquiries
  const [vendors, setVendors] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch all vendors
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        showNotification('error', 'Not authenticated');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setVendors(data.data.vendors || []);
      } else {
        showNotification('error', data.error?.message || 'Failed to load vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      showNotification('error', 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all inquiries
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        showNotification('error', 'Not authenticated');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/inquiries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setInquiries(data.data.inquiries || []);
      } else {
        showNotification('error', data.error?.message || 'Failed to load inquiries');
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      showNotification('error', 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchInquiries();
  }, []);

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Delete vendor
  const deleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/vendors/${vendorId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        setVendors(vendors.filter(v => v._id !== vendorId));
        showNotification('success', 'Vendor deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      showNotification('error', 'Failed to delete vendor');
    }
  };

  // Update inquiry status
  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setInquiries(inquiries.map(inq => 
          inq._id === inquiryId ? { ...inq, status: newStatus } : inq
        ));
        showNotification('success', `Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating inquiry:', error);
      showNotification('error', 'Failed to update status');
    }
  };

  // Calculate statistics
  const stats = {
    totalVendors: Array.isArray(vendors) ? vendors.length : 0,
    totalInquiries: Array.isArray(inquiries) ? inquiries.length : 0,
    pendingInquiries: Array.isArray(inquiries) ? inquiries.filter(i => i.status === 'pending').length : 0,
    respondedInquiries: Array.isArray(inquiries) ? inquiries.filter(i => i.status === 'responded').length : 0,
    eventTypes: Array.isArray(inquiries) ? inquiries.reduce((acc, inq) => {
      acc[inq.eventType] = (acc[inq.eventType] || 0) + 1;
      return acc;
    }, {}) : {},
    totalRevenue: Array.isArray(inquiries) ? inquiries.reduce((sum, i) => sum + (i.budget || 0), 0) : 0,
    avgBudget: Array.isArray(inquiries) && inquiries.length > 0 
      ? Math.round(inquiries.reduce((sum, i) => sum + (i.budget || 0), 0) / inquiries.length)
      : 0
  };

  // Filter vendors
  const filteredVendors = Array.isArray(vendors) ? vendors.filter(vendor =>
    (vendor.name || vendor.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.serviceType || vendor.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Filter inquiries
  const filteredInquiries = Array.isArray(inquiries) ? inquiries.filter(inquiry => {
    const matchesSearch = (inquiry.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inquiry.eventType || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      sent: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Sent' },
      responded: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Responded' }
    };
    const { color, label } = config[status] || config.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
        {label}
      </span>
    );
  };

  // Overview Tab
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Vendors */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVendors}</p>
              <p className="text-xs text-green-600 mt-1">Active on platform</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Total Inquiries */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Inquiries</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalInquiries}</p>
              <p className="text-xs text-blue-600 mt-1">{stats.pendingInquiries} pending</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue Potential */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Revenue Potential</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-green-600 mt-1">Avg: ₹{(stats.avgBudget / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalInquiries > 0 
                  ? Math.round((stats.respondedInquiries / stats.totalInquiries) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-purple-600 mt-1">{stats.respondedInquiries} completed</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Event Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900">Event Types Distribution</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.eventTypes).slice(0, 5).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">{type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                      style={{ width: `${(count / stats.totalInquiries) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Recent Inquiries</h3>
          </div>
          <div className="space-y-3">
            {inquiries.slice(0, 5).map((inquiry) => (
              <div key={inquiry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{inquiry.userName}</p>
                    <p className="text-xs text-gray-500">{inquiry.eventType}</p>
                  </div>
                </div>
                <StatusBadge status={inquiry.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Vendors Tab
  const VendorsTab = () => (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={fetchVendors}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Vendors Found</h3>
          <p className="text-gray-500">No vendors match your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300"
            >
              {/* Vendor Header */}
              <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                <div className="absolute -bottom-6 left-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Award className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Vendor Body */}
              <div className="pt-8 p-6 space-y-3">
                <h3 className="text-lg font-bold text-gray-900">{vendor.name}</h3>
                
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                    {vendor.category}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-xs">
                      {vendor.eventTypes?.slice(0, 2).join(', ')}
                      {vendor.eventTypes?.length > 2 && ` +${vendor.eventTypes.length - 2}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-xs">
                      {vendor.location?.coordinates 
                        ? `${vendor.location.coordinates[1]?.toFixed(2)}°N, ${vendor.location.coordinates[0]?.toFixed(2)}°E`
                        : 'Location Available'
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <span className="text-xs font-medium text-gray-700">Budget</span>
                    <span className="text-xs font-bold text-green-700">
                      ₹{vendor.budgetMin?.toLocaleString()} - ₹{vendor.budgetMax?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedItem(vendor);
                      setShowModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => deleteVendor(vendor._id)}
                    className="px-3 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Inquiries Tab
  const InquiriesTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inquiries by customer or event type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'sent', 'responded'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Inquiries Found</h3>
          <p className="text-gray-500">No inquiries match your search criteria</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Event Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Budget</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Vendor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => {
                  const vendor = vendors.find(v => v._id === inquiry.vendorID);
                  return (
                    <tr key={inquiry._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{inquiry.userName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{inquiry.userContact}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{inquiry.eventType}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-blue-700">
                          ₹{inquiry.budget?.toLocaleString() || '0'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{vendor?.name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inquiry.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {inquiry.status === 'pending' && (
                            <button
                              onClick={() => updateInquiryStatus(inquiry._id, 'sent')}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
                            >
                              Mark Sent
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedItem(inquiry);
                              setShowModal(true);
                            }}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold hover:bg-gray-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Control Panel
              </h1>
              <p className="text-gray-600 mt-2">Manage vendors, inquiries, and platform analytics</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
              <Award className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">Admin Access</span>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div className={`flex items-center gap-2 px-6 py-4 rounded-lg shadow-2xl ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-2">
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'vendors', label: 'Vendors', icon: Users },
              { id: 'inquiries', label: 'Inquiries', icon: Mail }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'vendors' && <VendorsTab />}
        {activeTab === 'inquiries' && <InquiriesTab />}
      </main>

      {/* Detail Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedItem.name || selectedItem.userName} Details
              </h2>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
