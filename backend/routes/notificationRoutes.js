const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// ✅ Get all notifications for a user
router.get('/user/:userId',authMiddleware, notificationController.getUserNotifications);

// ✅ Mark as seen
router.put('/:id/seen',authMiddleware, notificationController.markAsSeen);

// ✅ Admin: Get all notifications
router.get('/admin/all',authMiddleware, notificationController.getAllNotifications);

module.exports = router;
