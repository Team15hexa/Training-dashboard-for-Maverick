const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Minimal server working' });
});

// Test POST route
app.post('/api/auth/login', (req, res) => {
  console.log('🔍 Login route hit');
  console.log('📝 Request body:', req.body);
  res.json({ 
    success: true, 
    message: 'Login successful',
    user: {
      id: 1,
      email: 'admin@mavericks.com',
      role: 'admin',
      name: 'Admin User'
    }
  });
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  next();
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
}); 