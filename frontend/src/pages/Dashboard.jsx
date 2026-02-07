import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Sliders, Map, Grid3x3, TrendingUp } from 'lucide-react';
import VendorCard from '../components/VendorCard';
import '../components/FilterPanel.css';

const Dashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Filter state
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [budgetRange, setBudgetRange] = useState([0, 100000]);
  const [radius, setRadius] = useState(10);

  // Main event categories (5 buckets)
  const mainCategories = {
    'Personal & Social': {
      icon: '🎉',
      color: 'from-pink-500 to-rose-500',
      subCategories: ['Wedding & Pre-Wedding', 'Birthday Party', 'Anniversary', 'Engagement', 'Baby Shower', 'Reunion']
    },
    'Corporate': {
      icon: '💼',
      color: 'from-blue-500 to-indigo-500',
      subCategories: ['Corporate Meeting', 'Conference', 'Team Building', 'Product Launch', 'Award Ceremony', 'Trade Show']
    },
    'Public & Entertainment': {
      icon: '🎭',
      color: 'from-purple-500 to-pink-500',
      subCategories: ['Concert', 'Festival', 'Exhibition', 'Sports Event', 'Charity Event', 'Community Event']
    },
    'Religious & Cultural': {
      icon: '🕉️',
      color: 'from-orange-500 to-red-500',
      subCategories: ['Religious Ceremony', 'Cultural Festival', 'Temple Event', 'Church Event', 'Mosque Event', 'Traditional Celebration']
    },
    'Digital/Hybrid': {
      icon: '💻',
      color: 'from-teal-500 to-green-500',
      subCategories: ['Virtual Event', 'Webinar', 'Hybrid Conference', 'Online Workshop', 'Live Streaming Event', 'Digital Product Launch']
    }
  };

  // Get user's geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation({ latitude: 28.6139, longitude: 77.2090 }); // Delhi
        }
      );
    } else {
      setUserLocation({ latitude: 28.6139, longitude: 77.2090 });
    }
  }, []);

  // Handle category selection
  const handleMainCategoryClick = (category) => {
    setSelectedMainCategory(category);
    setSelectedSubCategory(''); // Reset sub-category
  };

  // Handle search
  const handleSearch = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      
      if (userLocation) {
        params.append('latitude', userLocation.latitude);
        params.append('longitude', userLocation.longitude);
        params.append('radius', radius);
      }
      
      params.append('budgetMin', budgetRange[0]);
      params.append('budgetMax', budgetRange[1]);
      
      if (selectedSubCategory) {
        params.append('eventType', selectedSubCategory);
      }

      const response = await fetch(`http://localhost:5000/api/vendors/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Discover Perfect Vendors
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trusted by 10,000+ happy customers
              </p>
            </div>
            {userLocation && (
              <div className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span className="text-sm text-indigo-700 font-medium">
                  Showing results near you
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Event Categories - Prominent Display */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded"></span>
            What's Your Event?
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(mainCategories).map(([category, data]) => (
              <button
                key={category}
                onClick={() => handleMainCategoryClick(category)}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                  selectedMainCategory === category
                    ? 'ring-4 ring-indigo-600 shadow-xl scale-105'
                    : 'shadow-md hover:shadow-lg'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${data.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative z-10 flex flex-col items-center text-white">
                  <span className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                    {data.icon}
                  </span>
                  <span className="text-sm font-bold text-center leading-tight">
                    {category}
                  </span>
                  {selectedMainCategory === category && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Sub-Category Dropdown */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Specific Event
              </label>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                disabled={!selectedMainCategory}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {selectedMainCategory ? 'Select Event Type' : 'Select Category First'}
                </option>
                {selectedMainCategory &&
                  mainCategories[selectedMainCategory].subCategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </div>

            {/* Budget Range */}
            <div className="md:col-span-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Budget: ₹{budgetRange[0].toLocaleString()} - ₹{budgetRange[1].toLocaleString()}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={budgetRange[0]}
                  onChange={(e) => setBudgetRange([parseInt(e.target.value) || 0, budgetRange[1]])}
                  className="w-1/2 px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={budgetRange[1]}
                  onChange={(e) => setBudgetRange([budgetRange[0], parseInt(e.target.value) || 0])}
                  className="w-1/2 px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Radius */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Radius: {radius} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
              />
            </div>

            {/* Search Button */}
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={handleSearch}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>

            {/* View Toggle */}
            <div className="md:col-span-2 flex items-end gap-2">
              <button
                onClick={() => setShowMap(false)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  !showMap
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Grid3x3 className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setShowMap(true)}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  showMap
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Map className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Map View Placeholder */}
        {showMap ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
              <Map className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Map View Coming Soon
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Interactive map feature will be available in Phase 2. Stay tuned for location-based vendor discovery!
            </p>
            <button
              onClick={() => setShowMap(false)}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Grid Results
            </button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            {vendors.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {vendors.length} Vendor{vendors.length !== 1 ? 's' : ''} Found
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Sliders className="w-4 h-4" />
                  <span>Sorted by Relevance</span>
                </div>
              </div>
            )}

            {/* Vendor Cards Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Finding perfect vendors for you...</p>
              </div>
            ) : vendors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor, index) => (
                  <VendorCard
                    key={vendor._id}
                    vendor={vendor}
                    variant={index === 0 ? 'featured' : 'default'}
                    userLocation={userLocation}
                    prefilledEventType={selectedSubCategory}
                    onInquiry={(vendor) => {
                      // Inquiry handled by VendorCard
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                  <Search className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Start Your Search
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Select an event category and click search to discover amazing vendors for your special occasion
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    Wedding Planners
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Caterers
                  </span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                    Decorators
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Photographers
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
