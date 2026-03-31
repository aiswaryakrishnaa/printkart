const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { body } = require('express-validator');

// Validation rules
const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  // Email validation - custom validation to handle empty strings
  body('email')
    .optional({ checkFalsy: true }) // Allow email to be optional/empty
    .custom((value) => {
      // If email is provided and not empty, it must be valid
      if (value && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Valid email is required');
        }
      }
      return true;
    }),
  // Phone validation - custom validation to handle empty strings
  body('phone')
    .optional({ checkFalsy: true }) // Allow phone to be optional/empty
    .custom((value) => {
      // If phone is provided and not empty, it must not be empty after trim
      if (value && value.trim() === '') {
        throw new Error('Phone number cannot be empty');
      }
      return true;
    }),
  body('password').notEmpty().withMessage('Password is required'),
  
  // Custom validation to ensure at least email or phone is provided
  body().custom((value) => {
    const hasEmail = value.email && typeof value.email === 'string' && value.email.trim() !== '';
    const hasPhone = value.phone && typeof value.phone === 'string' && value.phone.trim() !== '';
    if (!hasEmail && !hasPhone) {
      throw new Error('Either email or phone is required');
    }
    return true;
  })
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.sendOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;

