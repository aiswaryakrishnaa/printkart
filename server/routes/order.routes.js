const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All order routes require authentication
router.use(authenticate);

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.post('/create', orderController.createOrder);
router.put('/:id/cancel', orderController.cancelOrder);
router.post('/:id/return', orderController.requestReturn);
router.get('/:id/tracking', orderController.getOrderTracking);

module.exports = router;

