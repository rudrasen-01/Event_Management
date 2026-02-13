import React, { useState } from 'react';
import {
  LayoutDashboard,
  Image,
  FileText,
  Video,
  Star,
  Settings,
  BarChart3,
  Eye
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
