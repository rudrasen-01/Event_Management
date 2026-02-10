import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User as UserIcon, LogOut, Settings, LayoutDashboard, Shield, Sparkles, Calendar } from 'lucide-react';
import VendorLoginModal from './VendorLoginModal';
import UserLoginModal from './UserLoginModal';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVendorLoginModal, setShowVendorLoginModal] = useState(false);
  const [showUserLoginModal, setShowUserLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showVendorMenu, setShowVendorMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  
  // Check if vendor is logged in
  const vendorToken = localStorage.getItem('vendorToken');
  const vendorBusinessName = localStorage.getItem('vendorBusinessName');
  const isVendor = !!vendorToken;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/', showForAdmin: false },
    { name: 'Search Events', href: '/search', showForAdmin: false },
    { name: 'How It Works', href: '/how-it-works', showForAdmin: false },
    { name: 'FAQ', href: '/faq', showForAdmin: false },
    { name: 'Contact', href: '/contact', showForAdmin: false },
    { name: 'Plans', href: '/plans', showForAdmin: false }
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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50' 
        : 'bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-100'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - Optimized for No Overflow */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-105">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                AIS Signature
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium -mt-0.5">Premium Events</p>
            </div>
          </Link>

          {/* Desktop Navigation - Compact Design */}
          <div className="hidden lg:flex items-center flex-1 justify-center px-4">
            <div className="flex items-center space-x-1 bg-gray-50/80 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-inner">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative px-3 xl:px-4 py-1.5 rounded-full font-medium text-xs xl:text-sm transition-all duration-300 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-white/70'
                  }`}
                >
                  {item.name}
                  {isActive(item.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth Buttons - Compact Design */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
            {/* Guest View - Vendor Buttons */}
            {!isAuthenticated() && !isVendor && (
              <>
                <button
                  onClick={handleVendorDashboardClick}
                  className="relative px-3 xl:px-4 py-2 text-gray-700 font-semibold text-xs xl:text-sm rounded-lg hover:text-indigo-600 transition-all duration-200 hover:bg-gray-50 whitespace-nowrap"
                >
                  Vendor
                </button>

                <Link 
                  to="/vendor-registration"
                  className="group relative px-3 xl:px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold text-xs xl:text-sm rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                    <span className="hidden xl:inline">Partner</span>
                    <span className="xl:hidden">Join</span>
                  </span>
                </Link>
              </>
            )}

            {/* Vendor Profile Menu - Compact */}
            {isVendor ? (
              <div className="relative">
                <button
                  onClick={() => setShowVendorMenu(!showVendorMenu)}
                  className="flex items-center space-x-2 px-2 xl:px-3 py-1.5 xl:py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 border border-transparent hover:border-purple-200 shadow-sm hover:shadow-md"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur opacity-40"></div>
                    <div className="relative w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-xs font-bold">
                        {vendorBusinessName?.charAt(0).toUpperCase() || 'V'}
                      </span>
                    </div>
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-gray-800 truncate max-w-[100px]">{vendorBusinessName || 'Vendor'}</p>
                    <p className="text-[10px] font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Vendor
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showVendorMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Vendor Dropdown - Enhanced */}
                {showVendorMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-[90]" 
                      onClick={() => setShowVendorMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] animate-fadeIn overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 opacity-10"></div>
                      
                      <div className="relative px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{vendorBusinessName || 'Vendor'}</p>
                        <p className="text-xs text-gray-600">{localStorage.getItem('vendorEmail')}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                          Vendor
                        </span>
                      </div>
                      
                      <div className="relative py-1">
                        <button
                          onClick={() => handleVendorMenuClick('/vendor-dashboard')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <LayoutDashboard className="w-4 h-4 text-purple-600" />
                          </div>
                          <span>My Dashboard</span>
                        </button>
                        
                        <button
                          onClick={() => handleVendorMenuClick('/vendor-profile')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Settings className="w-4 h-4 text-purple-600" />
                          </div>
                          <span>Settings</span>
                        </button>
                      </div>
                      
                      <div className="relative border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleVendorLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                            <LogOut className="w-4 h-4 text-red-600" />
                          </div>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : /* User Login/Profile - Compact */
            isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-2 xl:px-3 py-1.5 xl:py-2 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 border border-transparent hover:border-indigo-200 shadow-sm hover:shadow-md"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur opacity-40"></div>
                    <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-xs font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-gray-800 truncate max-w-[100px]">{user?.name}</p>
                    {isAdmin() && (
                      <p className="text-[10px] font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Admin
                      </p>
                    )}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown - Enhanced */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-[90]" 
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] animate-fadeIn overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10"></div>
                      
                      <div className="relative px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                        {isAdmin() && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      
                      <div className="relative py-1">
                        {isAdmin() ? (
                          <button
                            onClick={() => handleUserMenuClick('/admin')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all"
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <Shield className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span>Admin Panel</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserMenuClick('/dashboard')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all"
                          >
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span>My Dashboard</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleUserMenuClick('/profile')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Settings className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span>Settings</span>
                        </button>
                      </div>
                      
                      <div className="relative border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleUserLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                            <LogOut className="w-4 h-4 text-red-600" />
                          </div>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowUserLoginModal(true)}
                className="group relative flex items-center gap-1.5 px-3 xl:px-5 py-2 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold text-xs xl:text-sm rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <UserIcon className="w-4 h-4 xl:w-5 xl:h-5 relative z-10 group-hover:text-white transition-colors" />
                <span className="relative z-10 group-hover:text-white transition-colors">Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button - Compact */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu - Enhanced Design */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-2 animate-fadeIn">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-4 py-3 rounded-xl font-semibold transition-all ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {/* Guest View - Mobile */}
              {!isAuthenticated() && !isVendor && (
                <>
                  <button
                    onClick={handleVendorDashboardClick}
                    className="block w-full px-4 py-3 text-gray-700 font-semibold border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-center"
                  >
                    Vendor Dashboard
                  </button>
                  <Link 
                    to="/vendor-registration"
                    className="block w-full px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all text-center shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Become a Partner
                  </Link>
                </>
              )}

              {/* Vendor Profile - Mobile */}
              {isVendor ? (
                <>
                  <div className="px-4 py-4 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-xl border-2 border-purple-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {vendorBusinessName?.charAt(0).toUpperCase() || 'V'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{vendorBusinessName || 'Vendor'}</p>
                        <p className="text-xs text-gray-600">{localStorage.getItem('vendorEmail')}</p>
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                      Vendor Account
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleVendorMenuClick('/vendor-dashboard')}
                    className="block w-full px-4 py-3 text-left text-gray-700 font-semibold border-2 border-purple-300 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5 inline mr-3" />
                    My Dashboard
                  </button>
                  
                  <button
                    onClick={handleVendorLogout}
                    className="block w-full px-4 py-3 text-red-600 font-semibold border-2 border-red-300 rounded-xl hover:bg-red-50 transition-all text-center"
                  >
                    <LogOut className="w-5 h-5 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : /* User Login/Profile - Mobile */
              isAuthenticated() ? (
                <>
                  <div className="px-4 py-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl border-2 border-indigo-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                    {isAdmin() && (
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full">
                        Admin Account
                      </span>
                    )}
                  </div>
                  
                  {isAdmin() ? (
                    <button
                      onClick={() => handleUserMenuClick('/admin')}
                      className="block w-full px-4 py-3 text-left text-gray-700 font-semibold border-2 border-indigo-300 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    >
                      <Shield className="w-5 h-5 inline mr-3" />
                      Admin Panel
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUserMenuClick('/dashboard')}
                      className="block w-full px-4 py-3 text-left text-gray-700 font-semibold border-2 border-indigo-300 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    >
                      <LayoutDashboard className="w-5 h-5 inline mr-3" />
                      My Dashboard
                    </button>
                  )}
                  
                  <button
                    onClick={handleUserLogout}
                    className="block w-full px-4 py-3 text-red-600 font-semibold border-2 border-red-300 rounded-xl hover:bg-red-50 transition-all text-center"
                  >
                    <LogOut className="w-5 h-5 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowUserLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all text-center shadow-lg"
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
