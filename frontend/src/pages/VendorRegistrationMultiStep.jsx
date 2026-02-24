import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Search, MapPin, Phone, Mail, Camera, Clock, 
  ChevronRight, ChevronLeft, Home, Building2, User, IndianRupee,
  Calendar, Shield, Check, AlertCircle, Zap, TrendingUp, Star,
  Award, Eye, Sparkles, Crown, CreditCard, Smartphone, Wallet,
  Building, Lock, ArrowRight, Info, Upload, X, Loader2, Image as ImageIcon
} from 'lucide-react';
import { getAllServices } from '../services/taxonomyService';
import { fetchCities } from '../services/dynamicDataService';
import VendorLoginModal from '../components/VendorLoginModal';
import { uploadVendorImage } from '../services/vendorService';

const VendorRegistrationMultiStep = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showManualCategory, setShowManualCategory] = useState(false);
  
  // Photo upload states
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Payment gateway state management
  const [paymentState, setPaymentState] = useState('idle'); // idle | initiating | processing | verifying | success | failed | cancelled
  const [paymentError, setPaymentError] = useState('');
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(''); // upi | card | netbanking | wallet
  
  // Single Source of Truth - Data fetched from backend
  const [vendorServices, setVendorServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  
  // Field-level errors for better UX
  const [fieldErrors, setFieldErrors] = useState({});

  const totalSteps = 7;

  // Visibility Plans - Scalable data structure
  const visibilityPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      duration: 'Forever',
      popular: false,
      icon: Home,
      color: 'gray',
      features: [
        'Basic listing',
        'Up to 5 portfolio images',
        'Standard search visibility',
        'Customer inquiries enabled'
      ],
      limitations: ['No featured placement', 'No verified badge', 'Limited visibility']
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 499,
      duration: 'per month',
      popular: false,
      icon: Zap,
      color: 'blue',
      trialDays: 30,
      features: [
        'First 30 days free trial',
        'Verified badge',
        'Up to 15 images/videos',
        'Higher search ranking',
        'Profile managed by AIS team',
        'Priority customer support'
      ],
      limitations: []
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 999,
      duration: 'per month',
      popular: true,
      icon: TrendingUp,
      color: 'indigo',
      trialDays: 30,
      features: [
        'First 30 days free trial',
        'Featured placement',
        'Up to 30 images/videos',
        'Top search priority',
        'Portfolio enhancement',
        'Social media promotion'
      ],
      limitations: []
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1499,
      duration: 'per month',
      popular: false,
      icon: Crown,
      color: 'amber',
      trialDays: 30,
      features: [
        'First 30 days free trial',
        'Premium badge',
        'Unlimited portfolio',
        'Maximum visibility',
        'Social media shoutouts',
        'Dedicated optimization',
        'Priority in high-demand searches'
      ],
      limitations: []
    }
  ];

  const [formData, setFormData] = useState({
    serviceType: '',
    customService: '',
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
    // Visibility plan selection
    selectedPlan: 'free',
    planPrice: 0,
    planDuration: 'Forever',
    // Service pricing (separate from platform plan)
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
    
    // Fetch services and cities from backend - Single Source of Truth
    const loadData = async () => {
      setServicesLoading(true);
      setCitiesLoading(true);
      
      try {
        // Fetch services from master taxonomy
        const services = await getAllServices();
        const formattedServices = services.map(service => ({
          value: service.taxonomyId,
          label: service.name,
          icon: service.icon || '🔧',
          category: service.parentId || 'other'
        }));
        setVendorServices(formattedServices);
        
        // Fetch cities from dynamic API
        const citiesData = await fetchCities();
        console.log('🏙️ Vendor Registration - Cities loaded:', {
          total: citiesData?.length || 0,
          sample: citiesData?.slice(0, 3),
          isArray: Array.isArray(citiesData)
        });
        setCities(Array.isArray(citiesData) ? citiesData : []);
      } catch (err) {
        console.error('❌ Failed to load data:', err);
        setError('Failed to load registration data. Please refresh the page.');
      } finally {
        setServicesLoading(false);
        setCitiesLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      setCurrentStep(1);
      setError('');
    };
  }, []);

  const handleChange = (field, value) => {
    console.log(`✏️ Field Changed: ${field} = "${value}" (type: ${typeof value})`);
    
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`   Updated formData.${field}:`, updated[field]);
      return updated;
    });
    
    // Clear field-specific error when user types
    if (fieldErrors[field]) {
      console.log(`   Clearing error for field: ${field}`);
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear general error
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

  // ==================== PHOTO UPLOAD HANDLERS ====================
  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate total number of photos
    const currentPhotos = formData.photos.length;
    if (currentPhotos + files.length > 10) {
      setError(`Maximum 10 photos allowed. You can upload ${10 - currentPhotos} more.`);
      return;
    }

    setUploadingPhotos(true);
    setUploadProgress(0);
    const uploadedPhotos = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`);
          continue;
        }

        // Validate file size (max 5MB per image)
        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name} is too large. Maximum size is 5MB.`);
          continue;
        }

        console.log(`📤 Uploading image ${i + 1}/${files.length}: ${file.name}`);
        
        try {
          const result = await uploadVendorImage(file);
          uploadedPhotos.push({
            url: result.url,
            publicId: result.publicId
          });
          
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        } catch (uploadError) {
          console.error(`❌ Failed to upload ${file.name}:`, uploadError);
          setError(`Failed to upload ${file.name}. Please try again.`);
        }
      }

      // Add uploaded photos to formData
      if (uploadedPhotos.length > 0) {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, ...uploadedPhotos]
        }));
        console.log(`✅ Successfully uploaded ${uploadedPhotos.length} photos`);
      }
    } catch (error) {
      console.error('❌ Photo upload error:', error);
      setError(error.message || 'Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };


  const validateStep = (step) => {
    console.log('\n🔍 ========== VALIDATION START ==========');
    console.log('Current Step:', step);
    console.log('Form Data:', formData);
    
    // Clear previous field errors
    setFieldErrors({});
    
    switch (step) {
      case 1:
        if (!formData.serviceType && !formData.customService.trim()) {
          setFieldErrors({ serviceType: 'Please select or enter a business category' });
          return 'Please select or enter a business category';
        }
        break;
        
      case 2:
        console.log('\n📋 Step 2 Validation Details:');
        console.log('  businessName:', `"${formData.businessName}"`, '(length:', formData.businessName?.length, ')');
        console.log('  city:', `"${formData.city}"`, '(type:', typeof formData.city, ')');
        console.log('  pincode:', `"${formData.pincode}"`, '(length:', formData.pincode?.length, ')');
        console.log('  area:', `"${formData.area}"`, '(length:', formData.area?.length, ')');
        console.log('  street:', `"${formData.street}"`, '(length:', formData.street?.length, ')');
        console.log('  cities available:', cities.length);
        
        const step2Errors = {};
        
        // Business Name - Required
        const businessNameValue = String(formData.businessName || '').trim();
        if (!businessNameValue) {
          console.log('  ❌ Business name is empty');
          step2Errors.businessName = 'Business name is required';
        } else {
          console.log('  ✓ Business name OK');
        }
        
        // City - Required
        const cityValue = String(formData.city || '').trim();
        if (!cityValue) {
          console.log('  ❌ City is empty');
          step2Errors.city = 'Please select your city';
        } else {
          console.log('  ✓ City OK:', cityValue);
        }
        
        // Pincode - Required and must be 6 digits
        const pincodeValue = String(formData.pincode || '').trim();
        if (!pincodeValue) {
          console.log('  ❌ Pincode is empty');
          step2Errors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(pincodeValue)) {
          console.log('  ❌ Pincode invalid format:', pincodeValue);
          step2Errors.pincode = 'Enter valid 6-digit pincode';
        } else {
          console.log('  ✓ Pincode OK:', pincodeValue);
        }
        
        // Area OR Street - at least one required
        const areaValue = String(formData.area || '').trim();
        const streetValue = String(formData.street || '').trim();
        
        if (!areaValue && !streetValue) {
          console.log('  ❌ Both area and street are empty');
          step2Errors.area = 'Please enter area or street';
          step2Errors.street = 'Please enter area or street';
        } else {
          console.log('  ✓ Area/Street OK - Area:', areaValue, 'Street:', streetValue);
        }
        
        if (Object.keys(step2Errors).length > 0) {
          console.error('\n❌ Step 2 Validation FAILED!');
          console.error('Errors:', step2Errors);
          console.log('========== VALIDATION END ==========\n');
          setFieldErrors(step2Errors);
          return Object.values(step2Errors)[0];
        }
        
        console.log('\n✅ Step 2 Validation PASSED!');
        console.log('========== VALIDATION END ==========\n');
        break;
      case 3:
        if (formData.workingDays.length === 0) {
          setFieldErrors({ workingDays: 'Select at least one working day' });
          return 'Select at least one working day';
        }
        break;
      case 4:
        const step4Errors = {};
        
        if (!formData.contactPerson.trim()) {
          step4Errors.contactPerson = 'Contact person name is required';
        }
        
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10 || !/^[6-9]/.test(phoneDigits)) {
          step4Errors.phone = 'Enter valid 10-digit mobile number';
        }
        
        if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
          step4Errors.email = 'Enter valid email address';
        }
        
        if (!formData.password || formData.password.length < 6) {
          step4Errors.password = 'Password must be at least 6 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
          step4Errors.confirmPassword = 'Passwords do not match';
        }
        
        if (Object.keys(step4Errors).length > 0) {
          setFieldErrors(step4Errors);
          return Object.values(step4Errors)[0];
        }
        break;
      case 5:
        break;
      case 6:
        // Plan selection validation - Free plan is always valid
        if (!formData.selectedPlan) {
          setFieldErrors({ selectedPlan: 'Please select a visibility plan' });
          return 'Please select a visibility plan';
        }
        break;
      case 7:
        const step7Errors = {};
        
        if (!formData.minPrice || !formData.maxPrice) {
          step7Errors.pricing = 'Enter your pricing range';
        } else if (Number(formData.minPrice) >= Number(formData.maxPrice)) {
          step7Errors.maxPrice = 'Max price must be greater than min';
        } else if (Number(formData.minPrice) < 100) {
          step7Errors.minPrice = 'Minimum price seems too low';
        }
        
        if (Object.keys(step7Errors).length > 0) {
          setFieldErrors(step7Errors);
          return Object.values(step7Errors)[0];
        }
        break;
    }
    return null;
  };

  const nextStep = () => {
    console.log('\n🚀 Next Step Button Clicked');
    console.log('Current Step:', currentStep);
    
    const validationError = validateStep(currentStep);
    
    if (validationError) {
      console.log('⛔ Blocking step advancement due to validation error');
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    console.log('✅ Advancing to step', currentStep + 1);
    setError('');
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setError('');
    setFieldErrors({});
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Helper function to get input CSS classes with error styling
  const getInputClass = (fieldName, baseClass = 'w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none') => {
    return fieldErrors[fieldName] 
      ? `${baseClass} border-red-500 bg-red-50` 
      : baseClass;
  };
  
  // Helper to show field error message
  const FieldError = ({ fieldName }) => {
    if (!fieldErrors[fieldName]) return null;
    return <p className="text-red-600 text-sm mt-1">{fieldErrors[fieldName]}</p>;
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
      const selectedCity = cities.find(city => city.name === formData.city);
      // Default coordinates (can be enhanced with geocoding API)
      const [lng, lat] = [75.8577, 22.7196];

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
        serviceType: formData.serviceType || formData.customService.trim(),
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
        description: formData.description.trim() || undefined,
        photos: formData.photos || [] // Include uploaded Cloudinary photos
      };

      console.log('📤 Registration payload:', { ...payload, password: '***' });

      const response = await fetch('http://localhost:5000/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Registration failed');
      }

      console.log('✅ Vendor registration successful:', data);
      if (data.data?.mediaUploaded) {
        console.log(`📸 ${data.data.mediaUploaded} photos uploaded successfully`);
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
    handleChange('customService', ''); // Clear manual entry
  };

  const handleLoginSuccess = (vendor) => {
    // Navigate to vendor dashboard after successful login
    navigate('/vendor-dashboard');
  };

  // Payment Gateway Handlers
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handlePayNow = async () => {
    if (!selectedPaymentMethod) {
      setPaymentError('Please select a payment method');
      return;
    }

    setPaymentState('initiating');
    setPaymentError('');

    try {
      // Step 1: Create payment order on backend
      const totalAmount = formData.planPrice + Math.round(formData.planPrice * 0.18);
      
      const orderResponse = await fetch('http://localhost:5000/api/vendors/create-payment-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          planId: formData.selectedPlan,
          planName: visibilityPlans.find(p => p.id === formData.selectedPlan)?.name,
          vendorEmail: formData.email,
          vendorName: formData.businessName,
          paymentMethod: selectedPaymentMethod
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      setPaymentOrderId(orderData.orderId);

      // Step 2: Simulate payment processing (In production, integrate with Razorpay SDK)
      setPaymentState('processing');

      // Simulate payment gateway delay (2-3 seconds like real payment gateways)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Step 3: Simulate payment success (90% success rate for demo)
      const isSuccess = Math.random() > 0.1; // 90% success rate

      if (isSuccess) {
        // Generate mock payment ID
        const mockPaymentId = `pay_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        setPaymentId(mockPaymentId);

        // Verify payment on backend
        setPaymentState('verifying');

        const verifyResponse = await fetch('http://localhost:5000/api/vendors/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.orderId,
            paymentId: mockPaymentId,
            signature: 'mock_signature_' + mockPaymentId
          })
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
          throw new Error(verifyData.message || 'Payment verification failed');
        }

        // Payment successful!
        setPaymentState('success');

      } else {
        // Simulate payment failure
        throw new Error('Payment declined by bank. Please try again or use a different payment method.');
      }

    } catch (err) {
      console.error('💳 Payment error:', err);
      setPaymentError(err.message || 'Payment processing failed');
      setPaymentState('failed');
    }
  };

  const handlePaymentRetry = () => {
    setPaymentState('idle');
    setPaymentError('');
    setSelectedPaymentMethod('');
  };

  const handlePaymentSuccess = () => {
    // After successful payment, proceed to submit registration
    setPaymentState('idle');
    handleSubmit();
  };

  const handlePayLater = () => {
    // User wants to pay later - register with free plan for now
    handleChange('selectedPlan', 'free');
    handleChange('planPrice', 0);
    handleChange('planDuration', 'Forever');
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
            {[1, 2, 3, 4, 5, 6, 7].map((step, index) => (
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
                    {step === 7 && 'Plans'}
                  </span>
                </div>
                {index < 6 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step + 1 ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Error Message - Sticky at top */}
        {error && (
          <div className="sticky top-0 z-50 mb-4 bg-red-100 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded shadow-lg">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold text-base">{error}</p>
                <p className="text-sm mt-1">Please fill the required fields correctly before proceeding.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
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

                {/* Unified Category Browser */}
                {!servicesLoading && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Business Category <span className="text-red-500">*</span>
                    </label>

                    {/* Selected Category Display */}
                    {(formData.serviceType || formData.customService) && (
                      <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-800 font-medium">
                          Selected: {formData.serviceType ? (vendorServices.find(s => s.value === formData.serviceType)?.label) : formData.customService}
                        </span>
                      </div>
                    )}

                    {/* Services List with Search */}
                    <div className="border-2 border-gray-300 rounded-lg shadow-md overflow-hidden">
                      {/* Search within categories */}
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                          <input
                            type="text"
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            placeholder="Search categories (e.g., photographer, caterer, DJ, makeup)"
                            className="w-full h-12 pl-12 pr-4 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      {/* Scrollable services list */}
                      <div className="max-h-64 overflow-y-auto">
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
                          const categoryServices = filteredServices.filter(s => s.category === cat);
                          if (categoryServices.length === 0) return null;
                          
                          return (
                            <div key={cat} className="border-t border-gray-100 first:border-t-0">
                              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide sticky top-0">
                                {cat}
                              </div>
                              <div className="bg-white">
                                {categoryServices.map((service) => (
                                  <button
                                    key={service.value}
                                    type="button"
                                    onClick={() => handleCategorySelect(service)}
                                    className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-3 border-t border-gray-50 first:border-t-0 transition-colors
                                              ${formData.serviceType === service.value ? 'bg-blue-50 border-blue-200' : ''}`}
                                  >
                                    <span className="text-xl flex-shrink-0">{service.icon}</span>
                                    <span className="text-sm text-gray-700 flex-1">{service.label}</span>
                                    {formData.serviceType === service.value && (
                                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Manual Category Entry - Below Dropdown */}
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                      <div className="flex items-start gap-2 mb-3">
                        <Info className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Can't find your category?</p>
                          <p className="text-xs text-gray-600">Enter your service or business category manually below</p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={formData.customService}
                        onChange={(e) => {
                          handleChange('customService', e.target.value);
                          handleChange('serviceType', ''); // Clear dropdown selection
                        }}
                        placeholder="e.g. Luxury Wedding Rentals, Event Photography, etc."
                        className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Debug Info - Remove in production */}
                <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs font-mono">
                  <div className="font-bold mb-2">🔍 Debug Info (Remove in production):</div>
                  <div>businessName: "{formData.businessName}" ({formData.businessName?.length} chars)</div>
                  <div>city: "{formData.city}" (type: {typeof formData.city})</div>
                  <div>pincode: "{formData.pincode}" ({formData.pincode?.length} chars)</div>
                  <div>area: "{formData.area}" ({formData.area?.length} chars)</div>
                  <div>street: "{formData.street}" ({formData.street?.length} chars)</div>
                  <div>Cities loaded: {cities.length}</div>
                  <div className="mt-2 text-blue-600">Open browser console (F12) for detailed logs</div>
                </div>
                
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Business Details</h2>
                  <p className="text-sm text-gray-600">
                    Tell us about your business location. 
                    <span className="text-red-500 font-medium"> * Required fields</span>
                  </p>
                  
                  {/* Field Completion Tracker */}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-1 rounded ${formData.businessName?.trim() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {formData.businessName?.trim() ? '✓' : '○'} Business Name
                    </span>
                    <span className={`px-2 py-1 rounded ${formData.city?.trim() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {formData.city?.trim() ? '✓' : '○'} City
                    </span>
                    <span className={`px-2 py-1 rounded ${formData.pincode?.trim() && /^\d{6}$/.test(formData.pincode) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {formData.pincode?.trim() && /^\d{6}$/.test(formData.pincode) ? '✓' : '○'} Pincode
                    </span>
                    <span className={`px-2 py-1 rounded ${(formData.area?.trim() || formData.street?.trim()) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {(formData.area?.trim() || formData.street?.trim()) ? '✓' : '○'} Area/Street
                    </span>
                  </div>
                  
                  {Object.keys(fieldErrors).length > 0 && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
                      ⚠️ {Object.keys(fieldErrors).length} field(s) need attention
                    </div>
                  )}
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
                      className={getInputClass('businessName', 
                        'w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500')}
                    />
                    <FieldError fieldName="businessName" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      disabled={citiesLoading}
                      className={getInputClass('city',
                        'w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500')}
                    >
                      <option value="">
                        {citiesLoading 
                          ? 'Loading cities...' 
                          : cities.length > 0 
                            ? 'Select City' 
                            : 'No cities available'}
                      </option>
                      {cities && cities.length > 0 ? (
                        cities.map((city, index) => (
                          <option key={city.name || index} value={city.name}>
                            {city.name}
                          </option>
                        ))
                      ) : (
                        !citiesLoading && <option value="" disabled>No cities found</option>
                      )}
                    </select>
                    <FieldError fieldName="city" />
                    {!citiesLoading && cities.length === 0 && !fieldErrors.city && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ No cities loaded. Please refresh the page.
                      </p>
                    )}
                    {cities.length > 0 && !fieldErrors.city && (
                      <p className="text-xs text-gray-500 mt-1">
                        {cities.length} cities available
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only digits
                        if (value.length <= 6) handleChange('pincode', value);
                      }}
                      placeholder="452001"
                      maxLength="6"
                      className={getInputClass('pincode',
                        'w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500')}
                    />
                    <FieldError fieldName="pincode" />
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
                      className={getInputClass('street',
                        'w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500')}
                    />
                    <FieldError fieldName="street" />
                    {!fieldErrors.street && (
                      <p className="text-xs text-gray-500 mt-1">Fill either Street or Area/Locality (at least one required)</p>
                    )}
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
                      className={getInputClass('area',
                        'w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500')}
                    />
                    <FieldError fieldName="area" />
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
                  <p className="text-sm text-gray-600">Add up to 10 photos to showcase your work</p>
                </div>

                {/* Photo Upload Area */}
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhotos || formData.photos.length >= 10}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingPhotos ? (
                      <div className="space-y-3">
                        <Loader2 className="w-12 h-12 text-indigo-600 mx-auto animate-spin" />
                        <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                          {formData.photos.length >= 10 
                            ? 'Maximum 10 photos uploaded'
                            : 'Click to upload photos or drag and drop'
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 5MB each • {formData.photos.length}/10 uploaded
                        </p>
                      </>
                    )}
                  </button>

                  {/* Photo Grid */}
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo.url}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                            Photo {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Service Pricing */}
            {currentStep === 6 && (
              <div className="space-y-6">
                {/* Header with Clear Separation */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <IndianRupee className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-1">Set Your Service Pricing</h2>
                      <p className="text-sm text-gray-700">
                        Define your service charges that customers will see
                      </p>
                      <p className="text-xs text-blue-700 mt-1 font-medium">
                        💡 Note: This is your service pricing, not the platform subscription fee
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing Range Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                      1
                    </span>
                    Set your service pricing range
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Minimum Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg flex items-center justify-center group-focus-within:border-indigo-500 group-focus-within:bg-indigo-50 transition-colors">
                          <IndianRupee className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-600" />
                        </div>
                        <input
                          type="number"
                          value={formData.minPrice}
                          onChange={(e) => handleChange('minPrice', e.target.value)}
                          placeholder="10000"
                          min="0"
                          step="1000"
                          className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg text-base font-medium
                                   focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                                   transition-all"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">Starting price for your services</p>
                    </div>

                    {/* Maximum Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg flex items-center justify-center group-focus-within:border-indigo-500 group-focus-within:bg-indigo-50 transition-colors">
                          <IndianRupee className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-600" />
                        </div>
                        <input
                          type="number"
                          value={formData.maxPrice}
                          onChange={(e) => handleChange('maxPrice', e.target.value)}
                          placeholder="50000"
                          min="0"
                          step="1000"
                          className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg text-base font-medium
                                   focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                                   transition-all"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">Maximum price for premium services</p>
                    </div>
                  </div>

                  {/* Price Preview */}
                  {formData.minPrice && formData.maxPrice && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <span className="font-semibold">Your pricing range:</span> ₹{formData.minPrice?.toLocaleString()} - ₹{formData.maxPrice?.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Price Unit Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                      2
                    </span>
                    Price Unit
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How do you charge for your services?
                    </label>
                    <select
                      value={formData.priceUnit}
                      onChange={(e) => handleChange('priceUnit', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-medium
                               focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                               bg-white cursor-pointer transition-all"
                    >
                      <option value="per event">Per Event</option>
                      <option value="per day">Per Day</option>
                      <option value="per hour">Per Hour</option>
                      <option value="per plate">Per Plate</option>
                      <option value="per person">Per Person</option>
                      <option value="per sqft">Per Square Feet</option>
                      <option value="per package">Per Package</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1.5">Select how you typically charge customers</p>
                  </div>
                </div>

                {/* Business Description Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                      3
                    </span>
                    Business Description (Optional)
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tell customers about your business
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Tell customers about your business, experience, and services..."
                      rows="5"
                      maxLength="500"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base
                               focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                               transition-all resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">Share your expertise, experience, and what makes you unique</p>
                      <p className="text-xs text-gray-400">{formData.description?.length || 0}/500</p>
                    </div>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Important:</p>
                      <p>These prices will be visible to customers. Make sure they accurately reflect your service charges.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Choose Visibility Plan */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Visibility Plan</h2>
                  <p className="text-sm text-gray-600 mb-1">Select a plan that fits your business goals</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg mt-3">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-700 font-medium">
                      Plans affect your <strong>visibility on the platform</strong>, not your service charges
                    </p>
                  </div>
                </div>

                {/* Plan Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  {visibilityPlans.map((plan) => {
                    const PlanIcon = plan.icon;
                    const isSelected = formData.selectedPlan === plan.id;
                    const isPaid = plan.price > 0;
                    
                    // Static color classes based on plan.color
                    const getColorClasses = () => {
                      if (!isSelected) {
                        return {
                          border: 'border-gray-200',
                          bg: 'bg-white',
                          iconBg: plan.color === 'green' ? 'bg-green-100' : 
                                  plan.color === 'indigo' ? 'bg-indigo-100' : 
                                  plan.color === 'purple' ? 'bg-purple-100' : 'bg-amber-100',
                          iconText: plan.color === 'green' ? 'text-green-600' : 
                                    plan.color === 'indigo' ? 'text-indigo-600' : 
                                    plan.color === 'purple' ? 'text-purple-600' : 'text-amber-600',
                          checkIcon: 'text-green-600',
                          borderT: 'border-gray-200',
                          selectedText: ''
                        };
                      }
                      
                      return {
                        border: plan.color === 'green' ? 'border-green-500' : 
                                plan.color === 'indigo' ? 'border-indigo-500' : 
                                plan.color === 'purple' ? 'border-purple-500' : 'border-amber-500',
                        bg: plan.color === 'green' ? 'bg-green-50' : 
                            plan.color === 'indigo' ? 'bg-indigo-50' : 
                            plan.color === 'purple' ? 'bg-purple-50' : 'bg-amber-50',
                        iconBg: plan.color === 'green' ? 'bg-green-500' : 
                                plan.color === 'indigo' ? 'bg-indigo-500' : 
                                plan.color === 'purple' ? 'bg-purple-500' : 'bg-amber-500',
                        iconText: 'text-white',
                        checkIcon: plan.color === 'green' ? 'text-green-600' : 
                                   plan.color === 'indigo' ? 'text-indigo-600' : 
                                   plan.color === 'purple' ? 'text-purple-600' : 'text-amber-600',
                        borderT: plan.color === 'green' ? 'border-green-200' : 
                                 plan.color === 'indigo' ? 'border-indigo-200' : 
                                 plan.color === 'purple' ? 'border-purple-200' : 'border-amber-200',
                        selectedText: plan.color === 'green' ? 'text-green-600' : 
                                      plan.color === 'indigo' ? 'text-indigo-600' : 
                                      plan.color === 'purple' ? 'text-purple-600' : 'text-amber-600'
                      };
                    };
                    
                    const colors = getColorClasses();
                    
                    return (
                      <div
                        key={plan.id}
                        onClick={() => {
                          handleChange('selectedPlan', plan.id);
                          handleChange('planPrice', plan.price);
                          handleChange('planDuration', plan.duration);
                        }}
                        className={`relative cursor-pointer rounded-2xl border-2 transition-all transform hover:scale-105 ${
                          colors.border
                        } ${colors.bg} ${
                          isSelected ? 'shadow-xl' : 'hover:border-gray-300 hover:shadow-lg'
                        } ${plan.popular ? 'ring-4 ring-indigo-100' : ''}`}
                      >
                        {/* Popular Badge */}
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-xs font-bold shadow-lg">
                              <Sparkles className="w-3 h-3" />
                              Most Popular
                            </div>
                          </div>
                        )}

                        <div className="p-6">
                          {/* Plan Header */}
                          <div className="text-center mb-4">
                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 ${colors.iconBg}`}>
                              <PlanIcon className={`w-7 h-7 ${colors.iconText}`} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                            <div className="flex items-baseline justify-center gap-1">
                              {plan.price === 0 ? (
                                <span className="text-3xl font-bold text-green-600">Free</span>
                              ) : (
                                <>
                                  <span className="text-2xl font-bold text-gray-900">₹{plan.price}</span>
                                  <span className="text-sm text-gray-600">/{plan.duration}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Features */}
                          <div className="space-y-2 mb-4">
                            {plan.features.map((feature, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${colors.checkIcon}`} />
                                <span className="text-xs text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Selection Indicator */}
                          <div className={`text-center pt-4 border-t ${colors.borderT}`}>
                            {isSelected ? (
                              <div className={`flex items-center justify-center gap-2 ${colors.selectedText} font-semibold text-sm`}>
                                <CheckCircle className="w-5 h-5" />
                                Selected
                              </div>
                            ) : (
                              <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                                Select Plan
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Plan Comparison Helper */}
                <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Why upgrade?</h4>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Higher plans get better visibility in search results, featured placements on category pages, 
                        verified badges that build trust, and priority customer support. Your service pricing remains 
                        completely independent - you set your own rates regardless of the plan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Gateway for Paid Plans */}
                {formData.selectedPlan !== 'free' && formData.planPrice > 0 && (
                  <div className="mt-6 bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">Complete Your Payment</h4>
                          <p className="text-xs text-blue-100">Secure & Encrypted Transaction</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                          <Lock className="w-4 h-4 text-white" />
                          <span className="text-xs font-semibold text-white">100% Secure</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="p-6">
                      {/* Plan Summary */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Selected Plan</p>
                            <h5 className="text-lg font-bold text-gray-900">{visibilityPlans.find(p => p.id === formData.selectedPlan)?.name} Plan</h5>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">₹{formData.planPrice}</p>
                            <p className="text-xs text-gray-500">/{formData.planDuration}</p>
                          </div>
                        </div>
                        
                        {/* Price Breakdown */}
                        <div className="border-t border-green-200 pt-3 mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subscription Fee</span>
                            <span className="font-medium text-gray-900">₹{formData.planPrice}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">GST (18%)</span>
                            <span className="font-medium text-gray-900">₹{Math.round(formData.planPrice * 0.18)}</span>
                          </div>
                          <div className="border-t border-green-300 pt-2 mt-2 flex justify-between">
                            <span className="text-base font-bold text-gray-900">Total Amount</span>
                            <span className="text-xl font-bold text-green-600">₹{formData.planPrice + Math.round(formData.planPrice * 0.18)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="mb-6">
                        <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          Choose Payment Method
                        </h5>
                        {paymentError && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span className="text-xs text-red-700">{paymentError}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {/* UPI */}
                          <button 
                            onClick={() => handlePaymentMethodSelect('upi')}
                            className={`group border-2 rounded-xl p-4 transition-all hover:shadow-md ${
                              selectedPaymentMethod === 'upi' 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-blue-500'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Smartphone className="w-6 h-6 text-purple-600" />
                              </div>
                              <span className="text-xs font-semibold text-gray-700">UPI</span>
                              <span className="text-[10px] text-gray-500">GPay, PhonePe</span>
                              {selectedPaymentMethod === 'upi' && (
                                <CheckCircle className="w-4 h-4 text-blue-600 absolute top-2 right-2" />
                              )}
                            </div>
                          </button>

                          {/* Cards */}
                          <button 
                            onClick={() => handlePaymentMethodSelect('card')}
                            className={`group border-2 rounded-xl p-4 transition-all hover:shadow-md relative ${
                              selectedPaymentMethod === 'card' 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-blue-500'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                              </div>
                              <span className="text-xs font-semibold text-gray-700">Cards</span>
                              <span className="text-[10px] text-gray-500">Credit/Debit</span>
                              {selectedPaymentMethod === 'card' && (
                                <CheckCircle className="w-4 h-4 text-blue-600 absolute top-2 right-2" />
                              )}
                            </div>
                          </button>

                          {/* Net Banking */}
                          <button 
                            onClick={() => handlePaymentMethodSelect('netbanking')}
                            className={`group border-2 rounded-xl p-4 transition-all hover:shadow-md relative ${
                              selectedPaymentMethod === 'netbanking' 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-blue-500'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Building className="w-6 h-6 text-green-600" />
                              </div>
                              <span className="text-xs font-semibold text-gray-700">Banking</span>
                              <span className="text-[10px] text-gray-500">Net Banking</span>
                              {selectedPaymentMethod === 'netbanking' && (
                                <CheckCircle className="w-4 h-4 text-blue-600 absolute top-2 right-2" />
                              )}
                            </div>
                          </button>

                          {/* Wallets */}
                          <button 
                            onClick={() => handlePaymentMethodSelect('wallet')}
                            className={`group border-2 rounded-xl p-4 transition-all hover:shadow-md relative ${
                              selectedPaymentMethod === 'wallet' 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-blue-500'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Wallet className="w-6 h-6 text-orange-600" />
                              </div>
                              <span className="text-xs font-semibold text-gray-700">Wallets</span>
                              <span className="text-[10px] text-gray-500">Paytm, Amazon</span>
                              {selectedPaymentMethod === 'wallet' && (
                                <CheckCircle className="w-4 h-4 text-blue-600 absolute top-2 right-2" />
                              )}
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Payment Actions */}
                      <div className="space-y-3">
                        {/* Pay Now Button */}
                        <button 
                          onClick={handlePayNow}
                          disabled={!selectedPaymentMethod || paymentState !== 'idle'}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-600 disabled:hover:to-emerald-600"
                        >
                          <Lock className="w-5 h-5" />
                          <span>Pay ₹{formData.planPrice + Math.round(formData.planPrice * 0.18)} Now</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        {/* Pay Later Option */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-3 text-gray-500 font-medium">OR</span>
                          </div>
                        </div>

                        <button 
                          onClick={handlePayLater}
                          className="w-full border-2 border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Pay Later from Dashboard</span>
                        </button>

                        {/* Info Note */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800 leading-relaxed">
                            <span className="font-semibold">Pay Later:</span> You can complete registration now and make payment from your dashboard. 
                            Your account will be active, but premium features will activate after payment confirmation.
                          </p>
                        </div>
                      </div>

                      {/* Trust Badges */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span>SSL Secured</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Lock className="w-4 h-4 text-blue-600" />
                            <span>PCI Compliant</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-purple-600" />
                            <span>Razorpay Secured</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Processing Modal Overlays */}
          {(paymentState === 'initiating' || paymentState === 'processing' || paymentState === 'verifying') && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                {/* Animated Spinner */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Processing Status */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {paymentState === 'initiating' && 'Initiating Payment...'}
                  {paymentState === 'processing' && 'Processing Payment'}
                  {paymentState === 'verifying' && 'Verifying Payment'}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {paymentState === 'initiating' && 'Connecting to secure payment gateway'}
                  {paymentState === 'processing' && 'Please wait while we process your payment securely'}
                  {paymentState === 'verifying' && 'Payment received! Verifying transaction...'}
                </p>

                {/* Security Indicators */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span>Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-blue-600" />
                    <span>Secured</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-purple-600" />
                    <span>PCI DSS</span>
                  </div>
                </div>

                {/* Do Not Close Warning */}
                <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 font-medium">
                    ⚠️ Please do not close this window or press back button
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Success Modal */}
          {paymentState === 'success' && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                {/* Success Animation */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-16 h-16 text-green-600 animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your payment has been processed successfully
                  </p>

                  {/* Payment Details */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-left space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Plan</span>
                      <span className="font-semibold text-gray-900">
                        {visibilityPlans.find(p => p.id === formData.selectedPlan)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="font-bold text-green-600">
                        ₹{formData.planPrice + Math.round(formData.planPrice * 0.18)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment ID</span>
                      <span className="font-mono text-xs text-gray-700">{paymentId.substring(0, 20)}...</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium text-gray-900 capitalize">{selectedPaymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Your Plan Benefits
                  </h4>
                  <ul className="space-y-1 text-xs text-gray-700">
                    {visibilityPlans.find(p => p.id === formData.selectedPlan)?.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={handlePaymentSuccess}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all group"
                >
                  <span>Complete Registration</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Receipt Note */}
                <p className="text-xs text-center text-gray-500 mt-4">
                  📧 Payment receipt will be sent to {formData.email}
                </p>
              </div>
            </div>
          )}

          {/* Payment Failed Modal */}
          {paymentState === 'failed' && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                {/* Error Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-16 h-16 text-red-600" />
                  </div>
                </div>

                {/* Error Message */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We couldn't process your payment
                  </p>

                  {/* Error Details */}
                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-800">{paymentError}</p>
                      </div>
                    </div>
                  )}

                  {/* Common Reasons */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Common reasons:</h4>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Insufficient balance or credit limit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Incorrect card details or expired card</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Transaction declined by bank</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Network connectivity issues</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handlePaymentRetry}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    <span>Try Again</span>
                  </button>

                  <button
                    onClick={handlePayLater}
                    className="w-full border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all"
                  >
                    Register with Free Plan Instead
                  </button>
                </div>

                {/* Support Note */}
                <p className="text-xs text-center text-gray-500 mt-4">
                  Need help? Contact support at support@example.com
                </p>
              </div>
            </div>
          )}

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
