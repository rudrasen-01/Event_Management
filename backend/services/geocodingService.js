const axios = require('axios');

/**
 * ============================================================================
 * GEOCODING SERVICE - Convert Address to Coordinates
 * ============================================================================
 * Supports two providers:
 * 1. Nominatim (OpenStreetMap) - FREE, no API key required
 * 2. Google Maps Geocoding - More accurate for India, requires API key
 * 
 * Usage: const { lat, lon } = await geocodeAddress(addressString);
 * ============================================================================
 */

const GEOCODING_PROVIDER = process.env.GEOCODING_PROVIDER || 'nominatim'; // 'nominatim' or 'google'
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Geocode address using Nominatim (OpenStreetMap) - FREE
 * @param {string} address - Full address string
 * @returns {Promise<{lat: number, lon: number, displayName: string}>}
 */
async function geocodeWithNominatim(address) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        countrycodes: 'in', // Restrict to India
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'VendorMarketplace/1.0' // Required by Nominatim
      },
      timeout: 10000
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Location not found');
    }

    const result = response.data[0];
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      address: result.address
    };
  } catch (error) {
    if (error.message === 'Location not found') {
      throw error;
    }
    throw new Error(`Geocoding failed: ${error.message}`);
  }
}

/**
 * Geocode address using Google Maps Geocoding API
 * @param {string} address - Full address string
 * @returns {Promise<{lat: number, lon: number, displayName: string}>}
 */
async function geocodeWithGoogle(address) {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        region: 'in', // Bias towards India
        key: GOOGLE_API_KEY
      },
      timeout: 10000
    });

    if (response.data.status !== 'OK' || !response.data.results.length) {
      throw new Error('Location not found');
    }

    const result = response.data.results[0];
    const location = result.geometry.location;

    return {
      lat: location.lat,
      lon: location.lng,
      displayName: result.formatted_address,
      placeId: result.place_id
    };
  } catch (error) {
    if (error.message === 'Location not found') {
      throw error;
    }
    throw new Error(`Google geocoding failed: ${error.message}`);
  }
}

/**
 * Main geocoding function - automatically selects provider
 * @param {string} address - Full address string
 * @returns {Promise<{lat: number, lon: number, displayName: string}>}
 */
async function geocodeAddress(address) {
  if (!address || address.trim().length === 0) {
    throw new Error('Address is required for geocoding');
  }

  // Add "India" if not present
  const fullAddress = address.toLowerCase().includes('india') 
    ? address 
    : `${address}, India`;

  console.log(`🌍 Geocoding address: "${fullAddress}" using ${GEOCODING_PROVIDER}`);

  try {
    let result;
    
    if (GEOCODING_PROVIDER === 'google' && GOOGLE_API_KEY) {
      result = await geocodeWithGoogle(fullAddress);
    } else {
      result = await geocodeWithNominatim(fullAddress);
    }

    console.log(`✅ Geocoded: (${result.lat}, ${result.lon})`);
    return result;

  } catch (error) {
    console.error(`❌ Geocoding error: ${error.message}`);
    throw error;
  }
}

/**
 * Build address string from vendor location data
 * Strategy: Pincode-first for accuracy in India
 * @param {Object} locationData - {area, city, pincode, landmark}
 * @returns {string} - Formatted address for geocoding
 */
function buildAddressString(locationData) {
  const { area, city, pincode, landmark } = locationData;
  
  // For India, pincode is most accurate - build address with pincode priority
  const parts = [];
  
  // Add locality/area first for context
  if (area) parts.push(area);
  if (landmark) parts.push(landmark);
  
  // Add city for regional context
  if (city) parts.push(city);
  
  // Add pincode - critical for accurate geocoding in India
  if (pincode) parts.push(pincode);
  
  // Always add country
  parts.push('India');

  return parts.filter(Boolean).join(', ');
}

/**
 * Smart geocoding with fallback strategy for better accuracy
 * @param {Object} locationData - {area, city, pincode, landmark}
 * @returns {Promise<{lat: number, lon: number, displayName: string}>}
 */
async function geocodeWithFallback(locationData) {
  const { area, city, pincode, landmark } = locationData;
  
  // Strategy 1: Try pincode + city first (most accurate for India)
  if (pincode && city) {
    try {
      console.log(`🎯 Strategy 1: Trying "${pincode}, ${city}, India"`);
      const result = await geocodeAddress(`${pincode}, ${city}, India`);
      console.log(`✅ Success with pincode + city`);
      return result;
    } catch (error) {
      console.log(`⚠️  Strategy 1 failed: ${error.message}`);
    }
  }
  
  // Strategy 2: Try area + city + pincode
  if (area && city && pincode) {
    try {
      console.log(`🎯 Strategy 2: Trying "${area}, ${city}, ${pincode}, India"`);
      const result = await geocodeAddress(`${area}, ${city}, ${pincode}, India`);
      console.log(`✅ Success with area + city + pincode`);
      return result;
    } catch (error) {
      console.log(`⚠️  Strategy 2 failed: ${error.message}`);
    }
  }
  
  // Strategy 3: Full address with all components
  try {
    console.log(`🎯 Strategy 3: Trying full address`);
    const fullAddress = buildAddressString(locationData);
    const result = await geocodeAddress(fullAddress);
    console.log(`✅ Success with full address`);
    return result;
  } catch (error) {
    console.log(`⚠️  Strategy 3 failed: ${error.message}`);
    throw new Error(`Could not geocode location. Please verify pincode "${pincode}" and city "${city}" are correct.`);
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} - Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = {
  geocodeAddress,
  geocodeWithFallback,
  buildAddressString,
  calculateDistance,
  geocodeWithNominatim,
  geocodeWithGoogle
};
