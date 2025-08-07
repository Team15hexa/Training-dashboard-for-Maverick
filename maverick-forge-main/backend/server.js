const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const adminRoutes = require('./routes/admin');

const fresherRoutes = require('./routes/fresher');
const authRoutes = require('./routes/auth');
const onboardingRoutes = require('./routes/onboarding');

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Maverick Forge Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test route working',
    timestamp: new Date().toISOString()
  });
});

// Test auth route directly
app.post('/api/auth/login-test', (req, res) => {
  console.log('🔍 Direct auth route hit');
  res.json({ 
    message: 'Direct auth route working',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Actual routes
console.log('🔧 Registering routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes registered');
app.use('/api/fresher', fresherRoutes);
console.log('✅ Fresher routes registered');
app.use('/api/onboarding', onboardingRoutes);
console.log('✅ Onboarding routes registered');


// Add debugging middleware
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  next();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
