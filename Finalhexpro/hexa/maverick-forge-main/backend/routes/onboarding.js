const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get personalized onboarding plan for a fresher
router.get('/plan/:fresherId', async (req, res) => {
  try {
    // Placeholder for onboarding plan logic
    res.json({
      success: true,
      message: 'Onboarding plan retrieved successfully',
      data: {
        fresherId: req.params.fresherId,
        plan: 'Personalized onboarding plan will be implemented here'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving onboarding plan',
      error: error.message
    });
  }
});

// Get all freshers for onboarding management
router.get('/freshers', async (req, res) => {
  try {
    // Placeholder for freshers list logic
    res.json({
      success: true,
      message: 'Freshers list retrieved successfully',
      data: {
        freshers: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving freshers list',
      error: error.message
    });
  }
});

// Update onboarding progress for a fresher
router.put('/progress/:fresherId', async (req, res) => {
  try {
    // Placeholder for progress update logic
    res.json({
      success: true,
      message: 'Onboarding progress updated successfully',
      data: {
        fresherId: req.params.fresherId,
        progress: req.body.progress || {}
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating onboarding progress',
      error: error.message
    });
  }
});

// Get onboarding analytics
router.get('/analytics', async (req, res) => {
  try {
    // Placeholder for analytics logic
    res.json({
      success: true,
      message: 'Onboarding analytics retrieved successfully',
      data: {
        analytics: {}
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving onboarding analytics',
      error: error.message
    });
  }
});

// Parse resume for a fresher - now redirects to Python Flask backend
router.post('/resume/:fresherId', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is required'
      });
    }

    // Forward the request to the Python Flask backend
    const response = await axios.post('http://localhost:5001/parse-resume', {
      text: text
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      message: 'Resume parsed successfully via Python backend',
      fresherId: req.params.fresherId,
      data: response.data.data
    });
  } catch (error) {
    console.error('Error parsing resume:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error parsing resume. Please ensure Python Flask backend is running on port 5001',
      error: error.message
    });
  }
});

// Get resume analysis for a fresher
router.get('/resume/:fresherId', async (req, res) => {
  try {
    // Placeholder for resume analysis retrieval
    res.json({
      success: true,
      message: 'Resume analysis retrieved successfully',
      data: {
        fresherId: req.params.fresherId,
        analysis: 'Resume analysis will be implemented here'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving resume analysis',
      error: error.message
    });
  }
});

module.exports = router; 