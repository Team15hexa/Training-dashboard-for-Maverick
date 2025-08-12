const mysql = require('mysql2');
require('dotenv').config();

// Database configuration for the new 'maverick' database
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'vijay2005',
  port: process.env.DB_PORT || 3306
};

async function setupMaverickDatabase() {
  let connection;
  
  try {
    // Create connection without specifying database
    connection = mysql.createConnection(dbConfig);
    
    console.log('🔧 Setting up maverick database...');
    
    // Create the maverick database if it doesn't exist
    await connection.promise().query('CREATE DATABASE IF NOT EXISTS maverick');
    console.log('✅ Created maverick database');
    
    // Use the maverick database
    await connection.promise().query('USE maverick');
    console.log('✅ Switched to maverick database');
    
    // Drop existing tables if they exist (in correct order to avoid foreign key issues)
    const tablesToDrop = [
      'profile_updates',
      'agent_status',
      'assessment',
      'assignment',
      'certification',
      'coding_challenges',
      'daily_quizzes',
      'freshers',
      'admins'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await connection.promise().query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`🗑️  Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not drop ${table}:`, error.message);
      }
    }
    
    // Create admins table
    const createAdminsTable = `
      CREATE TABLE admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(100) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await connection.promise().query(createAdminsTable);
    console.log('✅ Created admins table');
    
    // Create freshers table with comprehensive fields
    const createFreshersTable = `
      CREATE TABLE freshers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        role VARCHAR(100) DEFAULT 'fresher',
        gpa DECIMAL(3,2),
        college VARCHAR(255),
        joining_date DATE DEFAULT (CURRENT_DATE),
        skills TEXT,
        training_schedule TEXT,
        workflow_progress TEXT,
        experience VARCHAR(100),
        quizzes VARCHAR(50) DEFAULT '0',
        coding VARCHAR(50) DEFAULT '0',
        assignments VARCHAR(50) DEFAULT '0',
        certifications VARCHAR(50) DEFAULT '0',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await connection.promise().query(createFreshersTable);
    console.log('✅ Created freshers table');
    
    // Create assignment table (correct spelling)
    const createAssignmentTable = `
      CREATE TABLE assignment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        fresher_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (fresher_id) REFERENCES freshers(id) ON DELETE SET NULL
      )
    `;
    
    await connection.promise().query(createAssignmentTable);
    console.log('✅ Created assignment table');
    
    // Create certification table
    const createCertificationTable = `
      CREATE TABLE certification (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        provider VARCHAR(255),
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        fresher_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (fresher_id) REFERENCES freshers(id) ON DELETE SET NULL
      )
    `;
    
    await connection.promise().query(createCertificationTable);
    console.log('✅ Created certification table');
    
    // Create coding_challenges table
    const createCodingChallengesTable = `
      CREATE TABLE coding_challenges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty VARCHAR(50),
        language VARCHAR(50),
        fresher_id INT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (fresher_id) REFERENCES freshers(id) ON DELETE SET NULL
      )
    `;
    
    await connection.promise().query(createCodingChallengesTable);
    console.log('✅ Created coding_challenges table');
    
    // Create daily_quizzes table
    const createDailyQuizzesTable = `
      CREATE TABLE daily_quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        questions TEXT,
        fresher_id INT,
        score INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (fresher_id) REFERENCES freshers(id) ON DELETE SET NULL
      )
    `;
    
    await connection.promise().query(createDailyQuizzesTable);
    console.log('✅ Created daily_quizzes table');
    
    // Create assessment table
    const createAssessmentTable = `
      CREATE TABLE assessment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(100),
        fresher_id INT,
        score INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (fresher_id) REFERENCES freshers(id) ON DELETE SET NULL
      )
    `;
    
    await connection.promise().query(createAssessmentTable);
    console.log('✅ Created assessment table');
    
    // Create agent_status table
    const createAgentStatusTable = `
      CREATE TABLE agent_status (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agent_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'idle',
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        performance_metrics TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await connection.promise().query(createAgentStatusTable);
    console.log('✅ Created agent_status table');
    
    // Create profile_updates table
    const createProfileUpdatesTable = `
      CREATE TABLE profile_updates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fresher_id INT,
        update_type VARCHAR(100),
        old_value TEXT,
        new_value TEXT,
        updated_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fresher_id) REFERENCES freshers(id) ON DELETE CASCADE
      )
    `;
    
    await connection.promise().query(createProfileUpdatesTable);
    console.log('✅ Created profile_updates table');
    
    // Insert sample admin data
    const insertAdmin = `
      INSERT INTO admins (name, email, password, role) VALUES
      ('Admin User', 'admin@mavericks.com', 'admin123', 'admin')
    `;
    
    await connection.promise().query(insertAdmin);
    console.log('✅ Inserted sample admin data');
    
    // Insert sample freshers data
    const insertFreshers = `
      INSERT INTO freshers (name, email, password, department, role, gpa, college, skills, experience, quizzes, coding, assignments, certifications) VALUES
      ('John Doe', 'john.doe@company.com', 'john123', 'Software Engineering', 'fresher', 3.8, 'MIT', 'JavaScript, React, Node.js', '0 years', '85', '92', '88', '90'),
      ('Jane Smith', 'jane.smith@company.com', 'jane123', 'Data Science', 'fresher', 3.9, 'Stanford', 'Python, Machine Learning, SQL', '1 year', '92', '88', '95', '87'),
      ('Mike Johnson', 'mike.johnson@company.com', 'mike123', 'DevOps', 'fresher', 3.7, 'UC Berkeley', 'Docker, Kubernetes, AWS', '0 years', '78', '85', '82', '80'),
      ('Sarah Wilson', 'sarah.wilson@company.com', 'sarah123', 'Marketing', 'fresher', 3.6, 'UCLA', 'Digital Marketing, Analytics', '2 years', '88', '75', '90', '85'),
      ('David Brown', 'david.brown@company.com', 'david123', 'Sales', 'fresher', 3.5, 'USC', 'Sales Techniques, CRM', '1 year', '82', '70', '85', '88'),
      ('Alice Johnson', 'alice.johnson@company.com', 'ali123', 'Data Science', 'fresher', 3.8, 'Harvard', 'Python, Data Analysis, Visualization', '0 years', '90', '85', '92', '88')
    `;
    
    await connection.promise().query(insertFreshers);
    console.log('✅ Inserted sample freshers data');
    
    // Insert sample assignment data
    const insertAssignments = `
      INSERT INTO assignment (title, description, due_date, status, fresher_id) VALUES
      ('Project Setup', 'Set up your development environment', '2024-02-01', 'completed', 1),
      ('Code Review', 'Review and improve existing code', '2024-02-15', 'pending', 2),
      ('Documentation', 'Write project documentation', '2024-02-28', 'pending', 3),
      ('API Integration', 'Integrate third-party APIs', '2024-03-01', 'pending', 4),
      ('Testing Implementation', 'Implement unit and integration tests', '2024-03-15', 'pending', 5)
    `;
    
    await connection.promise().query(insertAssignments);
    console.log('✅ Inserted sample assignment data');
    
    // Insert sample certification data
    const insertCertifications = `
      INSERT INTO certification (name, provider, description, status, fresher_id) VALUES
      ('AWS Certified Developer', 'Amazon Web Services', 'Cloud development certification', 'completed', 1),
      ('Microsoft Azure Fundamentals', 'Microsoft', 'Azure cloud fundamentals', 'completed', 2),
      ('Google Cloud Associate', 'Google', 'Google Cloud Platform certification', 'pending', 3),
      ('Cisco CCNA', 'Cisco', 'Networking fundamentals', 'pending', 4),
      ('Salesforce Administrator', 'Salesforce', 'CRM administration', 'pending', 5)
    `;
    
    await connection.promise().query(insertCertifications);
    console.log('✅ Inserted sample certification data');
    
    // Insert sample coding challenges data
    const insertCodingChallenges = `
      INSERT INTO coding_challenges (title, description, difficulty, language, status, fresher_id) VALUES
      ('Hello World', 'Write a simple Hello World program', 'Easy', 'JavaScript', 'completed', 1),
      ('Array Manipulation', 'Practice array methods', 'Medium', 'JavaScript', 'completed', 2),
      ('Data Structures', 'Implement basic data structures', 'Hard', 'Python', 'pending', 3),
      ('Algorithm Optimization', 'Optimize sorting algorithms', 'Hard', 'Java', 'pending', 4),
      ('Web Scraping', 'Build a web scraper', 'Medium', 'Python', 'pending', 5)
    `;
    
    await connection.promise().query(insertCodingChallenges);
    console.log('✅ Inserted sample coding challenges data');
    
    // Insert sample daily quizzes data
    const insertDailyQuizzes = `
      INSERT INTO daily_quizzes (title, description, questions, score, status, fresher_id) VALUES
      ('JavaScript Basics', 'Test your knowledge of JavaScript fundamentals', '{"questions": [{"question": "What is JavaScript?", "options": ["A programming language", "A markup language", "A styling language"], "answer": 0}]}', 85, 'completed', 1),
      ('React Fundamentals', 'Test your React knowledge', '{"questions": [{"question": "What is JSX?", "options": ["A database", "A syntax extension", "A framework"], "answer": 1}]}', 92, 'completed', 2),
      ('Python Basics', 'Test your Python knowledge', '{"questions": [{"question": "What is Python?", "options": ["A snake", "A programming language", "A database"], "answer": 1}]}', 78, 'completed', 3),
      ('Database Fundamentals', 'Test your SQL knowledge', '{"questions": [{"question": "What is SQL?", "options": ["A programming language", "A query language", "A markup language"], "answer": 1}]}', 88, 'pending', 4),
      ('Machine Learning Basics', 'Test your ML knowledge', '{"questions": [{"question": "What is supervised learning?", "options": ["Learning without labels", "Learning with labels", "Learning without data"], "answer": 1}]}', 90, 'pending', 5)
    `;
    
    await connection.promise().query(insertDailyQuizzes);
    console.log('✅ Inserted sample daily quizzes data');
    
    // Insert sample assessment data
    const insertAssessments = `
      INSERT INTO assessment (title, description, type, score, status, fresher_id) VALUES
      ('Technical Skills Assessment', 'Comprehensive technical skills evaluation', 'technical', 85, 'completed', 1),
      ('Problem Solving Test', 'Algorithm and problem solving assessment', 'problem_solving', 92, 'completed', 2),
      ('Communication Skills', 'Verbal and written communication assessment', 'communication', 78, 'completed', 3),
      ('Team Collaboration', 'Teamwork and collaboration assessment', 'collaboration', 88, 'pending', 4),
      ('Leadership Assessment', 'Leadership and initiative evaluation', 'leadership', 90, 'pending', 5)
    `;
    
    await connection.promise().query(insertAssessments);
    console.log('✅ Inserted sample assessment data');
    
    // Insert sample agent status data
    const insertAgentStatus = `
      INSERT INTO agent_status (agent_name, status, performance_metrics) VALUES
      ('Onboarding Agent', 'active', '{"success_rate": 95, "avg_response_time": "2.3s"}'),
      ('Assessment Agent', 'active', '{"success_rate": 88, "avg_response_time": "1.8s"}'),
      ('Profile Agent', 'idle', '{"success_rate": 92, "avg_response_time": "1.5s"}'),
      ('Reporting Agent', 'active', '{"success_rate": 90, "avg_response_time": "3.1s"}'),
      ('Monitoring Agent', 'active', '{"success_rate": 97, "avg_response_time": "0.8s"}')
    `;
    
    await connection.promise().query(insertAgentStatus);
    console.log('✅ Inserted sample agent status data');
    
    // Insert sample profile updates data
    const insertProfileUpdates = `
      INSERT INTO profile_updates (fresher_id, update_type, old_value, new_value, updated_by) VALUES
      (1, 'skills', 'JavaScript', 'JavaScript, React, Node.js', 'admin'),
      (2, 'department', 'Engineering', 'Data Science', 'admin'),
      (3, 'experience', '0 years', '1 year', 'admin'),
      (4, 'college', 'UCLA', 'UCLA', 'admin'),
      (5, 'gpa', '3.4', '3.5', 'admin')
    `;
    
    await connection.promise().query(insertProfileUpdates);
    console.log('✅ Inserted sample profile updates data');
    
    console.log('🎉 Maverick database setup completed successfully!');
    console.log('📊 Database contains:');
    console.log('   - 1 admin');
    console.log('   - 6 freshers');
    console.log('   - 5 assignments');
    console.log('   - 5 certifications');
    console.log('   - 5 coding challenges');
    console.log('   - 5 daily quizzes');
    console.log('   - 5 assessments');
    console.log('   - 5 agent status records');
    console.log('   - 5 profile updates');
    console.log('');
    console.log('🔗 Database Relationships:');
    console.log('   - freshers (1) → assignment (many)');
    console.log('   - freshers (1) → certification (many)');
    console.log('   - freshers (1) → coding_challenges (many)');
    console.log('   - freshers (1) → daily_quizzes (many)');
    console.log('   - freshers (1) → assessment (many)');
    console.log('   - freshers (1) → profile_updates (many)');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

// Run the setup
setupMaverickDatabase(); 