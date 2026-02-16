import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import VendorLayout from './components/VendorLayout';
import ToastContainer from './components/Toast';
import NotFound from './components/NotFound';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import VendorProtectedRoute from './components/VendorProtectedRoute';
import NavigationGuard from './components/NavigationGuard';
import { SearchProvider } from './contexts/SearchContext';
import { AuthProvider } from './contexts/AuthContext';
import { VendorAuthProvider, useVendorAuth } from './contexts/VendorAuthContext';

// Page imports
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import SearchResultsFunnel from './pages/SearchResultsFunnel';
import DynamicSearchPage from './pages/DynamicSearchPage';
import SearchEventsPage from './pages/SearchEventsPage';
import VendorRegistrationNew from './pages/VendorRegistrationNew';
import VendorDashboard from './pages/VendorDashboard';
import VendorProfilePage from './pages/VendorProfilePage';
import VendorProfileDashboard from './pages/VendorProfileDashboard';
import VendorSettings from './pages/VendorSettings';
import AdminPanel from './pages/AdminPanel';
import UserDashboardNew from './pages/UserDashboardNew';
import About from './pages/About';
import HowItWorksPage from './pages/HowItWorks';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import CookiePolicy from './pages/CookiePolicy';
import PlansPage from './pages/PlansPage';
import WhatsAppButton from './components/WhatsAppButton';

// PublicLayout component
const PublicLayout = () => (
  <div className="App min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 page-transition pt-16 sm:pt-20">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchEventsPage />} />
        <Route path="/search-funnel" element={<SearchResultsFunnel />} />
        <Route path="/search-dynamic" element={<DynamicSearchPage />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/terms-and-conditions" element={<Terms />} />
        
        {/* Public Vendor Registration */}
        <Route path="/vendor-registration" element={<VendorRegistrationNew />} />
        
        {/* Public Vendor Profile Page */}
        <Route path="/vendor/:vendorId" element={<VendorProfilePage />} />
        
        {/* Protected User Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <UserDashboardNew />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <UserDashboardNew />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Admin Panel */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect vendor routes to homepage if not logged in */}
        <Route path="/vendor-dashboard" element={<Navigate to="/" replace />} />
        <Route path="/vendor-profile-dashboard" element={<Navigate to="/" replace />} />
        <Route path="/vendor-settings" element={<Navigate to="/" replace />} />
        
        {/* Catch all route - 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
    <ToastContainer />
    <WhatsAppButton />
  </div>
);

// AppRoutes component
const AppRoutes = () => {
  const { vendor, vendorToken } = useVendorAuth();
  const isVendor = !!(vendor && vendorToken);

  return (
    <>
      <NavigationGuard />
      <ScrollToTop />
      {isVendor ? (
        // Vendor Panel - Isolated Experience
        <Routes>
          <Route element={<VendorLayout />}>
            <Route path="/vendor-dashboard" element={<VendorProtectedRoute><VendorDashboard /></VendorProtectedRoute>} />
            <Route path="/vendor-profile-dashboard" element={<VendorProtectedRoute><VendorProfileDashboard /></VendorProtectedRoute>} />
            <Route path="/vendor-settings" element={<VendorProtectedRoute><VendorSettings /></VendorProtectedRoute>} />
            {/* Redirect all other routes to vendor dashboard */}
            <Route path="*" element={<Navigate to="/vendor-dashboard" replace />} />
          </Route>
        </Routes>
      ) : (
        // Public Site - Customer Experience
        <PublicLayout />
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <VendorAuthProvider>
          <SearchProvider>
            <AppRoutes />
          </SearchProvider>
        </VendorAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
