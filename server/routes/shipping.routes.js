const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shipping.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/addresses', authenticate, shippingController.getAddresses);
router.post('/addresses', authenticate, shippingController.addAddress);
router.put('/addresses/:id', authenticate, shippingController.updateAddress);
router.delete('/addresses/:id', authenticate, shippingController.deleteAddress);

router.get('/options', shippingController.getShippingOptions);
router.post('/calculate', shippingController.calculateShipping);
router.get('/track/:orderId', authenticate, shippingController.trackShipment);

module.exports = router;

