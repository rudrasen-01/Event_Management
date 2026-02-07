import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, X, ChevronDown, ChevronRight, ChevronUp,
  Star, Shield, IndianRupee, Calendar, Home, Loader2, Crosshair, ArrowRight, SlidersHorizontal
} from 'lucide-react';
import VendorCard from '../components/VendorCard';
import { fetchVendors } from '../services/api';
import { fetchServiceTypes, fetchCities } from '../services/dynamicDataService';
import { formatCurrency } from '../utils/format';
import { AREAS_BY_CITY } from '../utils/constants';
import { getSuggestedServices } from '../services/filterService';
import { useSearch } from '../contexts/SearchContext';
import SearchAutocomplete from '../components/SearchAutocomplete';

const SearchEventsPage = () => {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedArea,
    setSelectedArea,
    location,
    filters,
    updateFilter,
    updateFilters,
    sortBy,
    setSortBy,
    isLocating,
    setIsLocating,
    locationStatus,
    setLocationStatus,
    showSuggestions,
    setShowSuggestions,
    suggestions,
    setSuggestions,
    activeFiltersCount,
    clearAllFilters,
    updateLocation
  } = useSearch();
  
  // Local state for vendors and UI
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalVendors, setTotalVendors] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    eventType: true,
    budget: true,
    location: true,
    rating: true,
    services: true,
    verified: true
  });
  
  // Dynamic data from database
  const [serviceTypes, setServiceTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);
  
  // Location dropdown states
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  // Load dynamic filter data on mount
  useEffect(() => {
    const loadFilterData = async () => {
      setLoadingFilters(true);
      try {
        const [servicesData, citiesData] = await Promise.all([
          fetchServiceTypes(),
          fetchCities()
        ]);
        setServiceTypes(servicesData);
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoadingFilters(false);
      }
    };
    
    loadFilterData();
  }, []);

  // Debounce timer ref for search query
  const searchDebounceTimer = useRef(null);
  const suggestionDebounceTimer = useRef(null);
  const isInitialMount = useRef(true);
  const [liveVendorSuggestions, setLiveVendorSuggestions] = useState([]);

  // Memoized load vendors function
  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build comprehensive search filters
      const searchFilters = {
        query: searchQuery?.trim() || undefined,
        city: selectedCity || location || undefined,
        area: selectedArea || undefined,
        serviceType: normalizeServiceType(filters.eventCategory),
        budgetMin: filters.budgetMin && filters.budgetMin > 0 ? filters.budgetMin : undefined,
        budgetMax: filters.budgetMax && filters.budgetMax < 10000000 ? filters.budgetMax : undefined,
        radius: filters.radius || 10,
        rating: filters.rating || undefined,
        verified: filters.verified,
        sortBy: sortBy || 'relevance',
        page: 1,
        limit: 30
      };
      
      const response = await fetchVendors(searchFilters);
      
      // Use only database-driven results - no mock data fallback
      const vendorsList = response.vendors || [];
      
      setVendors(vendorsList);
      setTotalVendors(response.total || vendorsList.length);
    } catch (error) {
      console.error('❌ Error loading vendors:', error);
      // Show empty state on error - no mock data
      setVendors([]);
      setTotalVendors(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCity, selectedArea, filters, sortBy]); // Removed 'location' to avoid circular dependency

  // Debounced search for text query
  useEffect(() => {
    // Skip debounce on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadVendors();
      return;
    }

    // Clear previous timer
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    // If search query changed, debounce it
    if (searchQuery !== undefined) {
      searchDebounceTimer.current = setTimeout(() => {
        loadVendors();
      }, 500); // 500ms debounce for search query
    }

    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Live suggestions for search query (faster debounce)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setLiveVendorSuggestions([]);
      setSuggestions([]);
      return;
    }

    // Clear previous timer
    if (suggestionDebounceTimer.current) {
      clearTimeout(suggestionDebounceTimer.current);
    }

    suggestionDebounceTimer.current = setTimeout(async () => {
      try {
        // Fetch intelligent suggestions from database
        const dbSuggestions = await fetchSearchSuggestions(searchQuery.trim(), 8);
        
        // Also get service type suggestions from filter service
        const serviceSuggestions = getSuggestedServices(searchQuery.trim());
        
        // Combine and deduplicate
        const combined = [...dbSuggestions, ...serviceSuggestions];
        const unique = combined.filter((item, index, self) =>
          index === self.findIndex((t) => t.text === item.text)
        );
        
        setSuggestions(serviceSuggestions);
        setLiveVendorSuggestions(dbSuggestions.filter(s => s.type === 'vendor'));
      } catch (error) {
        console.log('Suggestion fetch error (non-critical):', error);
        // Fallback to local suggestions
        const localSuggestions = getSuggestedServices(searchQuery.trim());
        setSuggestions(localSuggestions);
        setLiveVendorSuggestions([]);
      }
    }, 300); // 300ms for suggestions (faster than full search)

    return () => {
      if (suggestionDebounceTimer.current) {
        clearTimeout(suggestionDebounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Immediate load for filter changes (no debounce)
  useEffect(() => {
    if (!isInitialMount.current) {
      loadVendors();
    }
  }, [filters, sortBy, selectedCity, selectedArea, loadVendors]);

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
    // Close mobile filter after selection
    if (window.innerWidth < 1024) {
      setTimeout(() => setShowFilters(false), 300);
    }
  };

  // Batch update for budget range (prevents double render)
  const handleBudgetRangeChange = (min, max) => {
    updateFilters({ budgetMin: min, budgetMax: max });
    // Close mobile filter after selection
    if (window.innerWidth < 1024) {
      setTimeout(() => setShowFilters(false), 300);
    }
  };

  const updateURL = (newFilters) => {
    // URL sync is now handled by the context
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadVendors();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city.name);
    setSelectedArea('');
    updateLocation(city.name, '');
    setShowCityDropdown(false);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    updateLocation(selectedCity, area);
    setShowAreaDropdown(false);
  };

  const handleLocate = () => {
    if (!navigator?.geolocation) {
      setLocationStatus('Location is not supported on this browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          setLocationStatus('Fetching address details...');
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          
          const data = await response.json();
          const address = data.address || {};
          
          const city = address.city || address.town || address.village || address.state_district || 'Unknown City';
          const area = address.suburb || address.neighbourhood || address.quarter || address.road || '';
          
          let locationString = '';
          if (area && city) {
            locationString = `${area}, ${city}`;
          } else if (city) {
            locationString = city;
          } else {
            locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }
          
          updateLocation(city, area);
          setSelectedCity(city);
          setSelectedArea(area);
          
          setLocationStatus(`✓ Location: ${locationString}`);
          setIsLocating(false);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          updateLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, '');
          setLocationStatus('Location detected (address lookup failed)');
          setIsLocating(false);
        }
      },
      (error) => {
        setLocationStatus(error.message || 'Unable to fetch location');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const availableAreas = selectedCity ? (AREAS_BY_CITY[selectedCity] || []) : [];

  // Normalize service type for better matching
  const normalizeServiceType = (serviceType) => {
    if (!serviceType) return undefined;
    
    // Convert to lowercase and get base word
    const normalized = serviceType.toLowerCase().trim();
    
    // Service type aliases - map UI terms to database terms
    const aliases = {
      // Photography variations
      'photo': 'photograph',  // Partial match will work
      'photographer': 'photograph',
      'photography': 'photograph',
      
      // Videography variations
      'video': 'videograph',
      'videographer': 'videograph',
      'videography': 'videograph',
      
      // Catering variations
      'caterer': 'cater',
      'catering': 'cater',
      
      // DJ variations
      'dj': 'dj',
      'disc jockey': 'dj',
      
      // Makeup variations
      'makeup': 'makeup',
      'makeup artist': 'makeup',
      'mua': 'makeup',
      
      // Decoration variations
      'decorator': 'decorat',
      'decoration': 'decorat',
      'decor': 'decorat',
      
      // Planner variations
      'planner': 'planner',
      'wedding planner': 'wedding_planner',
      'event planner': 'planner',
      
      // Venue variations
      'venue': 'venue',
      'hall': 'venue',
      'banquet': 'banquet',
      
      // Mehendi variations
      'mehendi': 'mehendi',
      'mehndi': 'mehendi',
      'henna': 'mehendi',
      
      // Band variations
      'band': 'band',
      'music band': 'band',
      
      // Anchor variations
      'anchor': 'anchor',
      'emcee': 'anchor',
      'mc': 'anchor',
      
      // Choreography variations
      'choreography': 'choreograph',
      'choreographer': 'choreograph',
      'dance': 'choreograph',
      
      // Lighting variations
      'lighting': 'light',
      'lights': 'light',
      
      // Sound variations
      'sound system': 'sound',
      'sound': 'sound',
      'audio': 'sound'
    };
    
    // Check if it's an alias, otherwise return normalized version
    return aliases[normalized] || normalized;
  };

  const popularSearches = [
    { text: 'Wedding Venues', icon: '🏛️' },
    { text: 'Birthday Party Planners', icon: '🎉' },
    { text: 'Corporate Event Venues', icon: '💼' },
    { text: 'Wedding Photographers', icon: '📸' },
    { text: 'Catering Services', icon: '🍽️' },
    { text: 'DJ for Events', icon: '🎧' },
    { text: 'Banquet Halls', icon: '🏛️' },
    { text: 'Event Decorators', icon: '🎨' }
  ];

  // Removed: static serviceTypes array - now using dynamic state from API

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'price-low', label: 'Price -- Low to High' },
    { value: 'price-high', label: 'Price -- High to Low' },
    { value: 'rating', label: 'Rating' },
    { value: 'distance', label: 'Nearest First' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Search Bar */}
      <div className="bg-white border-b sticky top-16 md:top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <div className="flex-1 order-1">
              <SearchAutocomplete
                onSelect={(suggestion) => {
                  setSearchQuery(suggestion.label);
                  if (suggestion.taxonomyId) {
                    updateFilter('serviceId', suggestion.taxonomyId);
                  }
                  setShowSuggestions(false);
                }}
                onInputChange={(value) => {
                  setSearchQuery(value);
                }}
                placeholder="Search for event services, venues, photographers..."
                showIcon={true}
                debounceMs={200}
                maxSuggestions={15}
              />
            </div>
            {/* Location Input with City/Area Dropdowns */}
            <div className="w-full sm:w-80 relative flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-sm bg-white order-2">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              
              {/* City Dropdown */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                  placeholder="Select City"
                  className="w-full text-sm focus:outline-none bg-transparent"
                />
                
                {showCityDropdown && !loadingFilters && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-300 rounded shadow-xl z-[100] max-h-64 overflow-y-auto">
                    {cities
                      .filter(city => !selectedCity || city.name.toLowerCase().includes(selectedCity.toLowerCase()))
                      .map((city) => (
                        <button
                          key={city.name}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleCitySelect(city);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="text-sm font-medium text-gray-900">{city.name}</div>
                          <div className="text-xs text-gray-500">{city.state} {city.count && `(${city.count})`}</div>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Area Dropdown - Only show if city is selected */}
              {selectedCity && (
                <>
                  <span className="text-gray-400">|</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={selectedArea}
                      onChange={(e) => {
                        setSelectedArea(e.target.value);
                        setShowAreaDropdown(true);
                      }}
                      onFocus={() => setShowAreaDropdown(true)}
                      onBlur={() => setTimeout(() => setShowAreaDropdown(false), 200)}
                      placeholder="Select Area"
                      className="w-full text-sm focus:outline-none bg-transparent"
                    />
                    
                    {showAreaDropdown && availableAreas.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-300 rounded shadow-xl z-[100] max-h-64 overflow-y-auto">
                        {availableAreas
                          .filter(area => !selectedArea || area.toLowerCase().includes(selectedArea.toLowerCase()))
                          .map((area) => (
                            <button
                              key={area}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleAreaSelect(area);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-blue-50 text-sm text-gray-900 border-b border-gray-100 last:border-b-0"
                            >
                              {area}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <button 
                type="button"
                onClick={handleLocate} 
                className="text-blue-600 hover:text-blue-700 transition-colors"
                title="Use my location"
              >
                <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <button 
              type="submit"
              className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white rounded-sm font-medium text-sm
                       hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-blue-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Home
            </button>
            <ChevronRight className="w-3 h-3" />
            <span>Event Services</span>
            {filters.eventCategory && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-900 font-medium">{filters.eventCategory}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full mb-3 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center gap-2 font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>

        <div className="flex gap-4">
          {/* Left Sidebar - Filters */}
          <aside 
            className={`${
              showFilters ? 'fixed inset-0 z-50 bg-black bg-opacity-50 lg:bg-transparent' : 'hidden'
            } lg:block lg:relative lg:w-64 lg:flex-shrink-0`}
            onClick={(e) => {
              if (e.target === e.currentTarget && window.innerWidth < 1024) {
                setShowFilters(false);
              }
            }}
          >
            <div className={`${
              showFilters ? 'fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] overflow-y-auto' : ''
            } bg-white lg:rounded-sm lg:border lg:border-gray-200 lg:sticky lg:top-20 h-full lg:h-auto`}>
              {/* Filters Header */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-base sm:text-sm text-gray-900">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{activeFiltersCount} filters applied</span>
                  {activeFiltersCount > 0 && (
                    <button 
                      onClick={clearAllFilters}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium uppercase"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
                {/* Service Type Filter */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('eventType')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Service Type</span>
                    {expandedSections.eventType ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.eventType && (
                    <div className="px-4 pb-3 space-y-2 max-h-80 overflow-y-auto">
                      {loadingFilters ? (
                        <div className="text-center py-3">
                          <Loader2 className="w-5 h-5 animate-spin inline-block text-blue-600" />
                        </div>
                      ) : serviceTypes.length > 0 ? (
                        serviceTypes.map(service => (
                          <label key={service.value} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="serviceType"
                              checked={filters.eventCategory === service.value}
                              onChange={() => handleFilterChange('eventCategory', service.value)}
                              className="w-3.5 h-3.5 text-blue-600 focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                              {service.label}
                              {service.count > 0 && <span className="text-xs text-gray-500 ml-1">({service.count})</span>}
                            </span>
                          </label>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-2">No services available</div>
                      )}
                      {filters.eventCategory && (
                        <button
                          onClick={() => handleFilterChange('eventCategory', '')}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Budget Range Filter */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('budget')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Budget</span>
                    {expandedSections.budget ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.budget && (
                    <div className="px-4 pb-3 space-y-3">
                      <div className="space-y-2">
                        {[
                          { label: 'Under ₹1 Lakh', min: 0, max: 100000 },
                          { label: '₹1L - ₹3L', min: 100000, max: 300000 },
                          { label: '₹3L - ₹5L', min: 300000, max: 500000 },
                          { label: '₹5L - ₹10L', min: 500000, max: 1000000 },
                          { label: 'Above ₹10L', min: 1000000, max: 10000000 }
                        ].map((range) => (
                          <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="budgetRange"
                              checked={filters.budgetMin === range.min && filters.budgetMax === range.max}
                              onChange={() => handleBudgetRangeChange(range.min, range.max)}
                              className="w-3.5 h-3.5 text-blue-600 focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{range.label}</span>
                          </label>
                        ))}
                      </div>
                      
                      {/* Custom Range */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-600 mb-2">Custom Range</div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            value={filters.budgetMin || ''}
                            onChange={(e) => handleFilterChange('budgetMin', parseInt(e.target.value) || 0)}
                            placeholder="Min"
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs
                                     focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="number"
                            value={filters.budgetMax === 10000000 ? '' : filters.budgetMax}
                            onChange={(e) => handleFilterChange('budgetMax', parseInt(e.target.value) || 10000000)}
                            placeholder="Max"
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs
                                     focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Radius */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('location')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Search Radius</span>
                    {expandedSections.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.location && (
                    <div className="px-4 pb-3">
                      <div className="space-y-2">
                        {[5, 10, 25, 50, 100].map(km => (
                          <label key={km} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="radius"
                              checked={filters.radius === km}
                              onChange={() => handleFilterChange('radius', km)}
                              className="w-3.5 h-3.5 text-blue-600 focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">Within {km} km</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating Filter */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('rating')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Rating</span>
                    {expandedSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.rating && (
                    <div className="px-4 pb-3 space-y-2">
                      {['4.5', '4.0', '3.5', '3.0'].map(rating => (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="rating"
                            checked={filters.rating === rating}
                            onChange={() => handleFilterChange('rating', rating)}
                            className="w-3.5 h-3.5 text-blue-600 focus:ring-1 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{rating}</span>
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm text-gray-500">& above</span>
                          </div>
                        </label>
                      ))}
                      {filters.rating && (
                        <button
                          onClick={() => handleFilterChange('rating', '')}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Verified Vendors */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleSection('verified')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">More Options</span>
                    {expandedSections.verified ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.verified && (
                    <div className="px-4 pb-3">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.verified === true}
                          onChange={(e) => handleFilterChange('verified', e.target.checked || undefined)}
                          className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-1 focus:ring-blue-500"
                        />
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">Verified Vendors Only</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content - Results */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="bg-white rounded-sm border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-xs sm:text-sm text-gray-600">
                    Showing {loading ? '...' : `1 – ${Math.min(vendors.length, totalVendors)} of ${totalVendors}`} results for 
                    <span className="font-semibold text-gray-900">
                      {searchQuery ? ` "${searchQuery}"` : ' Event Services'}
                    </span>
                    {location && <span className="text-gray-600"> in {location}</span>}
                  </h1>
                </div>
                <div className="w-full flex items-center gap-2">
                  <span className="hidden sm:inline text-xs sm:text-sm text-gray-600">Sort:</span>
                  {/* Mobile: Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sm:hidden w-full mt-1 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {/* Desktop: Inline buttons */}
                  <div className="hidden sm:flex items-center gap-1">
                    {sortOptions.map((option, index) => (
                      <React.Fragment key={option.value}>
                        <button
                          onClick={() => setSortBy(option.value)}
                          className={`px-2 lg:px-3 py-1.5 text-xs lg:text-sm rounded-sm transition-colors whitespace-nowrap ${
                            sortBy === option.value
                              ? 'text-blue-600 font-semibold'
                              : 'text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          {option.label}
                        </button>
                        {index < sortOptions.length - 1 && (
                          <span className="text-gray-300">|</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 uppercase font-semibold">Applied:</span>
                    {filters.eventCategory && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        <Calendar className="w-3 h-3" />
                        {filters.eventCategory}
                        <button onClick={() => handleFilterChange('eventCategory', '')} className="ml-1 hover:text-gray-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        <Shield className="w-3 h-3" />
                        Verified
                        <button onClick={() => handleFilterChange('verified', false)} className="ml-1 hover:text-gray-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.rating && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        <Star className="w-3 h-3" />
                        {filters.rating}+
                        <button onClick={() => handleFilterChange('rating', '')} className="ml-1 hover:text-gray-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {(filters.budgetMin > 0 || filters.budgetMax < 10000000) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        <IndianRupee className="w-3 h-3" />
                        {formatCurrency(filters.budgetMin)} - {formatCurrency(filters.budgetMax)}
                        <button onClick={() => {
                          handleFilterChange('budgetMin', 0);
                          handleFilterChange('budgetMax', 10000000);
                        }} className="ml-1 hover:text-gray-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-sm border border-gray-200">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Searching for vendors...</p>
              </div>
            ) : vendors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {vendors.map((vendor) => (
                  <VendorCard
                    key={vendor._id}
                    vendor={vendor}
                    variant="default"
                    showDistance={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-20 bg-white rounded-sm border border-gray-200 px-4">
                <Search className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No vendors found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center max-w-sm mx-auto">
                  <button 
                    onClick={clearAllFilters}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}

            {/* Load More */}
            {vendors.length < totalVendors && !loading && (
              <div className="text-center mt-4 sm:mt-6">
                <button
                  onClick={loadVendors}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-sm
                           hover:bg-gray-50 font-medium text-sm"
                >
                  Load More Vendors
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchEventsPage;
