const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Nimi2005',
  database: process.env.DB_NAME || 'maverick',
  port: process.env.DB_PORT || 3306
};

async function checkFreshers() {
  let connection;
  
  try {
    connection = mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking freshers in database...');
    
    const [rows] = await connection.promise().query('SELECT id, name, email, password FROM freshers');
    
    console.log('📊 Found freshers:');
    rows.forEach(fresher => {
      console.log(`ID: ${fresher.id}, Name: ${fresher.name}, Email: ${fresher.email}, Password: ${fresher.password}`);
    });
    
    console.log(`\n✅ Total freshers: ${rows.length}`);
    
  } catch (error) {
    console.error('❌ Error checking freshers:', error.message);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

checkFreshers(); 