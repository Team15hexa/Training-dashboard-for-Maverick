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
        
        // Record login activity
        try {
          await db.promise().query(
            'INSERT INTO login_activity (fresher_id) VALUES (?)',
            [fresher.id]
          );
          console.log('📝 Recorded login activity for fresher:', fresher.id);
        } catch (logErr) {
          console.error('❌ Failed to record login activity:', logErr.message);
        }
        
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

// Endpoint to get login activity aggregated by date for a fresher (last N days, zero-filled)
exports.getFresherLoginActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const days = Math.max(1, Math.min(60, Number(req.query.days) || 14));

    // Fetch raw counts in the period
    const [rows] = await db.promise().query(
      `SELECT DATE(login_at) as login_date, COUNT(*) as count
       FROM login_activity
       WHERE fresher_id = ? AND login_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(login_at)
       ORDER BY login_date ASC`,
      [id, days - 1]
    );

    // Build zero-filled series for the last N days
    const today = new Date();
    const series = [];
    const byDate = new Map(rows.map(r => [
      // normalize to YYYY-MM-DD
      new Date(r.login_date).toISOString().slice(0, 10),
      Number(r.count) || 0
    ]));

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      series.push({ login_date: key, count: byDate.get(key) || 0 });
    }

    res.json({ success: true, data: series });
  } catch (error) {
    console.error('❌ Error fetching login activity:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch login activity' });
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

exports.changePassword = async (req, res) => {
  try {
    console.log('🔐 Change password endpoint reached');
    console.log('📝 Request body:', { ...req.body, oldPassword: '***', newPassword: '***' });
    
    const { email, oldPassword, newPassword, role } = req.body;
    
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, old password, and new password are required'
      });
    }

    // For admin users (in a real app, this would be in a database)
    if (role === 'admin') {
      const adminIndex = adminUsers.findIndex(user => 
        user.email === email && user.password === oldPassword
      );
      
      if (adminIndex !== -1) {
        // Update admin password (in memory only for this demo)
        adminUsers[adminIndex].password = newPassword;
        console.log('✅ Admin password changed successfully');
        
        return res.json({
          success: true,
          message: 'Password changed successfully'
        });
      }
    } else {
      // For freshers in database
      try {
        // First verify the old password
        const [freshers] = await db.promise().query(
          'SELECT * FROM freshers WHERE email = ? AND password = ?',
          [email, oldPassword]
        );

        if (freshers.length > 0) {
          // Update the password in the database
          await db.promise().query(
            'UPDATE freshers SET password = ? WHERE email = ?',
            [newPassword, email]
          );
          
          console.log('✅ Fresher password changed successfully');
          
          return res.json({
            success: true,
            message: 'Password changed successfully'
          });
        }
      } catch (dbError) {
        console.error('❌ Database error during password change:', dbError.message);
        return res.status(500).json({
          success: false,
          message: 'Database error during password change'
        });
      }
    }

    // No user found or password incorrect
    console.log('❌ Password change failed: Invalid credentials');
    return res.status(401).json({
      success: false,
      message: 'Invalid email or old password'
    });

  } catch (error) {
    console.error('❌ Password change error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during password change'
    });
  }
};