import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Download, CheckCircle, AlertCircle, Calendar, 
  ArrowRight, TrendingUp, Award, Crown, Sparkles, Lock, 
  RefreshCw, FileText, IndianRupee, Clock, Shield, Star,
  ChevronRight, Receipt, Package, Zap, Building, Wallet, 
  X, Info, Smartphone
} from 'lucide-react';
import { getApiUrl } from '../../config/api';

const API_BASE_URL = getApiUrl();

const VendorPaymentDashboard = () => {
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // Upgrade plan states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState(null);
  
  // Payment gateway states
  const [paymentState, setPaymentState] = useState('idle'); // idle, initiating, processing, verifying, success, failed
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Plan configurations
  const PLANS = {
    free: {
      icon: Package,
      color: 'gray',
      gradient: 'from-gray-100 to-gray-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      price: 0,
      name: 'Free'
    },
    starter: {
      icon: Zap,
      color: 'blue',
      gradient: 'from-blue-100 to-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      price: 999,
      name: 'Starter',
      duration: 'per month',
      features: ['Verified badge', 'Up to 15 images/videos', 'Higher search ranking', 'Blog posts enabled', 'Priority customer support']
    },
    growth: {
      icon: TrendingUp,
      color: 'indigo',
      gradient: 'from-indigo-100 to-indigo-50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      price: 2499,
      name: 'Growth',
      duration: 'per month',
      features: ['Featured placement', 'Up to 30 images/videos', 'Top search priority', 'Unlimited blog posts', 'Advanced analytics', 'Social media promotion']
    },
    premium: {
      icon: Crown,
      color: 'amber',
      gradient: 'from-amber-100 to-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      price: 4999,
      name: 'Premium',
      duration: 'per month',
      features: ['Premium badge', 'Unlimited portfolio', 'Maximum visibility', 'Featured on homepage', 'Dedicated account manager', 'Custom branding options', 'Priority in all categories']
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('vendorToken');
      
      if (!token) {
        setError('Please login to view payment details');
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fetch subscription and payment history in parallel
      const [subscriptionRes, historyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/vendors/my-subscription`, { headers }),
        fetch(`${API_BASE_URL}/vendors/payment-history`, { headers })
      ]);

      if (!subscriptionRes.ok || !historyRes.ok) {
        throw new Error('Failed to load payment data');
      }

      const subscriptionData = await subscriptionRes.json();
      const historyData = await historyRes.json();

      console.log('💳 Subscription loaded:', subscriptionData);
      console.log('📜 Payment history loaded:', historyData);

      setSubscription(subscriptionData.subscription);
      setPaymentHistory(historyData.payments || []);

    } catch (err) {
      console.error('❌ Load payment data error:', err);
      setError(err.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const token = localStorage.getItem('vendorToken');
      
      const response = await fetch(`${API_BASE_URL}/vendors/payment-receipt/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      const data = await response.json();
      setSelectedReceipt(data.receipt);
      setShowReceiptModal(true);

    } catch (err) {
      console.error('❌ Download receipt error:', err);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  const retryPayment = async (orderId) => {
    try {
      const token = localStorage.getItem('vendorToken');
      
      const response = await fetch(`${API_BASE_URL}/vendors/retry-payment/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentMethod: 'upi' })
      });

      if (!response.ok) {
        throw new Error('Failed to retry payment');
      }

      const data = await response.json();
      
      // Redirect to payment page with new order ID
      alert('New payment order created! Redirecting to payment...');
      window.location.href = `/vendor-registration?step=7&orderId=${data.orderId}`;

    } catch (err) {
      console.error('❌ Retry payment error:', err);
      alert('Failed to retry payment. Please try again.');
    }
  };

  // Upgrade Plan Functions
  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const handleSelectUpgradePlan = (planId) => {
    setSelectedUpgradePlan(planId);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleUpgradePayment = async () => {
    if (!selectedPaymentMethod) {
      setPaymentError('Please select a payment method');
      return;
    }

    if (!selectedUpgradePlan) {
      setPaymentError('Please select a plan');
      return;
    }

    setPaymentState('initiating');
    setPaymentError('');

    try {
      const token = localStorage.getItem('vendorToken');

      // Step 1: Create upgrade order
      const orderResponse = await fetch(`${API_BASE_URL}/vendors/upgrade-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: selectedUpgradePlan,
          paymentMethod: selectedPaymentMethod
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create upgrade order');
      }

      setPaymentOrderId(orderData.orderId);

      // Step 2: Simulate payment processing
      setPaymentState('processing');
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Step 3: Simulate payment success (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        const mockPaymentId = `pay_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        setPaymentId(mockPaymentId);

        // Verify payment
        setPaymentState('verifying');

        const verifyResponse = await fetch(`${API_BASE_URL}/vendors/verify-payment`, {
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
        throw new Error('Payment declined by bank. Please try again or use a different payment method.');
      }

    } catch (err) {
      console.error('💳 Upgrade payment error:', err);
      setPaymentError(err.message || 'Payment processing failed');
      setPaymentState('failed');
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentState('idle');
    setShowUpgradeModal(false);
    setSelectedUpgradePlan(null);
    setSelectedPaymentMethod('');
    loadPaymentData(); // Reload data to show updated subscription
  };

  const handlePaymentRetry = () => {
    setPaymentState('idle');
    setPaymentError('');
    setSelectedPaymentMethod('');
  };

  const calculateDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Payment Details</h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={loadPaymentData}
              className="mt-3 text-sm text-red-700 hover:text-red-900 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const planConfig = subscription ? PLANS[subscription.planId] || PLANS.free : PLANS.free;
  const PlanIcon = planConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription & Payments</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your plan and billing</p>
        </div>
        <button
          onClick={loadPaymentData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Current Subscription Card */}
      {subscription && (
        <div className={`bg-gradient-to-br ${planConfig.gradient} border-2 ${
          subscription.planId === 'free' ? 'border-gray-200' :
          subscription.planId === 'starter' ? 'border-blue-200' :
          subscription.planId === 'growth' ? 'border-indigo-300' :
          'border-amber-300'
        } rounded-2xl p-6 shadow-lg`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 ${planConfig.iconBg} rounded-xl flex items-center justify-center`}>
                <PlanIcon className={`w-8 h-8 ${planConfig.iconColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{subscription.planName} Plan</h3>
                  {subscription.planId !== 'free' && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                      subscription.status === 'expired' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {subscription.status.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 font-medium">
                  {subscription.amount > 0 ? (
                    <>₹{subscription.amount}/{subscription.billingCycle === 'monthly' ? 'month' : 'year'}</>
                  ) : (
                    '30 Days Free Trial'
                  )}
                </p>
              </div>
            </div>

            {subscription.planId !== 'premium' && (
              <button 
                onClick={handleUpgradeClick}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                <Star className="w-4 h-4" />
                <span className="text-sm font-semibold">Upgrade Plan</span>
              </button>
            )}
          </div>

          {/* Plan Features */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Your Benefits:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subscription.features?.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-300">
            <div>
              <p className="text-xs text-gray-600 mb-1">Started On</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(subscription.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">
                {subscription.planId === 'free' ? 'Trial Ends On' : 'Renews On'}
              </p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(subscription.expiryDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Days Remaining</p>
              <p className={`text-sm font-semibold ${
                calculateDaysRemaining(subscription.expiryDate) === 0 ? 'text-red-700' :
                calculateDaysRemaining(subscription.expiryDate) < 7 ? 'text-orange-700' :
                'text-green-700'
              }`}>
                {calculateDaysRemaining(subscription.expiryDate) === 0 ? 'Expired - Upgrade Now!' : `${calculateDaysRemaining(subscription.expiryDate)} days`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
            </div>
            <span className="text-sm text-gray-600">{paymentHistory.length} transactions</span>
          </div>
        </div>

        {paymentHistory.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No payment history</p>
            <p className="text-sm text-gray-500">Your payment transactions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paymentHistory.map((payment, idx) => (
              <div key={payment.paymentId || idx} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        payment.status === 'success' ? 'bg-green-100' :
                        payment.status === 'failed' ? 'bg-red-100' :
                        payment.status === 'refunded' ? 'bg-orange-100' :
                        'bg-yellow-100'
                      }`}>
                        {payment.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : payment.status === 'failed' ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">{payment.planName} Plan</h4>
                        <p className="text-sm text-gray-600">{formatDate(payment.paidAt)}</p>
                      </div>
                    </div>

                    <div className="ml-13 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="ml-1 font-medium text-gray-900">{formatCurrency(payment.amount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">GST:</span>
                        <span className="ml-1 font-medium text-gray-900">{formatCurrency(payment.gst || 0)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="ml-1 font-semibold text-green-700">{formatCurrency(payment.totalAmount || payment.amount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Method:</span>
                        <span className="ml-1 font-medium text-gray-900 capitalize">{payment.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="ml-13 mt-2">
                      <span className="text-xs text-gray-500 font-mono">Payment ID: {payment.paymentId}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {payment.status === 'success' && (
                      <button
                        onClick={() => downloadReceipt(payment.paymentId)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Receipt
                      </button>
                    )}
                    {payment.status === 'failed' && (
                      <button
                        onClick={() => retryPayment(payment.orderId)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">Payment Receipt</h3>
                  <p className="text-blue-100 text-sm mt-1">{selectedReceipt.company.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-100">Receipt #</p>
                  <p className="text-lg font-bold">{selectedReceipt.receiptNumber}</p>
                </div>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-8">
              {/* Vendor Details */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-600 mb-3">BILLED TO:</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{selectedReceipt.vendor.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedReceipt.vendor.email}</p>
                  <p className="text-sm text-gray-600">{selectedReceipt.vendor.phone}</p>
                  <p className="text-sm text-gray-600 mt-2">{selectedReceipt.vendor.address}</p>
                  <p className="text-sm text-gray-600">{selectedReceipt.vendor.city}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-600 mb-3">PAYMENT DETAILS:</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">{selectedReceipt.payment.planName} Plan Subscription</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(selectedReceipt.payment.amount)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600">GST (18%)</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(selectedReceipt.payment.gst)}</td>
                      </tr>
                      <tr className="bg-green-50">
                        <td className="px-4 py-3 text-base font-bold text-gray-900">Total Amount Paid</td>
                        <td className="px-4 py-3 text-base font-bold text-green-700 text-right">{formatCurrency(selectedReceipt.payment.totalAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Payment Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedReceipt.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{selectedReceipt.payment.method}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Payment ID</p>
                  <p className="text-xs font-mono text-gray-700">{selectedReceipt.payment.paymentId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Order ID</p>
                  <p className="text-xs font-mono text-gray-700">{selectedReceipt.payment.orderId}</p>
                </div>
              </div>

              {/* Company Info */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-600 mb-3">COMPANY DETAILS:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-900">{selectedReceipt.company.name}</p>
                  <p>{selectedReceipt.company.address}</p>
                  <p>GSTIN: {selectedReceipt.company.gstin}</p>
                  <p>{selectedReceipt.company.email} | {selectedReceipt.company.phone}</p>
                </div>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span>This is a computer generated receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Print
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && paymentState === 'idle' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
                <p className="text-sm text-gray-600 mt-1">Choose a plan that fits your business needs</p>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Plan Selection */}
            {!selectedUpgradePlan && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Starter Plan */}
                  <div 
                    onClick={() => handleSelectUpgradePlan('starter')}
                    className="relative border-2 border-blue-200 rounded-2xl p-6 hover:border-blue-400 cursor-pointer transition-all hover:shadow-lg group bg-gradient-to-br from-blue-50 to-white"
                  >
                    <div className="absolute top-4 right-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Starter</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900">₹999</span>
                        <span className="text-gray-600 text-sm">/month</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">+ 18% GST</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {PLANS.starter.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all group-hover:shadow-md">
                      Select Plan
                    </button>
                  </div>

                  {/* Growth Plan */}
                  <div 
                    onClick={() => handleSelectUpgradePlan('growth')}
                    className="relative border-2 border-indigo-300 rounded-2xl p-6 hover:border-indigo-500 cursor-pointer transition-all hover:shadow-lg group bg-gradient-to-br from-indigo-50 to-white"
                  >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full">
                        POPULAR
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Growth</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900">₹2,499</span>
                        <span className="text-gray-600 text-sm">/month</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">+ 18% GST</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {PLANS.growth.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all group-hover:shadow-md">
                      Select Plan
                    </button>
                  </div>

                  {/* Premium Plan */}
                  <div 
                    onClick={() => handleSelectUpgradePlan('premium')}
                    className="relative border-2 border-amber-300 rounded-2xl p-6 hover:border-amber-500 cursor-pointer transition-all hover:shadow-lg group bg-gradient-to-br from-amber-50 to-white"
                  >
                    <div className="absolute top-4 right-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Crown className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Premium</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900">₹4,999</span>
                        <span className="text-gray-600 text-sm">/month</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">+ 18% GST</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {PLANS.premium.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all group-hover:shadow-md">
                      Select Plan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Gateway - After Plan Selection */}
            {selectedUpgradePlan && (
              <div className="p-6">
                {/* Selected Plan Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${PLANS[selectedUpgradePlan].iconBg} rounded-lg flex items-center justify-center`}>
                        {React.createElement(PLANS[selectedUpgradePlan].icon, { 
                          className: `w-5 h-5 ${PLANS[selectedUpgradePlan].iconColor}` 
                        })}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{PLANS[selectedUpgradePlan].name} Plan</h4>
                        <p className="text-sm text-gray-600">
                          ₹{PLANS[selectedUpgradePlan].price} + ₹{Math.round(PLANS[selectedUpgradePlan].price * 0.18)} GST = 
                          <span className="font-bold text-gray-900"> ₹{PLANS[selectedUpgradePlan].price + Math.round(PLANS[selectedUpgradePlan].price * 0.18)}</span>
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedUpgradePlan(null)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Change Plan
                    </button>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* UPI */}
                    <button 
                      onClick={() => handlePaymentMethodSelect('upi')}
                      className={`group border-2 rounded-xl p-4 transition-all hover:shadow-md relative ${
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

                {/* Pay Button */}
                <button 
                  onClick={handleUpgradePayment}
                  disabled={!selectedPaymentMethod}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-600 disabled:hover:to-emerald-600"
                >
                  <Lock className="w-5 h-5" />
                  <span>Pay ₹{PLANS[selectedUpgradePlan].price + Math.round(PLANS[selectedUpgradePlan].price * 0.18)} Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Security Badges */}
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
            )}
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {(paymentState === 'initiating' || paymentState === 'processing' || paymentState === 'verifying') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

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

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Successful!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your plan has been upgraded successfully
              </p>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">New Plan</span>
                  <span className="font-semibold text-gray-900">{PLANS[selectedUpgradePlan]?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-bold text-green-600">
                    ₹{PLANS[selectedUpgradePlan]?.price + Math.round(PLANS[selectedUpgradePlan]?.price * 0.18)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment ID</span>
                  <span className="font-mono text-xs text-gray-700">{paymentId.substring(0, 20)}...</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePaymentSuccess}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all group"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Payment Failed Modal */}
      {paymentState === 'failed' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h3>
              <p className="text-sm text-gray-600 mb-4">
                We couldn't process your payment
              </p>

              {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800">{paymentError}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentRetry}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPaymentDashboard;
