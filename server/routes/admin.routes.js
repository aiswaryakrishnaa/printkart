const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Product Management
router.get('/products', adminController.getProducts);
router.post('/products', upload.array('images', 10), adminController.createProduct);
router.post('/products/upload-images', upload.array('images', 10), adminController.uploadProductImages);
router.get('/products/:id', adminController.getProduct);
router.put('/products/:id', upload.array('images', 10), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Order Management
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrder);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);


// Category Management
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
// Analytics
router.get('/analytics', adminController.getAnalytics);

// Customization Management
router.get('/customizations', adminController.getCustomizations);
router.put('/customizations/:id/status', adminController.updateCustomizationStatus);

// Notification Management
router.get('/notifications', adminController.getAdminNotifications);
router.post('/notifications', adminController.createNotification);
router.delete('/notifications/:id', adminController.deleteNotification);

module.exports = router;

