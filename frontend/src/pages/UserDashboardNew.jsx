import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Heart,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Building2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ModalDialog from '../components/ModalDialog';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // profile, inquiries, favorites
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      fetchUserInquiries();
    }
    setLoading(false);
  }, [user]);

  const fetchUserInquiries = async () => {
    try {
      // Fetch inquiries for this user (by phone/email)
      const response = await fetch(
        `http://localhost:5000/api/inquiries?userContact=${user.phone || user.email}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setInquiries(data.data.inquiries || []);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Profile updated successfully!');
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-blue-100 text-blue-800',
      responded: 'bg-purple-100 text-purple-800',
      closed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex items-center">
              <div className="bg-white rounded-full p-3">
                <User className="w-12 h-12 text-indigo-600" />
              </div>
              <div className="ml-4 text-white">
                <h1 className="text-3xl font-bold">{user?.name || 'User'}</h1>
                <p className="text-indigo-100">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'inquiries', label: 'My Inquiries', icon: FileText },
                { id: 'favorites', label: 'Favorites', icon: Heart }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!editMode}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!editMode}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!editMode}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      disabled
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {editMode && (
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Inquiries</h2>
            
            {inquiries.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No inquiries yet</p>
                <p className="text-gray-400 text-sm mt-2">Your inquiries will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div
                    key={inquiry._id}
                    onClick={() => {
                      setSelectedInquiry(inquiry);
                      setShowModal(true);
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {inquiry.inquiryType === 'vendor_inquiry' ? (
                              <>
                                {inquiry.vendorDetails?.businessName || inquiry.vendorDetails?.name}
                              </>
                            ) : (
                              inquiry.eventType
                            )}
                          </h3>
                          <StatusBadge status={inquiry.status} size="sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </div>
                          {inquiry.budget > 0 && (
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              ₹{inquiry.budget.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      {inquiry.inquiryType === 'vendor_inquiry' && inquiry.vendorDetails && (
                        <div className="text-right text-sm">
                          <div className="text-gray-600">{inquiry.vendorDetails.serviceType}</div>
                          <div className="text-gray-500">{inquiry.vendorDetails.city}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Favorite Vendors</h2>
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No favorites yet</p>
              <p className="text-gray-400 text-sm mt-2">Save vendors you like to find them easily later</p>
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      <ModalDialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Inquiry Details"
        size="lg"
      >
        {selectedInquiry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Inquiry ID</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{selectedInquiry.inquiryId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedInquiry.status} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedInquiry.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Event Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedInquiry.eventType}</p>
              </div>
            </div>

            {selectedInquiry.inquiryType === 'vendor_inquiry' && selectedInquiry.vendorDetails && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Vendor Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Business:</span> {selectedInquiry.vendorDetails.businessName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Service:</span> {selectedInquiry.vendorDetails.serviceType}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">City:</span> {selectedInquiry.vendorDetails.city}
                  </p>
                  {selectedInquiry.vendorDetails.contact?.phone && (
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span> {selectedInquiry.vendorDetails.contact.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedInquiry.message && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500">Message</label>
                <p className="mt-1 text-sm text-gray-900">{selectedInquiry.message}</p>
              </div>
            )}
          </div>
        )}
      </ModalDialog>
    </div>
  );
};

export default UserDashboard;
