const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Manojkanna2005@',
  database: process.env.DB_NAME || 'maverick',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  
  console.log('✅ Connected to MySQL database');
  
  // Verify we're connected to the correct database
  connection.query('SELECT DATABASE() as current_database', (err, results) => {
    if (err) {
      console.error('❌ Error checking database:', err.message);
    } else {
      console.log(`📊 Connected to database: ${results[0].current_database}`);
    }
    connection.release();
  });
});

module.exports = pool; 