USE maverick;

-- Fix skills data for all freshers
UPDATE freshers SET skills = '["JavaScript", "React", "Node.js"]' WHERE id = 1;
UPDATE freshers SET skills = '["Python", "Machine Learning", "SQL"]' WHERE id = 2;
UPDATE freshers SET skills = '["Docker", "Kubernetes", "AWS"]' WHERE id = 3;
UPDATE freshers SET skills = '["Digital Marketing", "Analytics"]' WHERE id = 4;
UPDATE freshers SET skills = '["Sales Techniques", "CRM"]' WHERE id = 5;
UPDATE freshers SET skills = '["Python", "Data Analysis", "Visualization"]' WHERE id = 6;

-- Fix training schedule data
UPDATE freshers SET training_schedule = '{"courseName": "Full Stack Development", "startingDate": "2024-01-15", "courseHours": 120, "description": "Comprehensive training in modern web development"}' WHERE id = 1;
UPDATE freshers SET training_schedule = '{"courseName": "Data Science Fundamentals", "startingDate": "2024-01-20", "courseHours": 100, "description": "Introduction to data science and machine learning"}' WHERE id = 2;
UPDATE freshers SET training_schedule = '{"courseName": "DevOps Engineering", "startingDate": "2024-01-25", "courseHours": 80, "description": "Cloud infrastructure and deployment automation"}' WHERE id = 3;
UPDATE freshers SET training_schedule = '{"courseName": "Digital Marketing", "startingDate": "2024-02-01", "courseHours": 60, "description": "Marketing strategies and analytics"}' WHERE id = 4;
UPDATE freshers SET training_schedule = '{"courseName": "Sales Training", "startingDate": "2024-02-05", "courseHours": 40, "description": "Sales techniques and customer relationship management"}' WHERE id = 5;
UPDATE freshers SET training_schedule = '{"courseName": "Advanced Data Science", "startingDate": "2024-02-10", "courseHours": 120, "description": "Advanced machine learning and data analysis"}' WHERE id = 6;

-- Fix workflow progress data
UPDATE freshers SET workflow_progress = '{"profileUpdated": true, "quizCompleted": true, "codingCompleted": true, "assignmentSubmitted": true, "certificationInProgress": true}' WHERE id = 1;
UPDATE freshers SET workflow_progress = '{"profileUpdated": true, "quizCompleted": true, "codingCompleted": true, "assignmentSubmitted": true, "certificationCompleted": true}' WHERE id = 2;
UPDATE freshers SET workflow_progress = '{"profileUpdated": true, "quizCompleted": true, "codingCompleted": false, "assignmentSubmitted": false, "certificationInProgress": false}' WHERE id = 3;
UPDATE freshers SET workflow_progress = '{"profileUpdated": true, "quizCompleted": true, "codingCompleted": false, "assignmentSubmitted": true, "certificationInProgress": false}' WHERE id = 4;
UPDATE freshers SET workflow_progress = '{"profileUpdated": true, "quizCompleted": true, "codingCompleted": false, "assignmentSubmitted": true, "certificationInProgress": true}' WHERE id = 5;
UPDATE freshers SET workflow_progress = '{"profileUpdated": true, "quizCompleted": true, "codingCompleted": true, "assignmentSubmitted": true, "certificationInProgress": true}' WHERE id = 6;

-- Verify the updates
SELECT id, name, skills, training_schedule, workflow_progress FROM freshers LIMIT 3;
