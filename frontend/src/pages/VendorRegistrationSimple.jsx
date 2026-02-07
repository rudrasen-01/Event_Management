import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, Phone, Mail, Building, DollarSign } from 'lucide-react';
import Button from '../components/Button';
import { VENDOR_SERVICES, CITIES } from '../utils/constants';

const VendorRegistrationSimple = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Personal & Business
    name: '',
    businessName: '',
    phone: '',
    email: '',
    
    // Service
    serviceType: '', // Single service: 'photography', 'tent', 'catering', 'pandit'
    
    // Location
    city: '',
    address: '',
    
    // Pricing
    minPrice: '',
    maxPrice: '',
    priceUnit: 'per event',
    
    // Optional
    yearsInBusiness: '',
    description: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Your name is required';
    if (!formData.businessName.trim()) return 'Business name is required';
    if (!/^[6-9]\d{9}$/.test(formData.phone)) return 'Enter valid 10-digit phone number';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Enter valid email address';
    if (!formData.serviceType) return 'Select a service type';
    if (!formData.city) return 'Select your city';
    if (!formData.address.trim()) return 'Enter your business address';
    if (!formData.minPrice || !formData.maxPrice) return 'Enter pricing range';
    if (Number(formData.minPrice) >= Number(formData.maxPrice)) return 'Max price must be greater than min price';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get city coordinates
      const selectedCity = CITIES.find(city => city.name === formData.city);
      const [lng, lat] = selectedCity?.coordinates || [75.8577, 22.7196]; // Default Indore

      // Prepare backend payload
      const payload = {
        name: formData.name.trim(),
        businessName: formData.businessName.trim(),
        serviceType: formData.serviceType,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        city: formData.city,
        address: formData.address.trim(),
        pricing: {
          min: Number(formData.minPrice),
          max: Number(formData.maxPrice),
          average: Math.round((Number(formData.minPrice) + Number(formData.maxPrice)) / 2),
          unit: formData.priceUnit,
          currency: 'INR'
        },
        filters: {}, // Empty filters initially
        contact: {
          phone: formData.phone,
          email: formData.email.toLowerCase()
        },
        yearsInBusiness: formData.yearsInBusiness ? Number(formData.yearsInBusiness) : undefined,
        description: formData.description.trim() || undefined
      };

      const response = await fetch('http://localhost:5000/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Registration failed');
      }

      setSuccess(true);
      
      setTimeout(() => {
        navigate('/vendor-dashboard');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your vendor profile has been submitted for verification.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Vendor Registration</h1>
          <p className="text-gray-600">Join India's fastest-growing event services platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Personal & Business Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Building className="w-5 h-5 mr-2 text-indigo-600" />
                Personal & Business Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Royal Events Studio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years in Business (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.yearsInBusiness}
                    onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="5"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            </div>

            {/* Service Type Selection */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                What service do you provide? *
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {VENDOR_SERVICES.slice(0, 4).map(service => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleChange('serviceType', service.id)}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      formData.serviceType === service.id
                        ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-4xl mb-2">{service.icon}</div>
                    <div className="text-sm font-medium text-gray-700">{service.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                Location Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select City</option>
                    {CITIES.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Street, Area, Landmark"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
                Pricing Range
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.minPrice}
                    onChange={(e) => handleChange('minPrice', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="10000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.maxPrice}
                    onChange={(e) => handleChange('maxPrice', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="50000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Unit
                  </label>
                  <select
                    value={formData.priceUnit}
                    onChange={(e) => handleChange('priceUnit', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="per event">Per Event</option>
                    <option value="per day">Per Day</option>
                    <option value="per hour">Per Hour</option>
                    <option value="per plate">Per Plate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brief Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Tell us about your services and expertise..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-lg font-semibold"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </Button>
              <p className="text-center text-sm text-gray-500 mt-3">
                By registering, you agree to our Terms of Service
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistrationSimple;
