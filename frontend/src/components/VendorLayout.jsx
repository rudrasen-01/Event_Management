import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useVendorAuth } from '../contexts/VendorAuthContext';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  ChevronDown
} from 'lucide-react';

/**
 * VendorLayout - Dedicated layout for vendor panel
 * Only shows Dashboard, Profile, and Settings
 * No access to customer pages
 */
const VendorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vendor, logoutVendor } = useVendorAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Redirect if not authenticated
  if (!vendor) {
    return <Navigate to="/" replace />;
  }

  const vendorNavItems = [
    { 
      label: 'Dashboard', 
      path: '/vendor-dashboard', 
      icon: LayoutDashboard 
    },
    { 
      label: 'Profile', 
      path: '/vendor-profile-dashboard', 
      icon: User 
    },
    { 
      label: 'Settings', 
      path: '/vendor-settings', 
      icon: Settings 
    }
  ];

  const handleLogout = () => {
    logoutVendor();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Vendor Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">AIS Vendor Panel</h1>
                  <p className="text-xs text-gray-500">Event Management</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {vendorNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${active 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Profile & Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {vendor.businessName?.[0]?.toUpperCase() || 'V'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                      {vendor.businessName || 'Vendor'}
                    </p>
                    <p className="text-xs text-gray-500">Vendor Account</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {vendor.businessName || 'Vendor'}
                      </p>
                      <p className="text-xs text-gray-500">{vendor.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="space-y-1">
                {vendorNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                        ${active 
                          ? 'bg-indigo-50 text-indigo-600' 
                          : 'text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2026 AIS Signature Event. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VendorLayout;
