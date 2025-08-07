const mysql = require('mysql2');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Nimi2005',
  database: process.env.DB_NAME || 'maverick',
  port: process.env.DB_PORT || 3306
};

async function checkCertifications() {
  let connection;
  
  try {
    connection = mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking current certification values...');
    
    // Check individual fresher certifications
    const [freshers] = await connection.promise().query(`
      SELECT id, name, department, certifications 
      FROM freshers 
      ORDER BY department, name
    `);
    
    console.log('\n📊 Individual Fresher Certifications:');
    freshers.forEach(fresher => {
      console.log(`${fresher.name} (${fresher.department}): ${fresher.certifications}%`);
    });
    
    // Check department averages
    const [departments] = await connection.promise().query(`
      SELECT 
        department,
        COUNT(*) as count,
        AVG(CAST(certifications AS DECIMAL(5,2))) as avgCertification
      FROM freshers 
      GROUP BY department
      ORDER BY department
    `);
    
    console.log('\n📈 Department Certification Averages:');
    departments.forEach(dept => {
      console.log(`${dept.department}: ${Math.round(parseFloat(dept.avgCertification || 0))}% (${dept.count} freshers)`);
    });
    
  } catch (error) {
    console.error('❌ Error checking certifications:', error.message);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

checkCertifications(); 