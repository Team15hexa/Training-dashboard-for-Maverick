const express = require('express');
const router = express.Router();

console.log('🔍 Loading auth routes...');

const authController = require('../controllers/authController');
console.log('✅ Auth controller loaded:', Object.keys(authController));

// Test route
router.get('/test', (req, res) => {
  console.log('🔍 Auth test route hit');
  res.json({ message: 'Auth routes working' });
});

// POST /api/auth/login - User login
router.post('/login', authController.loginUser);

// POST /api/auth/logout - User logout
router.post('/logout', authController.logoutUser);

// GET /api/auth/me - Get current user
router.get('/me', authController.getCurrentUser);

module.exports = router; 