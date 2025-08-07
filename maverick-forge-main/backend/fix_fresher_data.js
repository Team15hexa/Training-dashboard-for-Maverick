const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Manojkanna2005@',
  database: process.env.DB_NAME || 'maverick',
  port: process.env.DB_PORT || 3306
});

async function fixFresherData() {
  try {
    console.log('🔧 Fixing fresher data...');
    
    // Fix skills data
    const skillsUpdates = [
      { id: 1, skills: JSON.stringify(['JavaScript', 'React', 'Node.js']) },
      { id: 2, skills: JSON.stringify(['Python', 'Machine Learning', 'SQL']) },
      { id: 3, skills: JSON.stringify(['Docker', 'Kubernetes', 'AWS']) },
      { id: 4, skills: JSON.stringify(['Digital Marketing', 'Analytics']) },
      { id: 5, skills: JSON.stringify(['Sales Techniques', 'CRM']) },
      { id: 6, skills: JSON.stringify(['Python', 'Data Analysis', 'Visualization']) }
    ];

    for (const update of skillsUpdates) {
      await pool.promise().query(
        'UPDATE freshers SET skills = ? WHERE id = ?',
        [update.skills, update.id]
      );
      console.log(`✅ Updated skills for fresher ${update.id}`);
    }

    // Fix training schedule data
    const trainingUpdates = [
      { 
        id: 1, 
        training: JSON.stringify({
          courseName: 'Full Stack Development',
          startingDate: '2024-01-15',
          courseHours: 120,
          description: 'Comprehensive training in modern web development'
        })
      },
      { 
        id: 2, 
        training: JSON.stringify({
          courseName: 'Data Science Fundamentals',
          startingDate: '2024-01-20',
          courseHours: 100,
          description: 'Introduction to data science and machine learning'
        })
      },
      { 
        id: 3, 
        training: JSON.stringify({
          courseName: 'DevOps Engineering',
          startingDate: '2024-01-25',
          courseHours: 80,
          description: 'Cloud infrastructure and deployment automation'
        })
      },
      { 
        id: 4, 
        training: JSON.stringify({
          courseName: 'Digital Marketing',
          startingDate: '2024-02-01',
          courseHours: 60,
          description: 'Marketing strategies and analytics'
        })
      },
      { 
        id: 5, 
        training: JSON.stringify({
          courseName: 'Sales Training',
          startingDate: '2024-02-05',
          courseHours: 40,
          description: 'Sales techniques and customer relationship management'
        })
      },
      { 
        id: 6, 
        training: JSON.stringify({
          courseName: 'Advanced Data Science',
          startingDate: '2024-02-10',
          courseHours: 120,
          description: 'Advanced machine learning and data analysis'
        })
      }
    ];

    for (const update of trainingUpdates) {
      await pool.promise().query(
        'UPDATE freshers SET training_schedule = ? WHERE id = ?',
        [update.training, update.id]
      );
      console.log(`✅ Updated training schedule for fresher ${update.id}`);
    }

    // Fix workflow progress data
    const workflowUpdates = [
      { 
        id: 1, 
        workflow: JSON.stringify({
          profileUpdated: true,
          quizCompleted: true,
          codingCompleted: true,
          assignmentSubmitted: true,
          certificationInProgress: true
        })
      },
      { 
        id: 2, 
        workflow: JSON.stringify({
          profileUpdated: true,
          quizCompleted: true,
          codingCompleted: true,
          assignmentSubmitted: true,
          certificationCompleted: true
        })
      },
      { 
        id: 3, 
        workflow: JSON.stringify({
          profileUpdated: true,
          quizCompleted: true,
          codingCompleted: false,
          assignmentSubmitted: false,
          certificationInProgress: false
        })
      },
      { 
        id: 4, 
        workflow: JSON.stringify({
          profileUpdated: true,
          quizCompleted: true,
          codingCompleted: false,
          assignmentSubmitted: true,
          certificationInProgress: false
        })
      },
      { 
        id: 5, 
        workflow: JSON.stringify({
          profileUpdated: true,
          quizCompleted: true,
          codingCompleted: false,
          assignmentSubmitted: true,
          certificationInProgress: true
        })
      },
      { 
        id: 6, 
        workflow: JSON.stringify({
          profileUpdated: true,
          quizCompleted: true,
          codingCompleted: true,
          assignmentSubmitted: true,
          certificationInProgress: true
        })
      }
    ];

    for (const update of workflowUpdates) {
      await pool.promise().query(
        'UPDATE freshers SET workflow_progress = ? WHERE id = ?',
        [update.workflow, update.id]
      );
      console.log(`✅ Updated workflow progress for fresher ${update.id}`);
    }

    console.log('🎉 Fresher data fixed successfully!');
    
    // Verify the updates
    const [rows] = await pool.promise().query('SELECT id, name, skills, training_schedule, workflow_progress FROM freshers LIMIT 3');
    console.log('📊 Sample updated data:');
    rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.name}`);
      console.log(`  Skills: ${row.skills}`);
      console.log(`  Training: ${row.training_schedule}`);
      console.log(`  Workflow: ${row.workflow_progress}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error fixing fresher data:', error);
  } finally {
    pool.end();
  }
}

fixFresherData(); 