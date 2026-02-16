import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Phone, Star, Clock, Award, ChevronRight, Briefcase, TrendingUp, CheckCircle } from 'lucide-react';
import InquiryModal from './InquiryModal';
import { useSearch } from '../contexts/SearchContext';

/**
 * VendorCard Component - Professional JustDial/UrbanCompany Style
 * 
 * Displays comprehensive vendor information with all details
 * - Service type, pricing, location, ratings
 * - Professional responsive design
 * - Complete vendor information display
 * - Section-based display (section headers communicate tier)
 */
const VendorCard = ({ 
  vendor, 
  onInquiry, 
  showRating = true, 
  variant = 'default',
  userLocation,
  prefilledEventType = '',
  sectionLabel = null  // Section label from parent (e.g., "In Your Area", "Nearby")
}) => {
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const navigate = useNavigate();
  
  // Access search filters from context
  const { filters } = useSearch();

  const handleInquiryClick = () => {
    if (onInquiry) {
      onInquiry(vendor);
    }
    setShowInquiryModal(true);
  };

  const handleViewDetails = () => {
    // Navigate to vendor profile page
    const vendorId = vendor._id || vendor.id;
    if (vendorId) {
      navigate(`/vendor/${vendorId}`);
    }
  };

  // Format pricing display
  const getPricingDisplay = () => {
    const pricing = vendor.pricing || {};
    if (pricing.min && pricing.max) {
      return {
        range: `₹${(pricing.min / 1000).toFixed(0)}K - ₹${(pricing.max / 1000).toFixed(0)}K`,
        unit: pricing.unit || 'per event'
      };
    }
    if (pricing.average) {
      return {
        range: `₹${(pricing.average / 1000).toFixed(0)}K`,
        unit: pricing.unit || 'per event'
      };
    }
    return { range: 'Contact for pricing', unit: '' };
  };

  // Get service type display
  const getServiceTypeDisplay = () => {
    const serviceType = vendor.serviceType || '';
    return serviceType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  // Get location display
  const getLocationDisplay = () => {
    if (vendor.city && vendor.area) {
      return `${vendor.area}, ${vendor.city}`;
    }
    return vendor.city || vendor.area || 'Location Available';
  };

  const pricing = getPricingDisplay();
  const cardPadding = variant === 'compact' ? 'p-4' : 'p-5';

  return (
    <div
      className={`group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
        variant === 'featured' ? 'ring-2 ring-indigo-400' : ''
      }`}
    >
      {/* Premium Header with Service Type Badge */}
      <div className="relative h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12 blur-2xl"></div>
        </div>

        {/* Rating Badge */}
        {showRating && vendor.rating > 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg flex items-center gap-1 shadow-lg">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-gray-900">{vendor.rating}</span>
            <span className="text-xs text-gray-500">({vendor.reviewCount || 0})</span>
          </div>
        )}

        {/* Featured Badge */}
        {(variant === 'featured' || vendor.isFeatured) && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center gap-1 shadow-lg">
            <Award className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wide">Featured</span>
          </div>
        )}

        {/* Response Time Badge */}
        {vendor.responseTime && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-green-500/90 backdrop-blur-sm rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-white" />
            <span className="text-xs font-semibold text-white">{vendor.responseTime}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className={cardPadding}>
        {/* Vendor Name & Verification */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 flex-1">
            {vendor.name}
          </h3>
          {vendor.verified && (
            <span className="flex-shrink-0 p-1 bg-green-100 text-green-700 rounded-full" title="Verified Vendor">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>

        {/* Service Type Badge - PROMINENT */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-700">
              {getServiceTypeDisplay()}
            </span>
          </div>
        </div>

        {/* Business Info */}
        {vendor.businessName && vendor.businessName !== vendor.name && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-1">
            {vendor.businessName}
          </p>
        )}

        {/* Key Stats Row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Experience */}
          {vendor.yearsInBusiness > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-blue-50 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-blue-900">{vendor.yearsInBusiness}+ years</span>
            </div>
          )}
          
          {/* Bookings */}
          {vendor.totalBookings > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-purple-50 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-purple-900">{vendor.totalBookings}+ events</span>
            </div>
          )}
        </div>

        {/* Location - PROMINENT */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="font-medium line-clamp-1">{getLocationDisplay()}</span>
        </div>

        {/* Budget Range - PROMINENT with Better Display */}
        <div className="mb-4 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Pricing</span>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-green-700">
                {pricing.range}
              </div>
              {pricing.unit && (
                <div className="text-xs text-gray-600">{pricing.unit}</div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {vendor.description && (
          <p className="text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {vendor.description}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 my-3"></div>

        {/* Action Buttons - Professional & Responsive */}
        <div className="flex gap-2">
          <button
            onClick={handleInquiryClick}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-lg hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Send Inquiry</span>
          </button>

          <button
            onClick={handleViewDetails}
            className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-all flex items-center justify-center"
            title="View Details"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Additional Footer Info */}
        {(vendor.completedBookings > 0 || vendor.responseRate > 0) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              {vendor.completedBookings > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {vendor.completedBookings} completed
                </span>
              )}
              {vendor.responseRate > 0 && (
                <span className="font-medium text-green-600">
                  {vendor.responseRate}% response rate
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        vendor={vendor}
        userLocation={userLocation}
        prefilledEventType={prefilledEventType}
        searchFilters={filters}
      />
    </div>
  );
};

export default VendorCard;
