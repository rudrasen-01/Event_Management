/**
 * AUTOCOMPLETE INTEGRATION EXAMPLE
 * 
 * This file shows how to integrate SearchAutocomplete into your existing pages
 * Copy the code you need and adapt it to your use case
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchAutocomplete from '../components/SearchAutocomplete';

// ============================================
// EXAMPLE 1: Simple Hero Section Search
// ============================================

export function SimpleHeroSearch() {
  const navigate = useNavigate();

  const handleSelect = (suggestion) => {
    // Navigate to search results with selected service
    navigate(`/search?service=${suggestion.taxonomyId}&name=${encodeURIComponent(suggestion.label)}`);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-12 rounded-2xl">
      <h1 className="text-4xl font-bold text-white mb-4">
        Find Your Perfect Event Service
      </h1>
      <p className="text-lg text-white/90 mb-8">
        Search from 100+ categories • 10,000+ verified vendors
      </p>
      
      <SearchAutocomplete
        onSelect={handleSelect}
        placeholder="Search for photographers, venues, caterers..."
        className="max-w-3xl mx-auto"
      />
    </div>
  );
}

// ============================================
// EXAMPLE 2: Navbar Search (Compact)
// ============================================

export function NavbarSearch() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = (suggestion) => {
    navigate(`/vendors?service=${suggestion.taxonomyId}`);
    setIsExpanded(false);
  };

  return (
    <div className="relative">
      {/* Mobile: Show icon, expand on click */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
      >
        🔍
      </button>

      {/* Desktop: Always expanded */}
      <div className={`
        ${isExpanded ? 'block' : 'hidden'} lg:block
        absolute lg:relative top-12 lg:top-0 right-0 lg:right-auto
        w-80 lg:w-96 z-50
      `}>
        <SearchAutocomplete
          onSelect={handleSelect}
          placeholder="Quick search..."
          maxSuggestions={8}
          debounceMs={200}
          showIcon={true}
        />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Replace Existing EventSearch
// ============================================

export function EnhancedEventSearch() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    { label: 'Wedding Photographer', icon: '📸', taxonomyId: 'wedding-photographer' },
    { label: 'Banquet Halls', icon: '🏛️', taxonomyId: 'banquet-halls' },
    { label: 'DJ Services', icon: '🎵', taxonomyId: 'dj-services' }
  ]);

  const handleAutocompleteSelect = (suggestion) => {
    setSelectedService(suggestion);
    
    // Save to recent searches (localStorage)
    const recent = [suggestion, ...recentSearches.slice(0, 4)];
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  };

  const handleSearch = () => {
    if (selectedService) {
      const params = new URLSearchParams({
        service: selectedService.taxonomyId,
        type: selectedService.type
      });
      
      if (selectedCity) {
        params.append('city', selectedCity);
      }

      navigate(`/vendors?${params.toString()}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-12 rounded-3xl shadow-2xl">
        <h1 className="text-5xl font-bold text-white mb-3">
          Find Your Perfect Event Service
        </h1>
        <p className="text-xl text-white/90 mb-8">
          India's largest event marketplace • 10,000+ verified vendors
        </p>

        {/* Search Bar with Autocomplete */}
        <div className="bg-white rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[1fr,300px,auto] gap-4 items-end">
            {/* Service Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What service do you need?
              </label>
              <SearchAutocomplete
                onSelect={handleAutocompleteSelect}
                placeholder="Photographer, DJ, Venue..."
                showIcon={true}
              />
            </div>

            {/* City Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!selectedService}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Search
            </button>
          </div>

          {/* Selected Service Display */}
          {selectedService && (
            <div className="mt-4">
              <span className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-2xl">{selectedService.icon}</span>
                <span className="text-sm text-gray-700">
                  <strong>{selectedService.label}</strong>
                  <span className="text-gray-500 ml-2">({selectedService.type})</span>
                </span>
                <button
                  onClick={() => setSelectedService(null)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mt-6 max-w-4xl mx-auto">
            <p className="text-white/80 text-sm mb-3">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleAutocompleteSelect(item)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm transition-colors"
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats or Features Section */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-bold text-lg mb-1">10,000+</h3>
          <p className="text-gray-600 text-sm">Verified Vendors</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-2">⭐</div>
          <h3 className="font-bold text-lg mb-1">50,000+</h3>
          <p className="text-gray-600 text-sm">Happy Reviews</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="font-bold text-lg mb-1">123</h3>
          <p className="text-gray-600 text-sm">Service Types</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-2">🇮🇳</div>
          <h3 className="font-bold text-lg mb-1">50+</h3>
          <p className="text-gray-600 text-sm">Cities Covered</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Dashboard Filter Panel
// ============================================

export function DashboardSearchFilter() {
  const [filters, setFilters] = useState({
    service: null,
    city: '',
    budget: { min: 0, max: 1000000 }
  });

  const handleServiceSelect = (suggestion) => {
    setFilters(prev => ({
      ...prev,
      service: suggestion
    }));
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    // Apply filters to your vendor list
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        🔍 Search Filters
      </h3>

      <div className="space-y-4">
        {/* Service Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Service Type
          </label>
          <SearchAutocomplete
            onSelect={handleServiceSelect}
            placeholder="Search services..."
            maxSuggestions={10}
          />
          
          {filters.service && (
            <div className="mt-2 bg-gray-50 px-3 py-2 rounded-lg flex items-center justify-between">
              <span className="text-sm">
                {filters.service.icon} {filters.service.label}
              </span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, service: null }))}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Other Filters */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Budget Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.budget.min}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                budget: { ...prev.budget, min: parseInt(e.target.value) || 0 }
              }))}
              placeholder="Min"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              value={filters.budget.max}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                budget: { ...prev.budget, max: parseInt(e.target.value) || 0 }
              }))}
              placeholder="Max"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={applyFilters}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Modal Search
// ============================================

export function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleSelect = (suggestion) => {
    navigate(`/vendors?service=${suggestion.taxonomyId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Quick Search</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
          
          <SearchAutocomplete
            onSelect={handleSelect}
            placeholder="Search for any service..."
            autoFocus={true}
          />
        </div>

        {/* Popular Searches */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">POPULAR SEARCHES</h3>
          <div className="grid grid-cols-2 gap-2">
            {['Wedding Photographer', 'Banquet Hall', 'Bridal Makeup', 'DJ', 'Caterer', 'Decorator'].map((item, i) => (
              <button
                key={i}
                onClick={() => handleSelect({ label: item, taxonomyId: item.toLowerCase().replace(/\s+/g, '-') })}
                className="text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// USAGE IN YOUR APP
// ============================================

/*
// In App.jsx or main component:
import { SimpleHeroSearch, NavbarSearch, EnhancedEventSearch } from './examples/autocomplete-examples';

function App() {
  return (
    <div>
      <NavbarSearch />
      <EnhancedEventSearch />
    </div>
  );
}
*/
