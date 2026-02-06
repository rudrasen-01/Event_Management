import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const VendorLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/vendors/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store vendor info and JWT token in localStorage
        const vendor = data.data;
        const token = data.token;
        
        // Store JWT token for API authentication
        localStorage.setItem('authToken', token);
        localStorage.setItem('vendorToken', token); // Backward compatibility
        
        // Store vendor info
        localStorage.setItem('vendorId', vendor._id);
        localStorage.setItem('vendorEmail', vendor.email);
        localStorage.setItem('vendorBusinessName', vendor.businessName || vendor.name);
        localStorage.setItem('userRole', 'vendor');
        
        // Call success callback
        onLoginSuccess(vendor);
        
        // Close modal
        onClose();
        
        // Reset form
        setEmail('');
        setPassword('');
      } else {
        setError(data.error?.message || data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative animate-fadeIn my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Login</h2>
          <p className="text-sm text-gray-600">Access your vendor dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg
                     hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Forgot Password?
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.href = '/vendor-registration';
                }}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Register as Vendor
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorLoginModal;
