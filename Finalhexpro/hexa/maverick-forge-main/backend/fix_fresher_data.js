const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'vijay2005',
  database: process.env.DB_NAME || 'maverick',
  port: process.env.DB_PORT || 3306
};

async function fixFresherData() {
  let connection;
  
  try {
    connection = mysql.createConnection(dbConfig);
    
    console.log('🔧 Fixing fresher data...');
    // Ensure join_date is populated (fallback to created_at date)
    await connection.promise().query(
      `UPDATE freshers SET join_date = DATE(COALESCE(join_date, created_at))`
    );
    
    // Update freshers with proper JSON skills and training data
    const updates = [
      {
        id: 2,
        skills: JSON.stringify(['Python', 'Machine Learning', 'SQL', 'Data Analysis', 'Statistics', 'R', 'TensorFlow', 'Scikit-learn']),
        training_schedule: JSON.stringify({
          courseName: 'Data Science Fundamentals',
          startingDate: '2025-08-05',
          courseHours: 60,
          description: 'Comprehensive data science training program'
        }),
        workflow_progress: JSON.stringify({
          profileUpdated: true,
          quizCompleted: true,
          codingSubmitted: true,
          assignmentSubmitted: true,
          certificationCompleted: false
        })
      },
      {
        id: 3,
        skills: JSON.stringify(['Docker', 'Kubernetes', 'AWS', 'DevOps', 'CI/CD', 'Terraform', 'Jenkins', 'Linux']),
        training_schedule: JSON.stringify({
          courseName: 'DevOps Engineering',
          startingDate: '2025-08-05',
          courseHours: 70,
          description: 'Modern DevOps practices and tools'
        }),
        workflow_progress: JSON.stringify({
          profileUpdated: true,
          quizCompleted: true,
          codingSubmitted: true,
          assignmentSubmitted: false,
          certificationCompleted: false
        })
      },
      {
        id: 4,
        skills: JSON.stringify(['Digital Marketing', 'Analytics', 'SEO', 'SEM', 'Social Media', 'Google Analytics', 'Content Marketing']),
        training_schedule: JSON.stringify({
          courseName: 'Digital Marketing Mastery',
          startingDate: '2025-08-05',
          courseHours: 50,
          description: 'Comprehensive digital marketing training'
        }),
        workflow_progress: JSON.stringify({
          profileUpdated: true,
          quizCompleted: true,
          codingSubmitted: true,
          assignmentSubmitted: true,
          certificationCompleted: true
        })
      },
      {
        id: 5,
        skills: JSON.stringify(['Sales Techniques', 'CRM', 'Negotiation', 'Customer Relationship', 'Sales Analytics', 'Lead Generation']),
        training_schedule: JSON.stringify({
          courseName: 'Sales Excellence',
          startingDate: '2025-08-05',
          courseHours: 45,
          description: 'Professional sales training program'
        }),
        workflow_progress: JSON.stringify({
          profileUpdated: true,
          quizCompleted: true,
          codingSubmitted: false,
          assignmentSubmitted: true,
          certificationCompleted: false
        })
      },
      {
        id: 6,
        skills: JSON.stringify(['Python', 'Data Analysis', 'Visualization', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter']),
        training_schedule: JSON.stringify({
          courseName: 'Data Analysis & Visualization',
          startingDate: '2025-08-05',
          courseHours: 55,
          description: 'Advanced data analysis and visualization techniques'
        }),
        workflow_progress: JSON.stringify({
          profileUpdated: true,
          quizCompleted: true,
          codingSubmitted: true,
          assignmentSubmitted: true,
          certificationCompleted: false
        })
      }
    ];
    
    for (const update of updates) {
      console.log(`🔄 Updating fresher ID: ${update.id}`);
      
      await connection.promise().query(
        'UPDATE freshers SET skills = ?, training_schedule = ?, workflow_progress = ? WHERE id = ?',
        [update.skills, update.training_schedule, update.workflow_progress, update.id]
      );
      
      console.log(`✅ Updated fresher ID: ${update.id}`);
    }
    
    console.log('\n✅ All fresher data has been fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing fresher data:', error.message);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

fixFresherData(); 