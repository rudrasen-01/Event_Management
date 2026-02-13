import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, MapPin, DollarSign, Sliders, X } from 'lucide-react';

const FilterPanel = ({ onFilter, userLocation }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    mainCategory: '',
    subService: '',
    budgetMin: 0,
    budgetMax: 100000,
    radius: 10,
  });

  // Main event categories (5 main buckets)
  const mainCategories = {
    'Personal & Social': [
      'Wedding & Pre-Wedding',
      'Birthday Party',
      'Anniversary',
      'Engagement',
      'Baby Shower',
      'Reunion'
    ],
    'Corporate': [
      'Corporate Meeting',
      'Conference',
      'Team Building',
      'Product Launch',
      'Award Ceremony',
      'Trade Show'
    ],
    'Public & Entertainment': [
      'Concert',
      'Festival',
      'Exhibition',
      'Sports Event',
      'Charity Event',
      'Community Event'
    ],
    'Religious & Cultural': [
      'Religious Ceremony',
      'Cultural Festival',
      'Temple Event',
      'Church Event',
      'Mosque Event',
      'Traditional Celebration'
    ],
    'Digital/Hybrid': [
      'Virtual Event',
      'Webinar',
      'Hybrid Conference',
      'Online Workshop',
      'Live Streaming Event',
      'Digital Product Launch'
    ]
  };

  // Vendor categories (12 types)
  const vendorCategories = [
    'All Services',
    'Catering',
    'Decoration',
    'Photography & Videography',
    'Entertainment & DJ',
    'Technical & AV Equipment',
    'Venue',
    'Event Planning',
    'Transportation',
    'Invitations & Printing',
    'Makeup & Styling',
    'Security Services',
    'Gift & Favors'
  ];

  // Get sub-services based on selected main category
  const getSubServices = () => {
    if (!filters.mainCategory) return [];
    return mainCategories[filters.mainCategory] || [];
  };

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      
      // Reset sub-service when main category changes
      if (field === 'mainCategory') {
        newFilters.subService = '';
      }
      
      return newFilters;
    });
  };

  // Handle search
  const handleSearch = () => {
    onFilter({
      ...filters,
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude
    });
  };

  // Reset filters
  const handleReset = () => {
    setFilters({
      mainCategory: '',
      subService: '',
      budgetMin: 0,
      budgetMax: 100000,
      radius: 10,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Mobile Toggle Header */}
      {isMobile && (
        <div
          className="flex items-center justify-between p-4 cursor-pointer border-b border-gray-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>
          {isOpen ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">Find Your Perfect Vendor</h2>
            </div>
          </div>
        </div>
      )}

      {/* Filter Content */}
      {isOpen && (
        <div className="p-6 space-y-6">
          {/* Main Event Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              Event Category
            </label>
            <div className="relative">
              <select
                value={filters.mainCategory}
                onChange={(e) => handleFilterChange('mainCategory', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer transition-all hover:bg-gray-100 text-gray-700 font-medium"
              >
                <option value="">Select Event Type</option>
                {Object.keys(mainCategories).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Sub-Service (Event Specific) */}
          {filters.mainCategory && (
            <div className="space-y-2 animate-fadeIn">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Specific Event
              </label>
              <div className="relative">
                <select
                  value={filters.subService}
                  onChange={(e) => handleFilterChange('subService', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer transition-all hover:bg-gray-100 text-gray-700 font-medium"
                >
                  <option value="">Select Specific Event</option>
                  {getSubServices().map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Vendor Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-2 h-2 bg-pink-600 rounded-full"></span>
              Vendor Service
            </label>
            <div className="relative">
              <select
                value={filters.vendorCategory}
                onChange={(e) => handleFilterChange('vendorCategory', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none cursor-pointer transition-all hover:bg-gray-100 text-gray-700 font-medium"
              >
                {vendorCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <DollarSign className="w-4 h-4 text-green-600" />
              Budget Range
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
                  <input
                    type="number"
                    value={filters.budgetMin}
                    onChange={(e) => handleFilterChange('budgetMin', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                    placeholder="₹0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
                  <input
                    type="number"
                    value={filters.budgetMax}
                    onChange={(e) => handleFilterChange('budgetMax', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                    placeholder="₹100,000"
                  />
                </div>
              </div>
              
              {/* Budget Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="5000"
                  value={filters.budgetMax}
                  onChange={(e) => handleFilterChange('budgetMax', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>₹{filters.budgetMin.toLocaleString()}</span>
                  <span>₹{filters.budgetMax.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Radius */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MapPin className="w-4 h-4 text-blue-600" />
              Search Radius
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={filters.radius}
                  onChange={(e) => handleFilterChange('radius', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex items-center gap-1 min-w-[80px] px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="font-bold text-blue-700">{filters.radius}</span>
                  <span className="text-sm text-blue-600">km</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleSearch}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Search className="w-5 h-5" />
              Search Vendors
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all"
            >
              Reset
            </button>
          </div>

          {/* Info Text */}
          {userLocation && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Searching near your location: {userLocation.latitude?.toFixed(4)}, {userLocation.longitude?.toFixed(4)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
