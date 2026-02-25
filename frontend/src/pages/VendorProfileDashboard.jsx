import React, { useState } from 'react';
import {
  LayoutDashboard,
  Image,
  FileText,
  Video,
  Star,
  Settings,
  BarChart3,
  Eye,
  Share2,
  Copy,
  Check,
  X
} from 'lucide-react';
import ProfileCompletionMeter from '../components/vendor/ProfileCompletionMeter';
import VendorMediaManager from '../components/vendor/VendorMediaManager';
import VendorBlogManager from '../components/vendor/VendorBlogManager';
import VendorVideoManager from '../components/vendor/VendorVideoManager';
import { Link } from 'react-router-dom';

/**
 * VendorProfileDashboard Component
 * Central dashboard for vendors to manage their complete profile
 * Instagram + LinkedIn + Justdial style profile management
 */
const VendorProfileDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showShareModal, setShowShareModal] = useState(false);
  const vendor = JSON.parse(localStorage.getItem('vendorData') || '{}');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'media', name: 'Portfolio Gallery', icon: Image },
    { id: 'videos', name: 'Video Content', icon: Video },
    { id: 'blogs', name: 'Blog Posts', icon: FileText },
    { id: 'reviews', name: 'Reviews', icon: Star },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab vendorId={vendor._id} />;
      case 'media':
        return <VendorMediaManager />;
      case 'videos':
        return <VendorVideoManager />;
      case 'blogs':
        return <VendorBlogManager />;
      case 'reviews':
        return <ReviewsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab vendorId={vendor._id} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Dashboard</h1>
              <p className="text-sm text-gray-600">{vendor.businessName || 'Your Business'}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share Profile
              </button>
              <Link
                to={`/vendor/${vendor._id}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
              >
                <Eye className="w-4 h-4" />
                View Public Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Share Profile Modal */}
      {showShareModal && (
        <ShareProfileModal
          vendorId={vendor._id}
          businessName={vendor.businessName}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

// ========================================
// SHARE PROFILE MODAL
// ========================================
const ShareProfileModal = ({ vendorId, businessName, onClose }) => {
  const [copied, setCopied] = useState(false);
  const profileUrl = `${window.location.origin}/vendor/${vendorId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => {
        const text = `Check out ${businessName || 'this vendor'} profile on our platform!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + profileUrl)}`, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank');
      }
    },
    {
      name: 'Twitter',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'bg-black hover:bg-gray-800',
      onClick: () => {
        const text = `Check out ${businessName || 'this vendor'} profile!`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`, '_blank');
      }
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: 'bg-blue-700 hover:bg-blue-800',
      onClick: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank');
      }
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Share Your Profile</h3>
            <p className="text-sm text-gray-600 mt-1">Let others discover your services</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Copy Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Profile Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={profileUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Share via Social Media
            </label>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className={`${option.color} text-white p-4 rounded-lg transition-all flex items-center justify-center gap-3 font-semibold`}
                >
                  {option.icon}
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-900">
              <strong>💡 Tip:</strong> Share your profile on social media to reach more potential customers and grow your business!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// OVERVIEW TAB
// ========================================
const OverviewTab = ({ vendorId }) => {
  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      <ProfileCompletionMeter />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Profile Views" value="0" change="+0%" icon={Eye} color="blue" />
        <StatCard title="Portfolio Items" value="0" change="+0%" icon={Image} color="purple" />
        <StatCard title="Blog Posts" value="0" change="+0%" icon={FileText} color="green" />
        <StatCard title="Video Content" value="0" change="+0%" icon={Video} color="red" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Upload Portfolio Images"
            description="Showcase your best work with high-quality images"
            icon={Image}
            color="purple"
          />
          <QuickActionCard
            title="Create Blog Post"
            description="Share your expertise and improve SEO"
            icon={FileText}
            color="green"
          />
          <QuickActionCard
            title="Upload Video Content"
            description="Engage customers with video showcases"
            icon={Video}
            color="red"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity yet. Start by uploading your first portfolio image!</p>
        </div>
      </div>
    </div>
  );
};

// ========================================
// REVIEWS TAB (Placeholder)
// ========================================
const ReviewsTab = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
      <div className="text-center py-12 text-gray-500">
        <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
        <p>Customer reviews will appear here once you complete your first booking</p>
      </div>
    </div>
  );
};

// ========================================
// ANALYTICS TAB (Placeholder)
// ========================================
const AnalyticsTab = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Analytics</h2>
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
        <p>Track your profile performance, views, and engagement metrics</p>
      </div>
    </div>
  );
};

// ========================================
// SETTINGS TAB (Placeholder)
// ========================================
const SettingsTab = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Settings</h2>
      <div className="text-center py-12 text-gray-500">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Panel</h3>
        <p>Configure your profile preferences, notifications, and privacy settings</p>
      </div>
    </div>
  );
};

// ========================================
// HELPER COMPONENTS
// ========================================
const StatCard = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm font-semibold text-green-600">{change}</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, color }) => {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    green: 'bg-green-100 text-green-600 hover:bg-green-200',
    red: 'bg-red-100 text-red-600 hover:bg-red-200'
  };

  return (
    <div className={`p-6 rounded-lg transition-all cursor-pointer ${colorClasses[color]}`}>
      <Icon className="w-8 h-8 mb-3" />
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
};

export default VendorProfileDashboard;
