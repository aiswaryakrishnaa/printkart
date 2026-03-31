const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/recommended', productController.getRecommendedProducts);
router.get('/:id', productController.getProduct);
router.get('/:id/availability', productController.getProductAvailability);
router.get('/:id/related', productController.getRelatedProducts);

module.exports = router;

