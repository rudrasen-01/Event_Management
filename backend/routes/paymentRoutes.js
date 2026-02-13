/**
 * Payment Routes
 * Routes for handling vendor plan payments
 * 
 * Base path: /api/vendors
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

/**
 * @route   POST /api/vendors/create-payment-order
 * @desc    Create a payment order for plan subscription
 * @access  Public (pre-registration)
 * @body    { amount, planId, planName, vendorEmail, vendorName, paymentMethod }
 */
router.post('/create-payment-order', paymentController.createPaymentOrder);

/**
 * @route   POST /api/vendors/verify-payment
 * @desc    Verify payment and activate plan
 * @access  Public (called after payment gateway callback)
 * @body    { orderId, paymentId, signature }
 */
router.post('/verify-payment', paymentController.verifyPayment);

/**
 * @route   GET /api/vendors/payment-status/:orderId
 * @desc    Get payment order status
 * @access  Public
 */
router.get('/payment-status/:orderId', paymentController.getPaymentStatus);

module.exports = router;
