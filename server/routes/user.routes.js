const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const upload = require('../middleware/upload.middleware');

// Get user profile
router.get('/profile', authenticate, userController.getProfile);

// Update profile
router.put('/profile', authenticate, [
  body('fullName').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().trim().notEmpty()
], userController.updateProfile);

// Get addresses
router.get('/addresses', authenticate, userController.getAddresses);

// Add address
router.post('/addresses', authenticate, [
  body('fullName').notEmpty().trim().withMessage('Full name is required'),
  body('phone').optional().trim(),
  body('addressLine1').notEmpty().trim().withMessage('Address line 1 is required'),
  body('addressLine2').optional().trim(),
  body('city').notEmpty().trim().withMessage('City is required'),
  body('state').notEmpty().trim().withMessage('State is required'),
  body('zipCode').notEmpty().trim().withMessage('Zip code is required'),
  body('country').notEmpty().trim().withMessage('Country is required'),
  body('type').optional().isIn(['home', 'work', 'other']).withMessage('Type must be home, work, or other'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
], userController.addAddress);

// Update address
router.put('/addresses/:id', authenticate, [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().trim(),
  body('addressLine1').optional().trim().notEmpty().withMessage('Address line 1 cannot be empty'),
  body('addressLine2').optional().trim(),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('zipCode').optional().trim().notEmpty().withMessage('Zip code cannot be empty'),
  body('country').optional().trim().notEmpty().withMessage('Country cannot be empty'),
  body('type').optional().isIn(['home', 'work', 'other']).withMessage('Type must be home, work, or other'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
], userController.updateAddress);

// Delete address
router.delete('/addresses/:id', authenticate, userController.deleteAddress);

// Change password
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], userController.changePassword);

// Upload avatar
router.post('/upload-avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;

