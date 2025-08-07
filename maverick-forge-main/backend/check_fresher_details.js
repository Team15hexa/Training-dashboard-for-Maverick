const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Nimi2005',
  database: process.env.DB_NAME || 'maverick',
  port: process.env.DB_PORT || 3306
};

async function checkFresherDetails() {
  let connection;
  
  try {
    connection = mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking detailed fresher data...');
    
    // Check each fresher from 1 to 6
    for (let id = 1; id <= 6; id++) {
      console.log(`\n📊 Checking fresher ID: ${id}`);
      
      const [rows] = await connection.promise().query('SELECT * FROM freshers WHERE id = ?', [id]);
      
      if (rows.length > 0) {
        const fresher = rows[0];
        console.log(`✅ Found fresher: ${fresher.name} (${fresher.email})`);
        console.log(`   Skills: ${fresher.skills || 'null'}`);
        console.log(`   Training Schedule: ${fresher.training_schedule || 'null'}`);
        console.log(`   Workflow Progress: ${fresher.workflow_progress || 'null'}`);
        console.log(`   Quizzes: ${fresher.quizzes}`);
        console.log(`   Coding: ${fresher.coding}`);
        console.log(`   Assignments: ${fresher.assignments}`);
        console.log(`   Certifications: ${fresher.certifications}`);
        
        // Try to parse JSON fields
        try {
          if (fresher.skills) {
            const skills = JSON.parse(fresher.skills);
            console.log(`   Parsed Skills: ${JSON.stringify(skills)}`);
          }
        } catch (e) {
          console.log(`   ❌ Error parsing skills: ${e.message}`);
        }
        
        try {
          if (fresher.training_schedule) {
            const training = JSON.parse(fresher.training_schedule);
            console.log(`   Parsed Training: ${JSON.stringify(training)}`);
          }
        } catch (e) {
          console.log(`   ❌ Error parsing training_schedule: ${e.message}`);
        }
        
        try {
          if (fresher.workflow_progress) {
            const workflow = JSON.parse(fresher.workflow_progress);
            console.log(`   Parsed Workflow: ${JSON.stringify(workflow)}`);
          }
        } catch (e) {
          console.log(`   ❌ Error parsing workflow_progress: ${e.message}`);
        }
        
      } else {
        console.log(`❌ No fresher found with ID: ${id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking fresher details:', error.message);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

checkFresherDetails(); 