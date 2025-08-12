const mysql = require('mysql2');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Nimi2005',
  database: process.env.DB_NAME || 'maverick',
  port: process.env.DB_PORT || 3306
};

async function updateFresherScores() {
  let connection;
  
  try {
    connection = mysql.createConnection(dbConfig);
    
    console.log('🔧 Updating fresher scores for realistic department analytics...');
    
    // Update fresher scores to create more realistic variation
    const updates = [
      // Data Science - lower certification rates
      { id: 2, certifications: 45 }, // Jane Smith
      { id: 6, certifications: 35 }, // Alice Johnson
      
      // DevOps - moderate certification rates  
      { id: 3, certifications: 65 }, // Mike Johnson
      
      // Marketing - very low certification rates
      { id: 4, certifications: 15 }, // Sarah Wilson
      
      // Sales - moderate certification rates
      { id: 5, certifications: 55 }, // David Brown
      
      // Software Engineering - high certification rates
      { id: 1, certifications: 85 }, // John Doe
    ];
    
    for (const update of updates) {
      const [result] = await connection.promise().query(
        'UPDATE freshers SET certifications = ?, updated_at = NOW() WHERE id = ?',
        [update.certifications, update.id]
      );
      
      console.log(`✅ Updated fresher ID ${update.id} certifications to ${update.certifications}%`);
    }
    
    // Show the updated department analytics
    console.log('\n📊 Updated Department Analytics:');
    const [freshers] = await connection.promise().query(`
      SELECT 
        department,
        COUNT(*) as count,
        AVG(CAST(quizzes AS DECIMAL(5,2))) as avgQuizScore,
        AVG(CAST(coding AS DECIMAL(5,2))) as avgCodingScore,
        AVG(CAST(assignments AS DECIMAL(5,2))) as avgAssignmentScore,
        AVG(CAST(certifications AS DECIMAL(5,2))) as avgCertificationScore
      FROM freshers 
      GROUP BY department
      ORDER BY department
    `);
    
    freshers.forEach(dept => {
      const avgScore = Math.round(
        (parseFloat(dept.avgQuizScore || 0) + 
         parseFloat(dept.avgCodingScore || 0) + 
         parseFloat(dept.avgAssignmentScore || 0) + 
         parseFloat(dept.avgCertificationScore || 0)) / 4
      );
      
      const completionRate = Math.round(parseFloat(dept.avgCertificationScore || 0));
      
      console.log(`\n${dept.department}:`);
      console.log(`  - Freshers: ${dept.count}`);
      console.log(`  - Avg Score: ${avgScore}%`);
      console.log(`  - Completion Rate: ${completionRate}%`);
      console.log(`  - Certifications: ${Math.round(parseFloat(dept.avgCertificationScore || 0))}%`);
    });
    
    console.log('\n✅ Fresher scores updated successfully!');
    console.log('🔄 The Performance Trends chart should now show realistic completion rates.');
    
  } catch (error) {
    console.error('❌ Error updating fresher scores:', error.message);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

updateFresherScores(); 