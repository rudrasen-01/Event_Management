import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User as UserIcon, LogOut, Settings, LayoutDashboard, Shield } from 'lucide-react';
import VendorLoginModal from './VendorLoginModal';
import UserLoginModal from './UserLoginModal';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVendorLoginModal, setShowVendorLoginModal] = useState(false);
  const [showUserLoginModal, setShowUserLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showVendorMenu, setShowVendorMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  
  // Check if vendor is logged in
  const vendorToken = localStorage.getItem('vendorToken');
  const vendorBusinessName = localStorage.getItem('vendorBusinessName');
  const isVendor = !!vendorToken;

  const navItems = [
    { name: 'Home', href: '/', showForAdmin: false },
    { name: 'Search Events', href: '/search', showForAdmin: false },
    { name: 'How It Works', href: '/how-it-works', showForAdmin: false },
    { name: 'FAQ', href: '/faq', showForAdmin: false },
    { name: 'Contact', href: '/contact', showForAdmin: false }
  ];

  // Filter nav items based on user role
  const filteredNavItems = (isAuthenticated() && isAdmin()) || isVendor
    ? navItems.filter(item => item.showForAdmin)
    : navItems;

  const isActive = (path) => location.pathname === path;

  const handleVendorDashboardClick = (e) => {
    e.preventDefault();
    setShowVendorLoginModal(true);
    setMobileMenuOpen(false);
  };

  const handleLoginSuccess = (vendor) => {
    navigate('/vendor-dashboard');
  };

  const handleUserLogout = () => {
    logout();
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  const handleUserMenuClick = (path) => {
    navigate(path);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  const handleVendorLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorId');
    localStorage.removeItem('vendorEmail');
    localStorage.removeItem('vendorBusinessName');
    setShowVendorMenu(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleVendorMenuClick = (path) => {
    navigate(path);
    setShowVendorMenu(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AIS Signature Event
                </h1>
                <p className="text-xs text-gray-500">Premium Event Management</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`font-medium transition-colors duration-200 ${
                  isActive(item.href) 
                    ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' 
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Show Vendor buttons only for guests (not logged in as user or vendor) */}
            {!isAuthenticated() && !isVendor && (
              <>
                {/* Vendor Dashboard Button */}
                <button
                  onClick={handleVendorDashboardClick}
                  className="px-4 py-2 text-gray-700 font-semibold hover:text-indigo-600 transition-colors"
                >
                  Vendor Dashboard
                </button>

                {/* Become a Partner */}
                <Link 
                  to="/vendor-registration"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Become a Partner
                </Link>
              </>
            )}

            {/* Vendor Profile Menu */}
            {isVendor ? (
              <div className="relative">
                <button
                  onClick={() => setShowVendorMenu(!showVendorMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-purple-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">
                      {vendorBusinessName?.charAt(0).toUpperCase() || 'V'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-700">{vendorBusinessName || 'Vendor'}</p>
                    <p className="text-xs text-purple-600 font-medium">Vendor</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Vendor Dropdown Menu */}
                {showVendorMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100] animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{vendorBusinessName || 'Vendor'}</p>
                      <p className="text-xs text-gray-500">{localStorage.getItem('vendorEmail')}</p>
                    </div>
                    
                    <button
                      onClick={() => handleVendorMenuClick('/vendor-dashboard')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </button>
                    
                    <button
                      onClick={() => handleVendorMenuClick('/vendor-profile')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleVendorLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : /* User Login/Profile - Rightmost Position */
            isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-indigo-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
                    {isAdmin() && (
                      <p className="text-xs text-indigo-600 font-medium">Admin</p>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100] animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    {isAdmin() ? (
                      <button
                        onClick={() => handleUserMenuClick('/admin')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserMenuClick('/dashboard')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        My Dashboard
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleUserMenuClick('/profile')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleUserLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowUserLoginModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <UserIcon className="w-5 h-5" />
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3 animate-fadeIn">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-4 pt-4 border-t border-gray-100 space-y-3">
              {/* Show Vendor buttons only for guests (not logged in as user or vendor) in mobile */}
              {!isAuthenticated() && !isVendor && (
                <>
                  <button
                    onClick={handleVendorDashboardClick}
                    className="block w-full px-4 py-2 text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Vendor Dashboard
                  </button>
                  <Link 
                    to="/vendor-registration"
                    className="block w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Become a Partner
                  </Link>
                </>
              )}

              {/* Vendor Profile for Mobile */}
              {isVendor ? (
                <>
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <p className="text-sm font-semibold text-gray-900">{vendorBusinessName || 'Vendor'}</p>
                    <p className="text-xs text-gray-500">{localStorage.getItem('vendorEmail')}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded">
                      Vendor
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleVendorMenuClick('/vendor-dashboard')}
                    className="block w-full px-4 py-2 text-left text-gray-700 font-semibold border-2 border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 inline mr-2" />
                    My Dashboard
                  </button>
                  
                  <button
                    onClick={handleVendorLogout}
                    className="block w-full px-4 py-2 text-red-600 font-semibold border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-center"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : /* User Login/Profile for Mobile */
              isAuthenticated() ? (
                <>
                  <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {isAdmin() && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  {isAdmin() ? (
                    <button
                      onClick={() => handleUserMenuClick('/admin')}
                      className="block w-full px-4 py-2 text-left text-gray-700 font-semibold border-2 border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 inline mr-2" />
                      Admin Panel
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUserMenuClick('/dashboard')}
                      className="block w-full px-4 py-2 text-left text-gray-700 font-semibold border-2 border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 inline mr-2" />
                      My Dashboard
                    </button>
                  )}
                  
                  <button
                    onClick={handleUserLogout}
                    className="block w-full px-4 py-2 text-red-600 font-semibold border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-center"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowUserLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2.5 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-center shadow-sm"
                >
                  <UserIcon className="w-5 h-5 inline mr-2" />
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Vendor Login Modal */}
      <VendorLoginModal 
        isOpen={showVendorLoginModal}
        onClose={() => setShowVendorLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* User Login Modal */}
      <UserLoginModal 
        isOpen={showUserLoginModal}
        onClose={() => setShowUserLoginModal(false)}
      />
    </header>
  );
};

export default Header;
