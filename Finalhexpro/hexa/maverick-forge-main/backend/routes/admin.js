const express = require('express');
const router = express.Router();
const { getAdminDashboardData, getDepartmentAnalytics } = require('../controllers/adminController');

// Remove or comment out these lines:
// router.get('/freshers', getFreshers);
// router.get('/queues', getSystemQueues);

router.get('/dashboard', getAdminDashboardData);
router.get('/department-analytics', getDepartmentAnalytics);

module.exports = router;