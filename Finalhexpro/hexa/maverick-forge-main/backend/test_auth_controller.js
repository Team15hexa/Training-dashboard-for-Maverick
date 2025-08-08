const authController = require('./controllers/authController');

console.log('🔍 Testing authController import...');
console.log('📝 authController methods:', Object.keys(authController));

// Test if loginUser function exists
if (authController.loginUser) {
  console.log('✅ loginUser function exists');
} else {
  console.log('❌ loginUser function not found');
}

// Test if the function is callable
try {
  console.log('🔍 Testing loginUser function...');
  const mockReq = {
    body: {
      email: 'admin@mavericks.com',
      password: 'admin123'
    }
  };
  
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        console.log('📊 Response status:', code);
        console.log('📊 Response data:', data);
      }
    }),
    json: (data) => {
      console.log('📊 Response data:', data);
    }
  };
  
  authController.loginUser(mockReq, mockRes);
  
} catch (error) {
  console.error('❌ Error testing loginUser:', error.message);
} 