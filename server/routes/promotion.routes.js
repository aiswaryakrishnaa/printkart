const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/available', promotionController.getAvailablePromotions);
router.post('/validate', authenticate, promotionController.validatePromoCode);

module.exports = router;

