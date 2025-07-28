const express = require('express');
const router = express.Router();
const { getAdminDashboardData } = require('../controllers/adminController');

// Remove or comment out these lines:
// router.get('/freshers', getFreshers);
// router.get('/queues', getSystemQueues);

router.get('/dashboard', getAdminDashboardData);

module.exports = router;