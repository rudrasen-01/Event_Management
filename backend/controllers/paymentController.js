/**
 * Payment Controller
 * Handles payment order creation and verification for vendor subscription plans
 * 
 * This is a professional mock implementation. In production:
 * - Replace with actual Razorpay/Stripe SDK integration
 * - Add proper webhook handling for payment notifications
 * - Implement proper signature verification
 */

const crypto = require('crypto');
const Vendor = require('../models/VendorNew');

// In-memory payment order storage (use database in production)
const paymentOrders = new Map();
const verifiedPayments = new Map();

// Plan configurations
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    duration: 'Forever',
    billingCycle: 'lifetime',
    features: ['Basic listing', 'Up to 5 portfolio images', 'Standard search visibility', 'Customer inquiries enabled']
  },
  starter: {
    name: 'Starter',
    price: 999,
    duration: 'per month',
    billingCycle: 'monthly',
    features: ['Verified badge', 'Up to 15 images/videos', 'Higher search ranking', 'Blog posts enabled', 'Priority customer support']
  },
  growth: {
    name: 'Growth',
    price: 2499,
    duration: 'per month',
    billingCycle: 'monthly',
    features: ['Featured placement', 'Up to 30 images/videos', 'Top search priority', 'Unlimited blog posts', 'Advanced analytics', 'Social media promotion']
  },
  premium: {
    name: 'Premium',
    price: 4999,
    duration: 'per month',
    billingCycle: 'monthly',
    features: ['Premium badge', 'Unlimited portfolio', 'Maximum visibility', 'Featured on homepage', 'Dedicated account manager', 'Custom branding options', 'Priority in all categories']
  }
};

/**
 * Create Payment Order
 * POST /api/vendors/create-payment-order
 * 
 * Creates a payment order for vendor plan subscription
 * In production: Call Razorpay/Stripe createOrder API
 */
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, planId, planName, vendorEmail, vendorName, paymentMethod } = req.body;

    // Validation
    if (!amount || !planId || !vendorEmail || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, planId, vendorEmail, paymentMethod'
      });
    }

    // Amount validation (must be positive and reasonable)
    if (amount <= 0 || amount > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Must be between ₹1 and ₹100,000'
      });
    }

    // Generate unique order ID (Razorpay format: order_<random>)
    const orderId = `order_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const currency = 'INR';
    const receipt = `rcpt_${Date.now()}`;

    // Create payment order object
    const orderData = {
      orderId,
      amount, // Amount in rupees (Razorpay uses paise, multiply by 100 for production)
      currency,
      receipt,
      planId,
      planName,
      vendorEmail,
      vendorName,
      paymentMethod,
      status: 'created',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes expiry
    };

    // Store order (in production: save to database)
    paymentOrders.set(orderId, orderData);

    console.log('💳 Payment order created:', {
      orderId,
      amount,
      planId,
      vendorEmail,
      paymentMethod
    });

    // Return order details to frontend
    res.status(200).json({
      success: true,
      orderId,
      amount,
      currency,
      receipt,
      planId,
      planName,
      message: 'Payment order created successfully'
    });

  } catch (error) {
    console.error('❌ Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * Verify Payment
 * POST /api/vendors/verify-payment
 * 
 * Verifies payment signature and marks order as paid
 * In production: Verify Razorpay/Stripe signature using webhook secret
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    // Validation
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, paymentId, signature'
      });
    }

    // Check if order exists
    const order = paymentOrders.get(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found. Order may have expired.'
      });
    }

    // Check if order has expired
    if (new Date() > new Date(order.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'Payment order has expired. Please create a new order.'
      });
    }

    // Check if payment already verified (prevent duplicate verification)
    if (verifiedPayments.has(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Payment already verified'
      });
    }

    // In production: Verify signature using Razorpay/Stripe webhook secret
    // const expectedSignature = crypto
    //   .createHmac('sha256', RAZORPAY_KEY_SECRET)
    //   .update(orderId + '|' + paymentId)
    //   .digest('hex');
    // 
    // if (signature !== expectedSignature) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid payment signature'
    //   });
    // }

    // Mock signature verification (for demo purposes)
    const isValidSignature = signature.startsWith('mock_signature_');

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Mark payment as verified
    const paymentRecord = {
      paymentId,
      orderId,
      amount: order.amount,
      currency: order.currency,
      planId: order.planId,
      planName: order.planName,
      vendorEmail: order.vendorEmail,
      vendorName: order.vendorName,
      paymentMethod: order.paymentMethod,
      status: 'success',
      verifiedAt: new Date()
    };

    verifiedPayments.set(paymentId, paymentRecord);

    // Update order status
    order.status = 'paid';
    order.paymentId = paymentId;
    order.paidAt = new Date();
    paymentOrders.set(orderId, order);

    console.log('✅ Payment verified successfully:', {
      paymentId,
      orderId,
      amount: order.amount,
      planId: order.planId,
      vendorEmail: order.vendorEmail
    });

    // Update vendor's subscription and payment history in database
    try {
      const gst = Math.round(order.amount * 0.18);
      const totalAmount = order.amount + gst;
      const receiptNumber = `RCP${Date.now()}`;
      const planConfig = PLANS[order.planId] || PLANS.free;
      
      // Calculate expiry date based on billing cycle
      let expiryDate;
      if (planConfig.billingCycle === 'monthly') {
        expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      } else if (planConfig.billingCycle === 'yearly') {
        expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      } else {
        expiryDate = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // lifetime (100 years)
      }

      const vendor = await Vendor.findOneAndUpdate(
        { 'contact.email': order.vendorEmail },
        {
          $set: {
            'subscription.planId': order.planId,
            'subscription.planName': order.planName,
            'subscription.amount': order.amount,
            'subscription.paymentId': paymentId,
            'subscription.orderId': orderId,
            'subscription.status': 'active',
            'subscription.startDate': new Date(),
            'subscription.expiryDate': expiryDate,
            'subscription.features': planConfig.features,
            'subscription.billingCycle': planConfig.billingCycle
          },
          $push: {
            paymentHistory: {
              paymentId,
              orderId,
              amount: order.amount,
              gst,
              totalAmount,
              planId: order.planId,
              planName: order.planName,
              status: 'success',
              paymentMethod: order.paymentMethod,
              paidAt: new Date(),
              razorpaySignature: signature,
              receiptNumber
            }
          }
        },
        { new: true }
      );

      if (!vendor) {
        console.warn('⚠️ Vendor not found for email:', order.vendorEmail);
      } else {
        console.log('✅ Updated vendor subscription:', vendor.subscription);
      }

    } catch (dbError) {
      console.error('❌ Database update error:', dbError);
      // Continue even if DB update fails - payment is still verified
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      paymentId,
      orderId,
      amount: order.amount,
      planId: order.planId,
      planName: order.planName,
      status: 'success'
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

/**
 * Get Payment Status
 * GET /api/vendors/payment-status/:orderId
 * 
 * Check status of a payment order
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = paymentOrders.get(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found'
      });
    }

    res.status(200).json({
      success: true,
      order: {
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        planId: order.planId,
        planName: order.planName,
        status: order.status,
        createdAt: order.createdAt,
        paidAt: order.paidAt || null
      }
    });

  } catch (error) {
    console.error('❌ Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error.message
    });
  }
};

/**
 * Cleanup Utility - Remove expired orders (run as cron job in production)
 */
const cleanupExpiredOrders = () => {
  const now = new Date();
  let cleanedCount = 0;

  for (const [orderId, order] of paymentOrders.entries()) {
    if (now > new Date(order.expiresAt) && order.status === 'created') {
      paymentOrders.delete(orderId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired payment orders`);
  }
};

// Run cleanup every 30 minutes
setInterval(cleanupExpiredOrders, 30 * 60 * 1000);

/**
 * Get Vendor's Current Subscription
 * GET /api/vendors/my-subscription
 * 
 * Returns current subscription details for logged-in vendor
 */
exports.getMySubscription = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.user?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const vendor = await Vendor.findById(vendorId).select('subscription contact.email businessName');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Calculate days remaining
    const now = new Date();
    const expiryDate = new Date(vendor.subscription.expiryDate);
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    // Get plan details
    const planConfig = PLANS[vendor.subscription.planId] || PLANS.free;

    res.status(200).json({
      success: true,
      subscription: {
        ...vendor.subscription.toObject(),
        daysRemaining,
        isExpired: daysRemaining < 0,
        planDetails: planConfig
      },
      vendorEmail: vendor.contact.email,
      businessName: vendor.businessName
    });

  } catch (error) {
    console.error('❌ Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription details',
      error: error.message
    });
  }
};

/**
 * Get Vendor's Payment History
 * GET /api/vendors/payment-history
 * 
 * Returns all payment transactions for logged-in vendor
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.user?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const vendor = await Vendor.findById(vendorId).select('paymentHistory contact.email businessName');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Sort by most recent first
    const payments = vendor.paymentHistory.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

    res.status(200).json({
      success: true,
      total: payments.length,
      payments,
      vendorEmail: vendor.contact.email,
      businessName: vendor.businessName
    });

  } catch (error) {
    console.error('❌ Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

/**
 * Generate Payment Receipt
 * GET /api/vendors/payment-receipt/:paymentId
 * 
 * Generates a downloadable receipt for a specific payment
 */
exports.getPaymentReceipt = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.user?._id;
    const { paymentId } = req.params;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Find payment in history
    const payment = vendor.paymentHistory.find(p => p.paymentId === paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Generate receipt data
    const receipt = {
      receiptNumber: payment.receiptNumber || `RCP${Date.now()}`,
      date: payment.paidAt,
      vendor: {
        name: vendor.businessName || vendor.name,
        email: vendor.contact.email,
        phone: vendor.contact.phone,
        address: vendor.address,
        city: vendor.city,
        vendorId: vendor.vendorId
      },
      payment: {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        gst: payment.gst,
        totalAmount: payment.totalAmount,
        planName: payment.planName,
        status: payment.status,
        method: payment.paymentMethod,
        paidAt: payment.paidAt
      },
      company: {
        name: 'EventVendor Platform',
        address: '123 Business Street, City, State 000000',
        gstin: 'GSTIN1234567890',
        email: 'support@eventvendor.com',
        phone: '+91 1234567890'
      }
    };

    res.status(200).json({
      success: true,
      receipt
    });

  } catch (error) {
    console.error('❌ Get payment receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
      error: error.message
    });
  }
};

/**
 * Retry Failed Payment
 * POST /api/vendors/retry-payment/:orderId
 * 
 * Creates a new payment order for a failed transaction
 */
exports.retryPayment = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.user?._id;
    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Find failed payment
    const failedPayment = vendor.paymentHistory.find(p => p.orderId === orderId && p.status === 'failed');

    if (!failedPayment) {
      return res.status(404).json({
        success: false,
        message: 'Failed payment not found'
      });
    }

    // Create new order with same details
    const newOrderId = `order_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const orderData = {
      orderId: newOrderId,
      amount: failedPayment.amount,
      currency: 'INR',
      planId: failedPayment.planId,
      planName: failedPayment.planName,
      vendorEmail: vendor.contact.email,
      vendorName: vendor.businessName || vendor.name,
      paymentMethod: paymentMethod || failedPayment.paymentMethod,
      status: 'created',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    };

    paymentOrders.set(newOrderId, orderData);

    res.status(200).json({
      success: true,
      orderId: newOrderId,
      amount: orderData.amount,
      currency: orderData.currency,
      planId: orderData.planId,
      planName: orderData.planName,
      message: 'New payment order created for retry'
    });

  } catch (error) {
    console.error('❌ Retry payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry payment',
      error: error.message
    });
  }
};

/**
 * Create Upgrade Plan Order
 * POST /api/vendors/upgrade-plan
 * 
 * Creates payment order for plan upgrade
 */
exports.createUpgradeOrder = async (req, res) => {
  try {
    const vendorId = req.vendor?._id || req.user?._id;
    const { planId, paymentMethod } = req.body;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!planId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and payment method are required'
      });
    }

    // Validate plan
    const plan = PLANS[planId];
    if (!plan || planId === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Calculate amount with GST
    const amount = plan.price;
    const gst = Math.round(amount * 0.18);
    const totalAmount = amount + gst;

    // Create order
    const orderId = `order_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const orderData = {
      orderId,
      amount: totalAmount,
      currency: 'INR',
      planId,
      planName: plan.name,
      vendorEmail: vendor.contact.email,
      vendorName: vendor.businessName || vendor.name,
      paymentMethod,
      status: 'created',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    };

    paymentOrders.set(orderId, orderData);

    console.log('✅ Upgrade order created:', orderId);

    res.status(200).json({
      success: true,
      orderId,
      amount: totalAmount,
      currency: 'INR',
      planId,
      planName: plan.name,
      baseAmount: amount,
      gst,
      totalAmount,
      message: 'Upgrade order created successfully'
    });

  } catch (error) {
    console.error('❌ Create upgrade order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create upgrade order',
      error: error.message
    });
  }
};

module.exports = exports;
