const express = require('express');
const router = express.Router();
const customizationController = require('../controllers/customization.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Price calculation (no auth required for preview; or require auth if you prefer)
router.post('/calculate-price', (req, res, next) => customizationController.calculatePrice(req, res, next));

// All routes below require authentication
router.use(authenticate);

// Create new customization request with file upload
router.post('/', upload.single('file'), customizationController.createCustomization);

// Get all customizations for logged in user
router.get('/', customizationController.getMyCustomizations);

// Get single customization details
router.get('/:id', customizationController.getCustomization);

module.exports = router;
