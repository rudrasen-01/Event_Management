import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import NotFound from './components/NotFound';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { SearchProvider } from './contexts/SearchContext';
import { AuthProvider } from './contexts/AuthContext';

// Page imports
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import SearchResultsFunnel from './pages/SearchResultsFunnel';
import DynamicSearchPage from './pages/DynamicSearchPage';
import SearchEventsPage from './pages/SearchEventsPage';
import VendorRegistrationMultiStep from './pages/VendorRegistrationMultiStep';
import VendorDashboard from './pages/VendorDashboard';
import AdminPanel from './pages/AdminPanel';
import UserDashboardNew from './pages/UserDashboardNew';
import About from './pages/About';
import HowItWorksPage from './pages/HowItWorks';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import PlansPage from './pages/PlansPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <ScrollToTop />
          <div className="App min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 page-transition pt-4 sm:pt-6 md:pt-8">
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
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                
                {/* Optional User Dashboard - accessible if user wants to see profile/inquiries */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['user', 'admin']}>
                      <UserDashboardNew />
                    </ProtectedRoute>
                  } 
                />
                
                {/* User Dashboard (Profile & Inquiries) */}
                <Route 
                  path="/user/dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['user', 'admin']}>
                      <UserDashboardNew />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Panel - Production Version with All Features */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Vendor routes - separate from user/admin authentication */}
                <Route path="/vendor-registration" element={<VendorRegistrationMultiStep />} />
                <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                
                {/* Catch all route - 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
