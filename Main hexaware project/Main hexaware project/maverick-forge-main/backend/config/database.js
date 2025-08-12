const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'vijay2005',
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
    
    // Ensure login_activity table exists
    const createLoginActivityTableSql = `
      CREATE TABLE IF NOT EXISTS login_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fresher_id INT NOT NULL,
        login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fresher_id) REFERENCES freshers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;
    connection.query(createLoginActivityTableSql, (createErr) => {
      if (createErr) {
        console.error('❌ Failed to ensure login_activity table exists:', createErr.message);
      } else {
        console.log('✅ login_activity table is ready');
      }
      connection.release();
    });
  });
});

module.exports = pool;