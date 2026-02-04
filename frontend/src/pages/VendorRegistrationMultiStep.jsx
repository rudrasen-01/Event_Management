import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Search, MapPin, Phone, Mail, Camera, Clock, 
  ChevronRight, ChevronLeft, Home, Building2, User, IndianRupee,
  Calendar, Shield, Check, AlertCircle
} from 'lucide-react';
import { CITIES } from '../utils/constants';
import { fetchServicesByCategory } from '../services/api';
import VendorLoginModal from '../components/VendorLoginModal';

const VendorRegistrationMultiStep = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  // Single Source of Truth - Services fetched from backend
  const [vendorServices, setVendorServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const totalSteps = 6;

  const [formData, setFormData] = useState({
    serviceType: '',
    businessName: '',
    pincode: '',
    plotNo: '',
    buildingName: '',
    street: '',
    landmark: '',
    area: '',
    city: '',
    state: 'Madhya Pradesh',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    openTime: '09:00',
    closeTime: '18:00',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    password: '',
    confirmPassword: '',
    photos: [],
    minPrice: '',
    maxPrice: '',
    priceUnit: 'per event',
    name: '',
    yearsInBusiness: '',
    description: ''
  });

  useEffect(() => {
    setCurrentStep(1);
    setError('');
    setLoading(false);
    setSuccess(false);
    setCategorySearch('');
    
    // Fetch services from backend - Single Source of Truth
    const loadServices = async () => {
      setServicesLoading(true);
      try {
        const services = await fetchServicesByCategory();
        setVendorServices(services);
      } catch (err) {
        console.error('Failed to load services:', err);
        setError('Failed to load business categories. Please refresh the page.');
      } finally {
        setServicesLoading(false);
      }
    };
    
    loadServices();
    
    return () => {
      setCurrentStep(1);
      setError('');
    };
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleWorkingDay = (day) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.serviceType) return 'Please select a business category';
        break;
      case 2:
        if (!formData.businessName.trim()) return 'Business name is required';
        if (!formData.city) return 'Please select your city';
        if (!formData.area.trim() && !formData.street.trim()) return 'Please enter area or street';
        break;
      case 3:
        if (formData.workingDays.length === 0) return 'Select at least one working day';
        break;
      case 4:
        if (!formData.contactPerson.trim()) return 'Contact person name is required';
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10 || !/^[6-9]/.test(phoneDigits)) {
          return 'Enter valid 10-digit mobile number';
        }
        if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
          return 'Enter valid email address';
        }
        if (!formData.password || formData.password.length < 6) {
          return 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          return 'Passwords do not match';
        }
        break;
      case 5:
        break;
      case 6:
        if (!formData.minPrice || !formData.maxPrice) return 'Enter your pricing range';
        if (Number(formData.minPrice) >= Number(formData.maxPrice)) return 'Max price must be greater than min';
        if (Number(formData.minPrice) < 100) return 'Minimum price seems too low';
        break;
    }
    return null;
  };

  const nextStep = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError('');
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setError('');
    setLoading(false);
    setSuccess(false);
    setCategorySearch('');
    setFormData({
      serviceType: '',
      businessName: '',
      pincode: '',
      plotNo: '',
      buildingName: '',
      street: '',
      landmark: '',
      area: '',
      city: '',
      state: 'Madhya Pradesh',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      openTime: '09:00',
      closeTime: '18:00',
      contactPerson: '',
      phone: '',
      whatsapp: '',
      email: '',
      password: '',
      confirmPassword: '',
      photos: [],
      minPrice: '',
      maxPrice: '',
      priceUnit: 'per event',
      name: '',
      yearsInBusiness: '',
      description: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    const validationError = validateStep(6);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedCity = CITIES.find(city => city.name === formData.city);
      const [lng, lat] = selectedCity?.coordinates || [75.8577, 22.7196];

      const addressParts = [
        formData.plotNo,
        formData.buildingName,
        formData.street,
        formData.landmark,
        formData.area
      ].filter(Boolean);
      const fullAddress = addressParts.join(', ');

      const payload = {
        name: formData.contactPerson.trim(),
        businessName: formData.businessName.trim(),
        serviceType: formData.serviceType,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        city: formData.city,
        address: fullAddress,
        pincode: formData.pincode || undefined,
        pricing: {
          min: Number(formData.minPrice),
          max: Number(formData.maxPrice),
          average: Math.round((Number(formData.minPrice) + Number(formData.maxPrice)) / 2),
          unit: formData.priceUnit,
          currency: 'INR'
        },
        filters: {
          working_days: formData.workingDays,
          open_time: formData.openTime,
          close_time: formData.closeTime
        },
        contact: {
          phone: formData.phone,
          email: formData.email.toLowerCase(),
          whatsapp: formData.whatsapp || formData.phone
        },
        password: formData.password,
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
      setRegisteredEmail(formData.email);
      
      // Show success message, then open login modal
      setTimeout(() => {
        setShowLoginModal(true);
      }, 2500);

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter services using API-fetched data (Single Source of Truth)
  const filteredServices = vendorServices.filter(service =>
    service.label.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleCategorySelect = (service) => {
    handleChange('serviceType', service.value);
    setCategorySearch(service.label);
    setShowCategoryDropdown(false);
  };

  const handleLoginSuccess = (vendor) => {
    // Navigate to vendor dashboard after successful login
    navigate('/vendor-dashboard');
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border border-gray-200">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vendor Registration</h1>
              <p className="text-sm text-gray-600 mt-0.5">Complete your business profile</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5, 6].map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                                ${currentStep > step ? 'bg-green-600 text-white' : 
                                  currentStep === step ? 'bg-blue-600 text-white' : 
                                  'bg-gray-200 text-gray-600'}`}>
                    {currentStep > step ? <Check className="w-5 h-5" /> : step}
                  </div>
                  <span className={`text-xs mt-2 ${currentStep >= step ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {step === 1 && 'Category'}
                    {step === 2 && 'Business'}
                    {step === 3 && 'Timing'}
                    {step === 4 && 'Contact'}
                    {step === 5 && 'Photos'}
                    {step === 6 && 'Pricing'}
                  </span>
                </div>
                {index < 5 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step + 1 ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="p-6">
            {/* Step 1: Business Category */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Select Business Category</h2>
                  <p className="text-sm text-gray-600">Choose your primary service category</p>
                </div>

                {/* Loading State */}
                {servicesLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Loading business categories...</p>
                  </div>
                )}

                {/* Searchable Dropdown */}
                {!servicesLoading && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => {
                          setCategorySearch(e.target.value);
                          setShowCategoryDropdown(true);
                          if (e.target.value === '') {
                            handleChange('serviceType', '');
                          }
                        }}
                        onFocus={() => setShowCategoryDropdown(true)}
                        placeholder="Type to search (e.g., photographer, caterer, DJ, makeup)"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    
                    {/* Dropdown Results - Grouped by Category */}
                    {showCategoryDropdown && categorySearch && filteredServices.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                        {(() => {
                          // Group services by category
                          const grouped = filteredServices.reduce((acc, service) => {
                            if (!acc[service.category]) {
                              acc[service.category] = [];
                            }
                            acc[service.category].push(service);
                            return acc;
                          }, {});

                          return Object.entries(grouped).map(([category, services]) => (
                            <div key={category} className="border-b border-gray-100 last:border-b-0">
                              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide sticky top-0">
                                {category}
                              </div>
                              {services.map((service) => (
                                <button
                                  key={service.value}
                                  type="button"
                                  onClick={() => handleCategorySelect(service)}
                                  className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-3
                                            ${formData.serviceType === service.value ? 'bg-blue-50' : ''}`}
                                >
                                  <span className="text-xl">{service.icon}</span>
                                  <span className="text-sm text-gray-900">{service.label}</span>
                                </button>
                              ))}
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                    
                    {/* No Results */}
                    {showCategoryDropdown && categorySearch && filteredServices.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                        <p className="text-sm text-gray-600">No categories found matching "{categorySearch}"</p>
                      </div>
                    )}
                    </div>

                    {/* Selected Category Display */}
                    {formData.serviceType && !showCategoryDropdown && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded p-3 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-800 font-medium">
                          Selected: {vendorServices.find(s => s.value === formData.serviceType)?.label}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Browse by Category - Show when search is empty */}
                {!categorySearch && !servicesLoading && (
                  <div className="mt-6">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Browse by Category</p>
                    <div className="space-y-3">
                      {[
                        'Venues',
                        'Event Planning',
                        'Decor & Styling',
                        'Photography & Videography',
                        'Food & Catering',
                        'Music & Entertainment',
                        'Sound, Light & Technical',
                        'Rentals & Infrastructure',
                        'Beauty & Personal Services',
                        'Religious & Ritual Services',
                        'Invitations, Gifts & Printing',
                        'Logistics & Support Services',
                        'Others'
                      ].map((cat) => {
                        const categoryServices = vendorServices.filter(s => s.category === cat);
                        if (categoryServices.length === 0) return null;
                        
                        return (
                          <div key={cat} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={(e) => {
                                const content = e.currentTarget.nextElementSibling;
                                content.classList.toggle('hidden');
                              }}
                              className="w-full px-4 py-3 bg-gray-50 text-left flex items-center justify-between hover:bg-gray-100"
                            >
                              <span className="text-sm font-semibold text-gray-700">{cat}</span>
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            </button>
                            <div className="hidden bg-white">
                              {categoryServices.map((service) => (
                                <button
                                  key={service.value}
                                  type="button"
                                  onClick={() => handleCategorySelect(service)}
                                  className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-3 border-t border-gray-100
                                            ${formData.serviceType === service.value ? 'bg-blue-50' : ''}`}
                                >
                                  <span className="text-xl">{service.icon}</span>
                                  <span className="text-sm text-gray-700">{service.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Business Details</h2>
                  <p className="text-sm text-gray-600">Tell us about your business location</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleChange('businessName', e.target.value)}
                      placeholder="Enter your business name"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select City</option>
                      {CITIES.map((city) => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleChange('pincode', e.target.value)}
                      placeholder="452001"
                      maxLength="6"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plot/Shop No.
                    </label>
                    <input
                      type="text"
                      value={formData.plotNo}
                      onChange={(e) => handleChange('plotNo', e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Building Name
                    </label>
                    <input
                      type="text"
                      value={formData.buildingName}
                      onChange={(e) => handleChange('buildingName', e.target.value)}
                      placeholder="Building name"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street/Road <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleChange('street', e.target.value)}
                      placeholder="Street name"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area/Locality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => handleChange('area', e.target.value)}
                      placeholder="e.g., Vijay Nagar"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => handleChange('landmark', e.target.value)}
                      placeholder="Near famous place"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Working Hours */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Working Hours</h2>
                  <p className="text-sm text-gray-600">Set your availability</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Working Days <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleWorkingDay(day)}
                        className={`px-4 py-2 border-2 rounded text-sm font-medium transition-colors
                                  ${formData.workingDays.includes(day)
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={formData.openTime}
                      onChange={(e) => handleChange('openTime', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={formData.closeTime}
                      onChange={(e) => handleChange('closeTime', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Contact Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Contact Information</h2>
                  <p className="text-sm text-gray-600">How customers can reach you</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => handleChange('contactPerson', e.target.value)}
                      placeholder="Full name"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="Same as mobile or different"
                      maxLength="10"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be used to login to your dashboard</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Photos (Optional) */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Business Photos (Optional)</h2>
                  <p className="text-sm text-gray-600">Add photos to showcase your work</p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Photo upload coming soon</p>
                  <p className="text-xs text-gray-500">You can add photos later from your dashboard</p>
                </div>
              </div>
            )}

            {/* Step 6: Pricing */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Pricing Details</h2>
                  <p className="text-sm text-gray-600">Set your service pricing range</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.minPrice}
                        onChange={(e) => handleChange('minPrice', e.target.value)}
                        placeholder="10000"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded text-sm
                                 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.maxPrice}
                        onChange={(e) => handleChange('maxPrice', e.target.value)}
                        placeholder="50000"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded text-sm
                                 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Unit
                    </label>
                    <select
                      value={formData.priceUnit}
                      onChange={(e) => handleChange('priceUnit', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="per event">Per Event</option>
                      <option value="per day">Per Day</option>
                      <option value="per hour">Per Hour</option>
                      <option value="per plate">Per Plate</option>
                      <option value="per person">Per Person</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Tell customers about your business, experience, and services..."
                      rows="4"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Success Message with Login Instructions */}
          {success && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Registration Successful! 🎉
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        Your vendor account has been created with email: <strong className="text-blue-700">{registeredEmail}</strong>
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>
                        Your account is currently <strong className="text-orange-700">pending admin approval</strong>. 
                        Once approved by our team, you'll be able to access your vendor dashboard.
                      </span>
                    </p>
                    <div className="bg-white border border-blue-200 rounded-lg p-4 mt-4">
                      <p className="font-semibold text-gray-900 mb-2">📧 Next Steps:</p>
                      <ul className="space-y-1 text-gray-700 ml-5 list-disc">
                        <li>Check your email for registration confirmation</li>
                        <li>Wait for admin approval (usually within 24-48 hours)</li>
                        <li>Once approved, login with your credentials to access dashboard</li>
                      </ul>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      Opening login modal in a moment... You can try logging in after approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50 rounded-b-lg">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-5 py-2.5 border rounded text-sm font-medium
                        ${currentStep === 1 
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded text-sm font-medium
                         hover:bg-blue-700 transition-colors"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded text-sm font-medium
                         hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
                {!loading && <CheckCircle className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Login Modal */}
      <VendorLoginModal 
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          navigate('/');
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default VendorRegistrationMultiStep;
