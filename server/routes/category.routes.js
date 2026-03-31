const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);
router.get('/:id/products', categoryController.getCategoryProducts);

module.exports = router;

