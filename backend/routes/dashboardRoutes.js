// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const getDashboardAnalytics = require('../controllers/getDashboardAnalytics');
const { authMiddleware } = require('../middlewares/authMiddleware');

// This supports query params like ?userId=...&role=...
router.get('/dashboard',authMiddleware, getDashboardAnalytics);

module.exports = router;
