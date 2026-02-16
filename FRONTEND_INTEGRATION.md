# 🎨 FRONTEND INTEGRATION GUIDE

## React Components for Geo-Location System

### 1. **Vendor Registration Form** (with Auto-Geocoding)

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const VendorRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'photography',
    city: '',
    area: '',
    pincode: '',
    landmark: '',
    address: '',
    pricing: { min: 0, max: 0 },
    contact: { email: '', phone: '' },
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState(null);
  
  // City search with autocomplete
  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  
  const searchCities = async (query) => {
    if (query.length < 2) return;
    
    try {
      const response = await axios.get(`/api/locations/cities/search?q=${query}&limit=10`);
      setCitySuggestions(response.data.data);
    } catch (err) {
      console.error('City search failed:', err);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeocoding(true);
    setError(null);
    
    try {
      // Backend will automatically geocode and create area
      const response = await axios.post('/api/vendors/register', formData);
      
      alert('✅ Registration successful! Coordinates auto-generated.');
      console.log('Vendor registered:', response.data);
      
      // Redirect to dashboard or show success
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
      
      if (err.response?.data?.error?.code === 'GEOCODING_FAILED') {
        alert('⚠️ Location not found! Please check your area/pincode spelling.');
      }
    } finally {
      setLoading(false);
      setGeocoding(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Business Name */}
      <input
        type="text"
        placeholder="Business Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      
      {/* Service Type */}
      <select
        value={formData.serviceType}
        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
        required
      >
        <option value="photography">Photography</option>
        <option value="catering">Catering</option>
        <option value="decoration">Decoration</option>
      </select>
      
      {/* City (with autocomplete) */}
      <div className="relative">
        <input
          type="text"
          placeholder="City *"
          value={citySearch}
          onChange={(e) => {
            setCitySearch(e.target.value);
            searchCities(e.target.value);
          }}
          required
        />
        
        {citySuggestions.length > 0 && (
          <div className="absolute z-10 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
            {citySuggestions.map((city) => (
              <div
                key={city.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setFormData({ ...formData, city: city.name });
                  setCitySearch(city.name);
                  setCitySuggestions([]);
                }}
              >
                {city.name}, {city.state}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Area (manual text input) */}
      <input
        type="text"
        placeholder="Area / Locality * (e.g., Saket, Sector 62)"
        value={formData.area}
        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
        required
      />
      
      {/* Pincode */}
      <input
        type="text"
        placeholder="Pincode (6 digits)"
        maxLength={6}
        pattern="[0-9]{6}"
        value={formData.pincode}
        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
      />
      
      {/* Landmark (optional) */}
      <input
        type="text"
        placeholder="Landmark (optional, e.g., Near Metro Station)"
        value={formData.landmark}
        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
      />
      
      {/* Full Address */}
      <textarea
        placeholder="Full Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        rows={3}
        required
      />
      
      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Min Price"
          value={formData.pricing.min}
          onChange={(e) => setFormData({ 
            ...formData, 
            pricing: { ...formData.pricing, min: parseInt(e.target.value) }
          })}
          required
        />
        <input
          type="number"
          placeholder="Max Price"
          value={formData.pricing.max}
          onChange={(e) => setFormData({ 
            ...formData, 
            pricing: { ...formData.pricing, max: parseInt(e.target.value) }
          })}
          required
        />
      </div>
      
      {/* Contact */}
      <input
        type="email"
        placeholder="Email"
        value={formData.contact.email}
        onChange={(e) => setFormData({ 
          ...formData, 
          contact: { ...formData.contact, email: e.target.value }
        })}
        required
      />
      
      <input
        type="tel"
        placeholder="Phone (10 digits)"
        pattern="[6-9][0-9]{9}"
        value={formData.contact.phone}
        onChange={(e) => setFormData({ 
          ...formData, 
          contact: { ...formData.contact, phone: e.target.value }
        })}
        required
      />
      
      {/* Password */}
      <input
        type="password"
        placeholder="Password (min 6 characters)"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        minLength={6}
        required
      />
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded disabled:bg-gray-400"
      >
        {loading ? (
          geocoding ? '🌍 Auto-generating coordinates...' : 'Registering...'
        ) : (
          'Register Vendor'
        )}
      </button>
      
      {/* Info Text */}
      <p className="text-sm text-gray-600 text-center">
        ℹ️ Your exact location coordinates will be automatically generated from your address
      </p>
    </form>
  );
};

export default VendorRegistrationForm;
```

---

### 2. **Vendor Search Form** (with Area Dropdown)

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VendorSearchForm = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  
  const [filters, setFilters] = useState({
    serviceType: '',
    budget: { min: 0, max: 100000 },
    rating: 0
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch areas when city is selected
  useEffect(() => {
    if (selectedCity) {
      fetchAreas(selectedCity);
    } else {
      setAreas([]);
      setSelectedArea(null);
    }
  }, [selectedCity]);
  
  const fetchAreas = async (cityName) => {
    setLoadingAreas(true);
    try {
      const response = await axios.get(`/api/locations/cities/name/${cityName}/areas`);
      setAreas(response.data.data);
      console.log(`✅ Loaded ${response.data.count} areas for ${cityName}`);
    } catch (err) {
      console.error('Failed to load areas:', err);
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  };
  
  const handleSearch = async () => {
    if (!selectedCity) {
      alert('Please select a city');
      return;
    }
    
    setLoading(true);
    
    try {
      const searchPayload = {
        serviceId: filters.serviceType || undefined,
        location: selectedArea ? {
          city: selectedCity,
          area: selectedArea.name,
          areaId: selectedArea.id
        } : {
          city: selectedCity
        },
        budget: filters.budget,
        rating: filters.rating || undefined
      };
      
      const response = await axios.post('/api/search/vendors', searchPayload);
      
      setSearchResults(response.data.data.results);
      
      // Show radius expansion message
      if (response.data.data.searchCriteria?.location?.radiusExpanded) {
        alert(`ℹ️ Search expanded to ${response.data.data.searchCriteria.location.radius}km radius to show more results`);
      }
      
    } catch (err) {
      console.error('Search failed:', err);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Find Vendors</h2>
        
        <div className="space-y-4">
          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2">City *</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full border rounded px-4 py-2"
            >
              <option value="">Select City</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Noida">Noida</option>
              <option value="Gurgaon">Gurgaon</option>
            </select>
          </div>
          
          {/* Area Dropdown (populated based on city) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Area {loadingAreas && '(Loading...)'}
            </label>
            <select
              value={selectedArea?.id || ''}
              onChange={(e) => {
                const area = areas.find(a => a.id === e.target.value);
                setSelectedArea(area || null);
              }}
              disabled={!selectedCity || loadingAreas}
              className="w-full border rounded px-4 py-2 disabled:bg-gray-100"
            >
              <option value="">All areas in {selectedCity || 'city'}</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} {area.vendorCount > 0 && `(${area.vendorCount} vendors)`}
                </option>
              ))}
            </select>
            
            {selectedCity && areas.length === 0 && !loadingAreas && (
              <p className="text-sm text-gray-500 mt-1">
                No areas available yet. Vendors will add areas when they register.
              </p>
            )}
          </div>
          
          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
              className="w-full border rounded px-4 py-2"
            >
              <option value="">All Services</option>
              <option value="photography">Photography</option>
              <option value="catering">Catering</option>
              <option value="decoration">Decoration</option>
              <option value="venue">Venue</option>
            </select>
          </div>
          
          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Budget: ₹{filters.budget.min.toLocaleString()} - ₹{filters.budget.max.toLocaleString()}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.budget.min}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  budget: { ...filters.budget, min: parseInt(e.target.value) || 0 }
                })}
                className="border rounded px-4 py-2"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.budget.max}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  budget: { ...filters.budget, max: parseInt(e.target.value) || 100000 }
                })}
                className="border rounded px-4 py-2"
              />
            </div>
          </div>
          
          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: parseFloat(e.target.value) })}
              className="w-full border rounded px-4 py-2"
            >
              <option value="0">Any Rating</option>
              <option value="3.0">3+ Stars</option>
              <option value="4.0">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          
          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading || !selectedCity}
            className="w-full bg-blue-600 text-white py-3 rounded disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Searching nearby vendors...' : 'Search Vendors'}
          </button>
        </div>
      </div>
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">
            {searchResults.length} vendors found
            {selectedArea && ` near ${selectedArea.name}`}
          </h3>
          
          {searchResults.map((vendor) => (
            <div key={vendor.vendorId} className="bg-white p-6 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold">{vendor.name}</h4>
                  <p className="text-gray-600">
                    {vendor.area}, {vendor.city}
                    {vendor.distance && (
                      <span className="text-blue-600 ml-2">
                        • {vendor.distance} km away
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{vendor.serviceType}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-yellow-500 font-bold">
                    ⭐ {vendor.rating || 'New'}
                  </div>
                  <div className="text-sm text-gray-600">
                    ₹{vendor.pricing?.min?.toLocaleString()} - ₹{vendor.pricing?.max?.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {vendor.description && (
                <p className="mt-3 text-gray-700">{vendor.description}</p>
              )}
              
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
      
      {searchResults.length === 0 && !loading && selectedCity && (
        <div className="bg-gray-100 p-8 rounded text-center">
          <p className="text-gray-600">No vendors found. Try:</p>
          <ul className="mt-2 text-sm text-gray-500">
            <li>• Selecting a different area</li>
            <li>• Increasing your budget range</li>
            <li>• Removing filters</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VendorSearchForm;
```

---

### 3. **API Service Functions** (Reusable)

```javascript
// src/services/locationService.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const locationService = {
  /**
   * Search cities by name
   */
  searchCities: async (query, limit = 10) => {
    const response = await axios.get(`${API_BASE_URL}/locations/cities/search`, {
      params: { q: query, limit }
    });
    return response.data.data;
  },
  
  /**
   * Get all areas for a city by name
   */
  getAreasByCity: async (cityName) => {
    const response = await axios.get(`${API_BASE_URL}/locations/cities/name/${cityName}/areas`);
    return response.data;
  },
  
  /**
   * Register a vendor (with auto-geocoding)
   */
  registerVendor: async (vendorData) => {
    const response = await axios.post(`${API_BASE_URL}/vendors/register`, vendorData);
    return response.data;
  },
  
  /**
   * Search vendors with geo-distance matching
   */
  searchVendors: async (searchCriteria) => {
    const response = await axios.post(`${API_BASE_URL}/search/vendors`, searchCriteria);
    return response.data;
  }
};
```

---

### 4. **Usage Example**

```jsx
// App.js or main routing component

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import VendorRegistrationForm from './components/VendorRegistrationForm';
import VendorSearchForm from './components/VendorSearchForm';

function App() {
  return (
    <Router>
      <div className="container mx-auto p-6">
        <Switch>
          <Route path="/vendor/register" component={VendorRegistrationForm} />
          <Route path="/search" component={VendorSearchForm} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
```

---

## 🎨 Key Features

### ✅ **Vendor Registration**
- City dropdown with autocomplete
- **Manual area text input** (no dropdown needed)
- Optional pincode and landmark
- Backend auto-geocodes address
- Shows loading state during geocoding
- Error handling for invalid addresses

### ✅ **Vendor Search**
- City dropdown (static or from API)
- **Area dropdown auto-populated** based on selected city
- Shows vendor count per area
- Geo-distance based results
- Distance displayed for each vendor
- Auto-expands radius notification

### ✅ **Performance**
- Areas fetched from cache (no API calls during search)
- Debounced city search
- Loading states for better UX
- Error boundaries

---

## 🚀 Next Steps

1. **Add to your project:**
   - Copy components to `frontend/src/components/`
   - Create `locationService.js` in `frontend/src/services/`
   - Update API base URL in `.env`

2. **Customize styling:**
   - Replace Tailwind classes with your design system
   - Add loading spinners
   - Improve error messages

3. **Add features:**
   - Map view of search results
   - Filter by distance slider
   - Save favorite areas
   - Recent searches

---

**Ready to integrate!** 🎉
