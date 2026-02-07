import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, User, Phone, DollarSign, Calendar, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import ModalErrorBoundary from './ModalErrorBoundary';
import { useAuth } from '../contexts/AuthContext';

/**
 * InquiryModal Component
 * 
 * A professional modal for capturing customer inquiries to vendors
 * Includes form validation, API integration, and accessibility features
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {Function} onClose - Callback to close modal
 * @param {Object} vendor - Vendor object (includes _id, name, etc.)
 * @param {Object} userLocation - User's current location { latitude, longitude }
 * @param {string} prefilledEventType - Pre-selected event type (optional)
 */
const InquiryModal = ({ 
  isOpen, 
  onClose, 
  vendor, 
  userLocation,
  prefilledEventType = '' 
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Initialize ALL fields with safe defaults (empty strings prevent .length errors)
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userContact: '',
    eventType: prefilledEventType || '',
    budget: '',
    message: '' // Always string, never undefined
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }
  const [errors, setErrors] = useState({});
  const defaultEventTypes = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'birthday', label: 'Birthday Party' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'other', label: 'Other' }
  ];

  const [eventTypes, setEventTypes] = useState(defaultEventTypes);
  const [loadingEventTypes, setLoadingEventTypes] = useState(false);

  // Refs for accessibility
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Focus trap elements
  const focusableElements = useRef([]);

  // Fetch event types from API
  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        setLoadingEventTypes(true);
        const response = await fetch('http://localhost:5000/api/services');
        const raw = await response.text();
        let data;
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch (parseErr) {
          console.warn('Could not parse /api/services response as JSON, keeping defaults.', parseErr, raw);
          return;
        }

        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const types = data.data
            .map(service => ({
              value: service.serviceId || service._id || service.id,
              label: service.name || service.title || (service.serviceId || service._id || 'Unknown')
            }))
            .filter(t => t && t.value);

          if (types.length > 0) setEventTypes(types);
        }
      } catch (error) {
        console.error('Error fetching event types:', error);
        // keep default eventTypes
      } finally {
        setLoadingEventTypes(false);
      }
    };

    // Fetch but do not override defaults unless we have good data
    fetchEventTypes();
  }, []);

  // Reset form when modal opens - auto-fill user data if logged in
  useEffect(() => {
    if (isOpen) {
      setFormData({
        userName: (isAuthenticated() && user?.name) ? user.name : '',
        userEmail: (isAuthenticated() && user?.email) ? user.email : '',
        userContact: (isAuthenticated() && user?.phone) ? user.phone : '',
        eventType: prefilledEventType || '',
        budget: '',
        message: '' // Explicit empty string prevents undefined
      });
      setErrors({});
      setNotification(null);
      
      // Focus first input after modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, prefilledEventType, user, isAuthenticated]);

  // ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Get all focusable elements
      focusableElements.current = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;

        const len = (focusableElements.current && focusableElements.current.length) || 0;
        if (len === 0) return;

        const firstElement = focusableElements.current[0];
        const lastElement = focusableElements.current[len - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle input changes - Contact form jaise simple
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form - Contact form jaise simple
  const validateForm = () => {
    try {
      const newErrors = {};

      // Safe validation checks
      const name = formData.userName ? String(formData.userName).trim() : '';
      if (!name || name.length < 2) {
        newErrors.userName = 'Name must be at least 2 characters';
      }

      const contact = formData.userContact ? String(formData.userContact).replace(/[\s-]/g, '') : '';
      if (!contact || !/^[0-9]{10}$/.test(contact)) {
        newErrors.userContact = 'Please enter a valid 10-digit phone number';
      }

      if (!formData.eventType) {
        newErrors.eventType = 'Event type is required';
      }

      // Budget check - simple
      if (vendor && vendor._id) {
        if (!formData.budget || formData.budget === '') {
          newErrors.budget = 'Budget is required';
        } else if (Number(formData.budget) < 0) {
          newErrors.budget = 'Budget must be a positive number';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (err) {
      console.error('❌ VALIDATION ERROR:', err);
      console.error('❌ formData at error:', formData);
      console.error('❌ Stack:', err.stack);
      setNotification({ type: 'error', message: 'Validation error: ' + err.message });
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in first
    if (!isAuthenticated()) {
      setNotification({
        type: 'error',
        message: 'Please login or register to submit an inquiry. Click the Login button in the header.'
      });
      return;
    }

    // Top-level guard so unexpected runtime errors during submit don't bubble
    try {
      let isValid = false;
      try {
        isValid = validateForm();
      } catch (vErr) {
        console.error('❌ Validation error:', vErr);
        console.error('❌ Stack:', vErr.stack);
        setNotification({ type: 'error', message: 'Validation failed: ' + vErr.message });
        return;
      }

      if (!isValid) {
        setNotification({
          type: 'error',
          message: 'Please fix the errors in the form'
        });
        return;
      }

      setLoading(true);
      setNotification(null);

      // Safe data construction - sabse pehle string mein convert karo
      const inquiryData = {
        userName: String(formData.userName || '').trim(),
        userEmail: formData.userEmail ? String(formData.userEmail).trim() : undefined,
        userContact: String(formData.userContact || '').trim(),
        eventType: String(formData.eventType || ''),
        budget: formData.budget ? parseInt(formData.budget) : 0,
        message: formData.message ? String(formData.message).trim() : undefined,
        vendorId: vendor?._id,
        location: userLocation ? {
          type: 'Point',
          coordinates: [userLocation.longitude || 0, userLocation.latitude || 0]
        } : undefined,
        city: vendor?.city || undefined,
        inquiryType: vendor?._id ? 'vendor_inquiry' : 'general_inquiry',
        source: 'website',
        status: 'pending'
      };

      const response = await fetch('http://localhost:5000/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData)
      });
      
      // Safe response parsing
      let data;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseErr) {
        console.error('❌ JSON parse error:', parseErr);
        throw new Error('Invalid server response');
      }

      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Inquiry sent successfully! The vendor will contact you soon.'
        });

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(data.message || data.error?.message || 'Failed to send inquiry');
      }
    } catch (error) {
      console.error('❌ INQUIRY ERROR:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Stack trace:', error.stack);
      console.error('❌ formData at error:', formData);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to send inquiry. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Render modal using Portal to ensure it's outside any parent container
  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ isolation: 'isolate' }}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-backdropFadeIn"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Container - Properly Centered */}
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          ref={modalRef}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-modalSlideIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 
                  id="modal-title" 
                  className="text-xl font-bold text-white"
                >
                  Send Inquiry
                </h2>
                <p className="text-indigo-100 text-sm mt-0.5">
                  To: {vendor?.name || 'Vendor'}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body - Compact & Responsive */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Login Required Notice */}
            {!isAuthenticated() && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-yellow-900 mb-1">Login Required</h3>
                    <p className="text-sm text-yellow-800 mb-2">
                      You need to login or register before submitting an inquiry to vendors.
                    </p>
                    <p className="text-xs text-yellow-700">
                      Please click the <span className="font-semibold">"Login"</span> button in the header to continue.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notification */}
            {notification && (
              <div
                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  notification.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {notification.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {notification.message}
                </p>
              </div>
            )}

            {/* User Name */}
            <div>
              <label htmlFor="userName" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                Your Name
              </label>
              <input
                ref={firstInputRef}
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                disabled={loading || !isAuthenticated() || (isAuthenticated() && user?.name)}
                readOnly={(isAuthenticated() && user?.name) || !isAuthenticated()}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                  !isAuthenticated() ? 'bg-gray-200 cursor-not-allowed' : (isAuthenticated() && user?.name ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50')
                } ${
                  errors.userName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder={!isAuthenticated() ? 'Login required' : 'Enter your full name'}
              />
              {errors.userName && (
                <p className="mt-1 text-xs text-red-600">{errors.userName}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="userContact" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <Phone className="w-4 h-4 text-green-600" />
                Contact Number
              </label>
              <input
                type="tel"
                id="userContact"
                name="userContact"
                value={formData.userContact}
                onChange={handleChange}
                disabled={loading || !isAuthenticated() || (isAuthenticated() && user?.phone)}
                readOnly={(isAuthenticated() && user?.phone) || !isAuthenticated()}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  !isAuthenticated() ? 'bg-gray-200 cursor-not-allowed' : (isAuthenticated() && user?.phone ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50')
                } ${
                  errors.userContact ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder={!isAuthenticated() ? 'Login required' : 'Enter 10-digit phone number'}
              />
              {errors.userContact && (
                <p className="mt-1 text-xs text-red-600">{errors.userContact}</p>
              )}
            </div>

            {/* Email (Optional) */}
            <div>
              <label htmlFor="userEmail" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email <span className="text-xs text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                id="userEmail"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleChange}
                disabled={loading || !isAuthenticated() || (isAuthenticated() && user?.email)}
                readOnly={(isAuthenticated() && user?.email) || !isAuthenticated()}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  !isAuthenticated() ? 'bg-gray-200 cursor-not-allowed' : (isAuthenticated() && user?.email ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50')
                } border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder={!isAuthenticated() ? 'Login required' : 'your@email.com'}
              />
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor="eventType" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                Event Type
              </label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                disabled={loading || loadingEventTypes || !isAuthenticated()}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  !isAuthenticated() ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50'
                } ${
                  errors.eventType ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="" disabled>
                  {!isAuthenticated() ? 'Login required' : (loadingEventTypes ? 'Loading...' : 'Select event type')}
                </option>
                {(eventTypes || defaultEventTypes).map((type, index) => (
                  <option key={index} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.eventType && (
                <p className="mt-1 text-xs text-red-600">{errors.eventType}</p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Your Budget (₹)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                disabled={loading || !isAuthenticated()}
                min="0"
                step="1000"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  !isAuthenticated() ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50'
                } ${
                  errors.budget ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder={!isAuthenticated() ? 'Login required' : 'Enter your budget in rupees'}
              />
              {errors.budget && (
                <p className="mt-1 text-xs text-red-600">{errors.budget}</p>
              )}
              {vendor?.pricing?.min && vendor?.pricing?.max && (
                <p className="mt-1 text-xs text-gray-500">
                  Vendor's range: ₹{(vendor.pricing.min / 1000).toFixed(0)}K - ₹{(vendor.pricing.max / 1000).toFixed(0)}K
                </p>
              )}
            </div>

            {/* Message/Requirements (Optional) */}
            <div>
              <label htmlFor="message" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Message <span className="text-xs text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message || ''}
                onChange={handleChange}
                disabled={loading || !isAuthenticated()}
                rows="2"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
                  !isAuthenticated() ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50 border-gray-200'
                }`}
                placeholder={!isAuthenticated() ? 'Login required' : 'Any specific requirements...'}
                maxLength="300"
              />
              {/* 100% safe counter */}
              {formData.message && String(formData.message).length > 0 && (
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {String(formData.message).length}/300
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isAuthenticated()}
                className={`flex-1 px-4 py-2.5 font-bold text-sm rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  !isAuthenticated() 
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : !isAuthenticated() ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Login Required
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Inquiry
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="px-6 pb-5">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Privacy:</span> Your information will be shared with the vendor only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use createPortal to render modal outside the component tree
  return createPortal(
    <ModalErrorBoundary>{modalContent}</ModalErrorBoundary>,
    document.body
  );
};

export default InquiryModal;
