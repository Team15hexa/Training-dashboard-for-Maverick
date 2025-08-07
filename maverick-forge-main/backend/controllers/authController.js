const db = require('../config/database');

// Hardcoded admin users for demo purposes
const adminUsers = [
  {
    id: 1,
    email: 'admin@mavericks.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    department: 'Management'
  }
];

exports.loginUser = async (req, res) => {
  try {
    console.log('🔐 Login endpoint reached');
    console.log('📝 Request body:', req.body);
    
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { email, password: '***' });
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // First check admin users
    const adminUser = adminUsers.find(user => 
      user.email === email && user.password === password
    );
    
    if (adminUser) {
      console.log('✅ Admin login successful:', adminUser.email);
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          name: adminUser.name,
          department: adminUser.department
        },
        token: `mock-jwt-token-${Date.now()}`
      });
    }

    // Check freshers in database
    try {
      const [freshers] = await db.promise().query(
        'SELECT * FROM freshers WHERE email = ? AND password = ?',
        [email, password]
      );

      if (freshers.length > 0) {
        const fresher = freshers[0];
        console.log('✅ Fresher login successful:', fresher.email);
        
        return res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: fresher.id,
            email: fresher.email,
            role: 'fresher',
            name: fresher.name,
            department: fresher.department
          },
          token: `mock-jwt-token-${Date.now()}`
        });
      }
    } catch (dbError) {
      console.error('❌ Database error during authentication:', dbError.message);
      return res.status(500).json({
        success: false,
        message: 'Database error during authentication'
      });
    }

    // No user found
    console.log('❌ Login failed: Invalid credentials');
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    // In a real application, you would invalidate the JWT token
    console.log('🔓 User logout');
    return res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // In a real application, you would decode the JWT token to get user info
    // For now, we'll return a mock response
    console.log('👤 Get current user request');
    return res.json({
      success: true,
      user: {
        id: 1,
        email: 'admin@mavericks.com',
        role: 'admin',
        name: 'Admin User'
      }
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 