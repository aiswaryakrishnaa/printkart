const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// User routes
router.get('/room', chatController.getOrCreateRoom);
router.get('/messages/:roomId', chatController.getMessages);
router.post('/send', chatController.sendMessage);

// Admin-only routes
router.get('/admin/rooms', authorize('admin'), chatController.getAllRooms);

module.exports = router;
