import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Grid3x3,
  List,
  Filter,
  TrendingUp,
  Wallet,
  Search,
  Eye,
  MessageCircle,
  RefreshCw
} from 'lucide-react';

const VendorDashboard = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'sent', 'responded'
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [notification, setNotification] = useState(null);

  // Vendor ID should come from authenticated vendor context
  const { user } = useAuth();
  const vendorId = user?.vendorId || user?._id || user?.id || null;

  // Fetch inquiries for this vendor
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      if (!vendorId) {
        setLoading(false);
        // No vendor id available (not logged in as vendor)
        return;
      }

      const response = await fetch(`http://localhost:5000/api/inquiries/vendor/${vendorId}`);
      const data = await response.json();
      
      if (data.success) {
        setInquiries(data.data);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      showNotification('error', 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Update inquiry status
  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setInquiries(prev => prev.map(inq => 
          inq._id === inquiryId ? { ...inq, status: newStatus } : inq
        ));
        showNotification('success', `Status updated to ${newStatus}`);
      } else {
        showNotification('error', 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('error', 'Failed to update status');
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter(inq => 
    filterStatus === 'all' ? true : inq.status === filterStatus
  );

  // Get statistics
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    sent: inquiries.filter(i => i.status === 'sent').length,
    responded: inquiries.filter(i => i.status === 'responded').length,
    totalRevenue: inquiries.reduce((sum, i) => sum + (i.budget || 0), 0)
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      sent: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: MessageCircle },
      responded: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
    };

    const { color, icon: Icon } = config[status] || config.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Inquiry Card Component
  const InquiryCard = ({ inquiry }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-white font-bold">{inquiry.userName}</h3>
              <p className="text-indigo-100 text-xs">
                {new Date(inquiry.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <StatusBadge status={inquiry.status} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3">
        {/* Contact */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Phone className="w-4 h-4 text-green-600" />
          <span className="font-medium">{inquiry.userContact}</span>
        </div>

        {/* Event Type */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>{inquiry.eventType}</span>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-blue-700">
            ₹{inquiry.budget?.toLocaleString() || '0'}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="text-xs">
            {inquiry.location?.coordinates 
              ? `${inquiry.location.coordinates[1]?.toFixed(2)}°N, ${inquiry.location.coordinates[0]?.toFixed(2)}°E`
              : 'Location Available'
            }
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="flex gap-2">
            {inquiry.status === 'pending' && (
              <button
                onClick={() => updateInquiryStatus(inquiry._id, 'sent')}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark as Sent
              </button>
            )}
            {inquiry.status === 'sent' && (
              <button
                onClick={() => updateInquiryStatus(inquiry._id, 'responded')}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark as Responded
              </button>
            )}
            <button
              onClick={() => setSelectedInquiry(inquiry)}
              className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Vendor Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage your inquiries and grow your business</p>
            </div>
            <button
              onClick={fetchInquiries}
              className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div className={`flex items-center gap-2 px-6 py-4 rounded-lg shadow-2xl ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Inquiries */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Inquiries</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Sent */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Sent</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.sent}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Responded */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Responded</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.responded}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Potential Revenue (Phase 2 Placeholder) */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Potential Revenue</p>
                <p className="text-2xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and View Toggle */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'sent', 'responded'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === status
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'all' && ` (${stats.total})`}
                  {status === 'pending' && ` (${stats.pending})`}
                  {status === 'sent' && ` (${stats.sent})`}
                  {status === 'responded' && ` (${stats.responded})`}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiries List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading inquiries...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Inquiries Found</h3>
            <p className="text-gray-600">
              {filterStatus === 'all'
                ? "You haven't received any inquiries yet"
                : `No ${filterStatus} inquiries at the moment`}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInquiries.map((inquiry) => (
              <InquiryCard key={inquiry._id} inquiry={inquiry} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Event Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInquiries.map((inquiry) => (
                    <tr key={inquiry._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{inquiry.userName}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {inquiry.userContact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {inquiry.eventType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-700">
                          ₹{inquiry.budget?.toLocaleString() || '0'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={inquiry.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {inquiry.status === 'pending' && (
                            <button
                              onClick={() => updateInquiryStatus(inquiry._id, 'sent')}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-semibold"
                            >
                              Mark Sent
                            </button>
                          )}
                          {inquiry.status === 'sent' && (
                            <button
                              onClick={() => updateInquiryStatus(inquiry._id, 'responded')}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-semibold"
                            >
                              Mark Responded
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Future Features Placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Earnings & Payouts</h2>
              <p className="text-purple-100">Coming Soon in Phase 2</p>
            </div>
          </div>
          <p className="text-purple-100 mb-4">
            Track your earnings, manage invoices, and receive payments directly through the platform.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-purple-100 text-sm mb-1">Total Earnings</p>
              <p className="text-2xl font-bold">Coming Soon</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-purple-100 text-sm mb-1">Pending Payouts</p>
              <p className="text-2xl font-bold">Coming Soon</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-purple-100 text-sm mb-1">Completed Jobs</p>
              <p className="text-2xl font-bold">Coming Soon</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VendorDashboard;
