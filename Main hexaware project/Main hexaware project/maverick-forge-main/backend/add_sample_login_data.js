const mysql = require('mysql2/promise');
require('dotenv').config();

const addSampleLoginData = async () => {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'maverick_forge'
    });

    console.log('✅ Connected to database');

    // Get current date
    const today = new Date();
    
    // Add sample login activity for the last 3 days for fresher ID 1 (John Doe)
    const sampleData = [
      {
        fresher_id: 1,
        login_at: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        fresher_id: 1,
        login_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        fresher_id: 1,
        login_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        fresher_id: 1,
        login_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        fresher_id: 1,
        login_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        fresher_id: 1,
        login_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        fresher_id: 1,
        login_at: today.toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        fresher_id: 1,
        login_at: today.toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        fresher_id: 1,
        login_at: today.toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        fresher_id: 1,
        login_at: today.toISOString().slice(0, 19).replace('T', ' ')
      },
      {
        fresher_id: 1,
        login_at: today.toISOString().slice(0, 19).replace('T', ' ')
      }
    ];

    // Insert sample data
    for (const data of sampleData) {
      await connection.execute(
        'INSERT INTO login_activity (fresher_id, login_at) VALUES (?, ?)',
        [data.fresher_id, data.login_at]
      );
    }

    console.log('✅ Added sample login activity data');
    console.log('Sample data added for fresher ID 1 (John Doe)');
    console.log('Login counts by date:');
    console.log('- 3 days ago: 1 login');
    console.log('- 2 days ago: 2 logins');
    console.log('- 1 day ago: 3 logins');
    console.log('- Today: 5 logins');

  } catch (error) {
    console.error('❌ Error adding sample login data:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
};

// Run the script
addSampleLoginData(); 