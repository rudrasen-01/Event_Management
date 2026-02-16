import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Sparkles, Crosshair, Search, ChevronDown, Star, Shield, TrendingUp, Award, Compass, Loader2 } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';
import { fetchCities, fetchServiceTypes, fetchAreas } from '../services/dynamicDataService';
import SearchAutocomplete from './SearchAutocomplete';

const EventSearch = () => {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedArea,
    setSelectedArea,
    location,
    detailedLocation,
    filters,
    updateFilter,
    updateDetailedLocation,
    isLocating,
    setIsLocating,
    locationStatus,
    setLocationStatus,
    showSuggestions,
    setShowSuggestions,
    suggestions,
    setSuggestions,
    syncWithURL
  } = useSearch();
  
  // Dynamic data state
  const [cities, setCities] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Local UI state only
  const [showCategoryMenu, setShowCategoryMenu] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  // Load dynamic data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [citiesData, servicesData] = await Promise.all([
          fetchCities(),
          fetchServiceTypes()
        ]);
        console.log('🏙️ Cities loaded:', citiesData?.length || 0, citiesData?.slice(0, 3));
        console.log('🎯 Services loaded:', servicesData?.length || 0);
        // Ensure arrays are returned
        setCities(Array.isArray(citiesData) ? citiesData : []);
        setServiceTypes(Array.isArray(servicesData) ? servicesData : []);
      } catch (error) {
        console.error('❌ Failed to load dynamic data:', error);
        setCities([]);
        setServiceTypes([]);
      } finally {
        setLoadingData(false);
      }
    };
    
    loadData();
  }, []);

  // Load areas when selected city changes
  useEffect(() => {
    const loadAreas = async () => {
      if (selectedCity) {
        try {
          const areasData = await fetchAreas(selectedCity);
          setAvailableAreas(areasData.map(a => a.name));
        } catch (error) {
          console.error('Error loading areas:', error);
          setAvailableAreas([]);
        }
      } else {
        setAvailableAreas([]);
      }
    };
    
    loadAreas();
  }, [selectedCity]);

  // Generate menu from service types - NO hardcoded categorization
  const categoryMegaMenu = React.useMemo(() => {
    if (!serviceTypes.length) return {};
    
    // Simply return services without hardcoded categorization
    // Categorization logic should come from database, not hardcoded here
    return {};
  }, [serviceTypes]);

  const popularSearches = React.useMemo(() => {
    if (!serviceTypes.length || !cities.length) return [];
    
    // Generate popular searches from actual data
    const topCities = cities.slice(0, 3);
    const topServices = serviceTypes.slice(0, 4);
    
    const searches = [];
    
    // Add city-specific searches
    topCities.forEach(city => {
      if (topServices[0]) {
        searches.push({
          text: `${topServices[0].label} in ${city.name}`,
          category: 'Service',
          icon: '🏛️',
          type: topServices[0].value
        });
      }
    });
    
    // Add generic service searches
    topServices.forEach(service => {
      searches.push({
        text: service.label,
        category: 'Service',
        icon: '📸',
        type: service.value
      });
    });
    
    return searches.slice(0, 7);
  }, [serviceTypes, cities]);

  const eventCategories = React.useMemo(() => {
    if (!Array.isArray(serviceTypes) || serviceTypes.length === 0) return [];
    return serviceTypes.slice(0, 5).map(s => ({ value: s.value, label: s.label }));
  }, [serviceTypes]);

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
          
          // Reverse geocoding using Nominatim (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en'
              }
            }
          );
          
          const data = await response.json();
          const address = data.address || {};
          
          // Extract detailed location components
          const city = address.city || address.town || address.village || address.state_district || 'Unknown City';
          const area = address.suburb || address.neighbourhood || address.quarter || address.road || '';
          const street = address.road || address.street || '';
          const fullAddress = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          // Create readable location string
          let locationString = '';
          if (area && city) {
            locationString = `${area}, ${city}`;
          } else if (street && city) {
            locationString = `${street}, ${city}`;
          } else if (city) {
            locationString = city;
          } else {
            locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }
          
          // Update context with location details
          updateDetailedLocation({
            city,
            area,
            street,
            latitude,
            longitude,
            fullAddress
          });
          
          // Update dropdown selections
          setSelectedCity(city);
          setSelectedArea(area);
          
          setLocationStatus(`✓ Location: ${locationString}`);
          setIsLocating(false);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          // Fallback to coordinates
          updateDetailedLocation({
            latitude,
            longitude,
            fullAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          });
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

  const handleContinue = () => {
    // Navigate to search page with synchronized state
    const params = syncWithURL();
    navigate(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    updateFilter('eventCategory', suggestion.type);
    setShowSuggestions(false);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city.name);
    setSelectedArea('');
    updateDetailedLocation({
      city: city.name,
      area: '',
      latitude: city.coords[0],
      longitude: city.coords[1]
    });
    setShowCityDropdown(false);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    updateDetailedLocation({
      area: area
    });
    setShowAreaDropdown(false);
  };

  return (
    <section id="event-search" className="relative bg-white">
      {/* Main Search Bar Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-8">
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Find Verified Event Services in Your City
            </h1>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg">Search by service, location, or budget - Get instant quotes</p>
          </div>

          {/* Main Search Input */}
          <div className="max-w-5xl mx-auto mb-4">
            <div className="bg-white rounded-lg border-2 border-gray-300 shadow-lg hover:border-indigo-500 transition-colors">
              <div className="flex flex-col md:flex-row items-stretch">
                {/* Location Input with Dropdowns */}
                <div className="relative flex items-center gap-2 px-3 md:px-4 py-3 border-b md:border-b-0 md:border-r border-gray-300 min-w-0 md:min-w-[250px]">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
                  
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
                      className="w-full text-sm md:text-base focus:outline-none font-medium text-gray-900 bg-transparent"
                    />
                    
                    {showCityDropdown && !loadingData && (
                      <div className="absolute top-full left-0 mt-1 w-full md:w-56 bg-white border border-gray-300 rounded-lg shadow-xl z-[100] max-h-64 overflow-y-auto">
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
                              className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                            >
                              <div>
                                <div className="text-sm font-medium text-gray-900">{city.name}</div>
                                <div className="text-xs text-gray-500">
                                  {city.state}
                                  {city.count > 0 && <span className="ml-1 text-indigo-600 font-medium">• {city.count} vendors</span>}
                                </div>
                              </div>
                            </button>
                          ))}
                        {cities.length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500">No cities found</div>
                        )}
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
                          className="w-full text-sm focus:outline-none font-medium text-gray-900 bg-transparent"
                        />
                        
                        {showAreaDropdown && availableAreas.length > 0 && (
                          <div className="absolute top-full left-0 mt-1 w-full md:w-56 bg-white border border-gray-300 rounded-lg shadow-xl z-[100] max-h-64 overflow-y-auto">
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
                                  className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 text-sm text-gray-900 border-b border-gray-100 last:border-b-0"
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
                    onClick={handleLocate} 
                    className="text-indigo-600 hover:text-indigo-700 transition-colors"
                    title="Use my location"
                  >
                    <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Search Input with Smart Autocomplete */}
                <div className="flex-1 relative">
                  <div className="absolute inset-0">
                    <SearchAutocomplete
                      onSelect={(suggestion) => {
                        setSearchQuery(suggestion.label);
                        // Store taxonomy ID for filtering
                        if (suggestion.taxonomyId) {
                          updateFilter('serviceId', suggestion.taxonomyId);
                        }
                      }}
                      onInputChange={(value) => {
                        setSearchQuery(value);
                      }}
                      placeholder="Search for Venues, Photographers, Singers, DJs, Anchors..."
                      showIcon={false}
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleContinue}
                  className="px-6 md:px-8 py-3 bg-orange-500 text-white font-semibold hover:bg-orange-600 rounded-b-lg md:rounded-b-none md:rounded-r-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">Search</span>
                </button>
              </div>
            </div>
            {locationStatus && (
              <p className="text-xs text-gray-600 mt-2 px-1">{locationStatus}</p>
            )}
            {detailedLocation.fullAddress && (
              <div className="text-xs text-gray-500 mt-1 px-1 bg-blue-50 rounded p-2 border border-blue-100">
                <div className="font-semibold text-blue-900 mb-1">📍 Detected Location:</div>
                {detailedLocation.street && <div>Street: {detailedLocation.street}</div>}
                {detailedLocation.area && <div>Area: {detailedLocation.area}</div>}
                {detailedLocation.city && <div>City: {detailedLocation.city}</div>}
                <div className="text-gray-400 mt-1">Coordinates: {detailedLocation.latitude?.toFixed(6)}, {detailedLocation.longitude?.toFixed(6)}</div>
              </div>
            )}
          </div>

          {/* Category Browse Dropdowns - Professional Style */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {Object.keys(categoryMegaMenu).map((category, idx) => (
              <div 
                key={idx} 
                className="relative"
                onMouseEnter={() => setShowCategoryMenu(category)}
                onMouseLeave={() => setTimeout(() => setShowCategoryMenu(''), 200)}
              >
                <button
                  className={`text-sm font-medium px-4 py-2 rounded transition-colors flex items-center gap-1.5 ${
                    showCategoryMenu === category 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCategoryMenu === category ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showCategoryMenu === category && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-2xl z-[100] overflow-hidden">
                    <div className="py-2">
                      {categoryMegaMenu[category]?.map((item, itemIdx) => (
                        <button
                          key={itemIdx}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(item.label);
                            setShowCategoryMenu('');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-left transition-colors border-b border-gray-50 last:border-b-0"
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-sm font-medium text-gray-900">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Filter Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Left Filters */}
            <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-2 md:pb-0">
              <select
                value={filters.eventCategory}
                onChange={(e) => updateFilter('eventCategory', e.target.value)}
                className="flex items-center gap-2 px-2 md:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm font-medium hover:border-indigo-500 focus:outline-none focus:border-indigo-500 whitespace-nowrap"
              >
                <option value="">Event Type</option>
                {eventCategories.map((cat, idx) => (
                  <option key={idx} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              
              <div className="relative">
                <input
                  type="number"
                  value={filters.budgetMax === 10000000 ? '' : filters.budgetMax}
                  onChange={(e) => updateFilter('budgetMax', parseInt(e.target.value) || 10000000)}
                  placeholder="Budget"
                  className="w-24 md:w-32 px-2 md:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm font-medium hover:border-indigo-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={filters.radius}
                onChange={(e) => updateFilter('radius', parseInt(e.target.value))}
                className="px-2 md:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm font-medium hover:border-indigo-500 focus:outline-none focus:border-indigo-500 whitespace-nowrap"
              >
                <option value="2">Within 2km</option>
                <option value="5">Within 5km</option>
                <option value="10">Within 10km</option>
                <option value="20">Within 20km</option>
                <option value="50">Within 50km</option>
                <option value="city">Entire City</option>
              </select>

              <button className="hidden md:flex items-center gap-2 px-2 md:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm font-medium hover:border-indigo-500">
                <Star className="w-4 h-4 text-yellow-500" />
                Rating
                <ChevronDown className="w-4 h-4" />
              </button>

              <label className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm font-medium hover:border-indigo-500 cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => updateFilter('verified', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Shield className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                <span className="hidden sm:inline">Verified Only</span>
                <span className="sm:hidden">Verified</span>
              </label>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <span className="text-xs md:text-sm text-gray-600">Sort:</span>
              <select className="flex-1 md:flex-none px-2 md:px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm font-medium focus:outline-none focus:border-indigo-500">
                <option>Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
                <option>Distance</option>
              </select>
              
              <button className="px-3 md:px-4 py-2 bg-indigo-600 text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-indigo-700 whitespace-nowrap">
                All Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Budget Chips */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-3 md:py-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className="text-xs md:text-sm font-semibold text-gray-700 w-full md:w-auto mb-1 md:mb-0">Popular Budgets:</span>
            {[
              { label: 'Under ₹50K', value: 50000 },
              { label: '₹50K - ₹1L', value: 100000 },
              { label: '₹1L - ₹3L', value: 300000 },
              { label: '₹3L - ₹5L', value: 500000 },
              { label: '₹5L+', value: 500001 }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => updateFilter('budgetMax', chip.value)}
                className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium border-2 transition-all whitespace-nowrap ${
                  filters.budgetMax === chip.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-6 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            <div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                <div className="text-xl md:text-3xl font-bold text-indigo-600">500+</div>
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Verified Vendors</div>
            </div>
            <div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                <Award className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                <div className="text-xl md:text-3xl font-bold text-indigo-600">1000+</div>
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Events Completed</div>
            </div>
            <div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 fill-yellow-500" />
                <div className="text-xl md:text-3xl font-bold text-indigo-600">4.8</div>
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Average Rating</div>
            </div>
            <div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                <div className="text-xl md:text-3xl font-bold text-indigo-600">₹1Cr+</div>
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Business Generated</div>
            </div>
          </div>

          <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>100% Verified Vendors</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span>Best Price Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Quality Assured</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventSearch;
