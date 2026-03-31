const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All payment routes require authentication
router.use(authenticate);

// Create payment intent for an existing order
router.post('/create-intent', paymentController.createPaymentIntent);

// Confirm payment for an existing order
router.post('/confirm', paymentController.confirmPayment);

// Place order with payment (combined endpoint - demo)
router.post('/place-order', paymentController.placeOrderWithPayment);

// Get payment status by payment ID
router.get('/:id/status', paymentController.getPaymentStatus);

// Process refund
router.post('/refund', paymentController.processRefund);

module.exports = router;

