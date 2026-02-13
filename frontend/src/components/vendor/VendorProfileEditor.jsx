/**
 * Professional Vendor Profile Editor
 * Instagram + Facebook style profile with real-time editing
 * All fields that show in search results are editable here
 */

import React, { useState, useEffect } from 'react';
import {
  Camera, MapPin, Phone, Mail, Globe, Instagram, Facebook,
  Edit2, Save, X, Loader2, CheckCircle, AlertCircle,
  Building2, Award, DollarSign, Calendar, Star, Users,
  Package, Image as ImageIcon, Video, FileText, ChevronRight,
  MessageCircle, Lock
} from 'lucide-react';
import { getApiUrl } from '../../config/api';

const API_BASE_URL = getApiUrl();

const VendorProfileEditor = () => {
  const vendorToken = localStorage.getItem('authToken') || localStorage.getItem('vendorToken');
  const vendorId = localStorage.getItem('vendorId');

  // State Management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Profile Data - All fields shown in search results
  const [profile, setProfile] = useState({
    // Basic Info (Shows in search cards)
    businessName: '',
    ownerName: '',
    serviceType: '',
    description: '',
    
    // Location (Shows in search results)
    city: '',
    area: '',
    address: '',
    
    // Contact (Shows in vendor card)
    contact: '',
    email: '',
    whatsapp: '',
    website: '',
    
    // Social Media (Shows in profile)
    instagram: '',
    facebook: '',
    
    // Business Details (Shows in filters/cards)
    yearsInBusiness: '',
    teamSize: '',
    priceRange: {
      min: '',
      max: ''
    },
    
    // Profile Media (Shows as thumbnail)
    profileImage: '',
    coverImage: '',
    
    // Stats (Shows in search)
    verified: false,
    rating: 0,
    totalReviews: 0
  });

  const [tempProfile, setTempProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      console.log('🔑 Vendor Token:', vendorToken ? 'Present' : 'Missing');
      console.log('🆔 Vendor ID:', vendorId);
      console.log('📡 API URL:', `${API_BASE_URL}/vendor-profile/profile/me`);
      
      const response = await fetch(`${API_BASE_URL}/vendor-profile/profile/me`, {
        headers: {
          'Authorization': `Bearer ${vendorToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Full vendor data received:', data.data);
      if (data.success) {
        const vendor = data.data;
        setProfile({
          businessName: vendor.businessName || '',
          ownerName: vendor.name || '',
          serviceType: vendor.serviceType || '',
          description: vendor.description || '',
          city: vendor.city || '',
          area: vendor.area || '',
          address: vendor.address || '',
          contact: vendor.contact?.phone || '',
          email: vendor.contact?.email || vendor.email || '',
          whatsapp: vendor.contact?.whatsapp || '',
          website: vendor.contact?.website || '',
          instagram: vendor.contact?.socialMedia?.instagram || '',
          facebook: vendor.contact?.socialMedia?.facebook || '',
          yearsInBusiness: vendor.yearsInBusiness || '',
          teamSize: vendor.teamSize || '',
          priceRange: {
            min: vendor.pricing?.min || '',
            max: vendor.pricing?.max || ''
          },
          profileImage: vendor.profileImage || '',
          coverImage: vendor.coverImage || '',
          verified: vendor.verified || false,
          rating: vendor.rating || 0,
          totalReviews: vendor.totalReviews || 0
        });
        console.log('✅ Profile state updated');
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      showNotification('error', `Failed to load profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setTempProfile({ ...profile });
    setEditMode(true);
  };

  const handleCancel = () => {
    setTempProfile(null);
    setEditMode(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vendor-profile/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${vendorToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tempProfile)
      });

      const data = await response.json();
      
      if (data.success) {
        setProfile(tempProfile);
        setEditMode(false);
        setTempProfile(null);
        showNotification('success', 'Profile updated successfully! Changes are live in search results.');
        
        // Reload to reflect changes
        setTimeout(() => loadProfile(), 500);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification('error', error.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTempProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setTempProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const currentData = editMode ? tempProfile : profile;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-slide-in ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
            : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
          <p className="font-semibold">{notification.message}</p>
        </div>
      )}

      {/* Cover Image Section */}
      <div className="relative bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-2xl overflow-hidden h-64 shadow-xl">
        {currentData.coverImage ? (
          <img src={currentData.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No cover image</p>
            </div>
          </div>
        )}
        
        {/* Edit Cover Button */}
        {editMode && (
          <button className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-xl shadow-lg transition-all">
            <Camera className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Profile Header with Instagram/Facebook Style */}
      <div className="relative -mt-20 px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                {currentData.profileImage ? (
                  <img src={currentData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              {editMode && (
                <button className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full shadow-lg transition-all">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              )}
              {currentData.verified && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {editMode ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={tempProfile.businessName}
                    onChange={(e) => handleFieldChange('businessName', e.target.value)}
                    placeholder="Business Name"
                    className="text-3xl font-bold w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={tempProfile.ownerName}
                    onChange={(e) => handleFieldChange('ownerName', e.target.value)}
                    placeholder="Owner Name"
                    className="text-lg text-gray-600 w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={tempProfile.serviceType}
                    onChange={(e) => handleFieldChange('serviceType', e.target.value)}
                    placeholder="Service Type"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{currentData.businessName || 'Your Business Name'}</h1>
                  <p className="text-lg text-gray-600 mb-2">{currentData.ownerName}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                      {currentData.serviceType || 'Service Type'}
                    </span>
                    {currentData.yearsInBusiness && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {currentData.yearsInBusiness}+ years
                      </span>
                    )}
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex items-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900">{currentData.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({currentData.totalReviews} reviews)</span>
                    </div>
                    {currentData.teamSize && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-5 h-5" />
                        <span>{currentData.teamSize} team members</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!editMode ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg transition-all transform hover:scale-105"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </> 
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              About Business
            </h2>
            {editMode ? (
              <textarea
                value={tempProfile.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe your business, services, and what makes you unique..."
                rows={6}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {currentData.description || 'No description added yet. Click Edit Profile to add one.'}
              </p>
            )}
          </div>

          {/* Location Section - Shows in Search Results */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Location Details
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full ml-2">Shown in Search</span>
            </h2>
            {editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={tempProfile.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="City"
                  className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={tempProfile.area}
                  onChange={(e) => handleFieldChange('area', e.target.value)}
                  placeholder="Area/Locality"
                  className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={tempProfile.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Full Address"
                  className="md:col-span-2 border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">{currentData.area}</span>, {currentData.city}
                </p>
                {currentData.address && (
                  <p className="text-gray-600 text-sm">{currentData.address}</p>
                )}
              </div>
            )}
          </div>

          {/* Pricing Section - Shows in Search Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              Price Range
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full ml-2">Filterable</span>
            </h2>
            {editMode ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Price (₹)</label>
                  <input
                    type="number"
                    value={tempProfile.priceRange.min}
                    onChange={(e) => handleFieldChange('priceRange.min', e.target.value)}
                    placeholder="Min"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Price (₹)</label>
                  <input
                    type="number"
                    value={tempProfile.priceRange.max}
                    onChange={(e) => handleFieldChange('priceRange.max', e.target.value)}
                    placeholder="Max"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-indigo-600">
                  ₹{currentData.priceRange.min ? Number(currentData.priceRange.min).toLocaleString('en-IN') : '---'}
                </span>
                <span className="text-gray-400">to</span>
                <span className="text-3xl font-bold text-indigo-600">
                  ₹{currentData.priceRange.max ? Number(currentData.priceRange.max).toLocaleString('en-IN') : '---'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Contact & Social */}
        <div className="space-y-6">
          {/* Contact Information - Shows in Vendor Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-600" />
              Contact Info
            </h2>
            {editMode ? (
              <div className="space-y-3">
                <input
                  type="tel"
                  value={tempProfile.contact}
                  onChange={(e) => handleFieldChange('contact', e.target.value)}
                  placeholder="Phone Number"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="relative">
                  <input
                    type="email"
                    value={tempProfile.email}
                    disabled
                    placeholder="Email Address"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pl-10 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">🔒 Login ID
                  </span>
                </div>
                <input
                  type="tel"
                  value={tempProfile.whatsapp}
                  onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                  placeholder="WhatsApp Number"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="url"
                  value={tempProfile.website}
                  onChange={(e) => handleFieldChange('website', e.target.value)}
                  placeholder="Website URL"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <a href={`tel:${currentData.contact}`} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>{currentData.contact || 'Not provided'}</span>
                </a>
                <a href={`mailto:${currentData.email}`} className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>{currentData.email || 'Not provided'}</span>
                </a>
                {currentData.whatsapp && (
                  <a href={`https://wa.me/${currentData.whatsapp}`} className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{currentData.whatsapp}</span>
                  </a>
                )}
                {currentData.website && (
                  <a href={currentData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition-colors">
                    <Globe className="w-4 h-4" />
                    <span className="truncate">{currentData.website}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Social Media Links */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Social Media</h2>
            {editMode ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={tempProfile.instagram}
                    onChange={(e) => handleFieldChange('instagram', e.target.value)}
                    placeholder="@username"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={tempProfile.facebook}
                    onChange={(e) => handleFieldChange('facebook', e.target.value)}
                    placeholder="facebook.com/yourpage"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {currentData.instagram ? (
                  <a href={`https://instagram.com/${currentData.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                    <Instagram className="w-5 h-5" />
                    <span className="font-semibold">@{currentData.instagram.replace('@', '')}</span>
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">No Instagram linked</p>
                )}
                
                {currentData.facebook ? (
                  <a href={currentData.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                    <Facebook className="w-5 h-5" />
                    <span className="font-semibold">Visit Facebook Page</span>
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">No Facebook page linked</p>
                )}
              </div>
            )}
          </div>

          {/* Business Stats */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-indigo-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Business Stats</h2>
            {editMode ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business</label>
                  <input
                    type="number"
                    value={tempProfile.yearsInBusiness}
                    onChange={(e) => handleFieldChange('yearsInBusiness', e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                  <input
                    type="text"
                    value={tempProfile.teamSize}
                    onChange={(e) => handleFieldChange('teamSize', e.target.value)}
                    placeholder="e.g., 10-20"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-bold text-indigo-600">{currentData.yearsInBusiness || '---'}+ years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Team Size</span>
                  <span className="font-bold text-indigo-600">{currentData.teamSize || 'Not set'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">💡 All Changes Reflect in Search Results</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Every detail you edit here (business name, location, pricing, contact, etc.) will automatically 
              update in search results, vendor cards, and your public profile in real-time. Make sure all 
              information is accurate and professional!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfileEditor;
