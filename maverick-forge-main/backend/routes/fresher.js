const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get fresher profile by ID
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.promise().query(
      'SELECT * FROM freshers WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fresher not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching fresher profile:', error);
    res.status(500).json({ error: 'Failed to fetch fresher profile' });
  }
});

// Get fresher profile by email
router.get('/profile/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const [rows] = await pool.promise().query(
      'SELECT * FROM freshers WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fresher not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching fresher profile by email:', error);
    res.status(500).json({ error: 'Failed to fetch fresher profile' });
  }
});

// Update fresher skills
router.put('/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { skills } = req.body;
    
    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills must be an array' });
    }
    
    const skillsJson = JSON.stringify(skills);
    
    const [result] = await pool.promise().query(
      'UPDATE freshers SET skills = ?, updated_at = NOW() WHERE id = ?',
      [skillsJson, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fresher not found' });
    }
    
    res.json({ 
      message: 'Skills updated successfully',
      skills: skills
    });
  } catch (error) {
    console.error('Error updating fresher skills:', error);
    res.status(500).json({ error: 'Failed to update skills' });
  }
});

// Update fresher training schedule
router.put('/training/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { courseName, startingDate, courseHours, description } = req.body;
    
    const trainingData = JSON.stringify({
      courseName,
      startingDate,
      courseHours,
      description
    });
    
    const [result] = await pool.promise().query(
      'UPDATE freshers SET training_schedule = ?, updated_at = NOW() WHERE id = ?',
      [trainingData, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fresher not found' });
    }
    
    res.json({ 
      message: 'Training schedule updated successfully',
      trainingSchedule: { courseName, startingDate, courseHours, description }
    });
  } catch (error) {
    console.error('Error updating training schedule:', error);
    res.status(500).json({ error: 'Failed to update training schedule' });
  }
});

// Update fresher workflow progress
router.put('/workflow/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { workflowProgress } = req.body;
    
    const workflowJson = JSON.stringify(workflowProgress);
    
    const [result] = await pool.promise().query(
      'UPDATE freshers SET workflow_progress = ?, updated_at = NOW() WHERE id = ?',
      [workflowJson, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fresher not found' });
    }
    
    res.json({ 
      message: 'Workflow progress updated successfully',
      workflowProgress: workflowProgress
    });
  } catch (error) {
    console.error('Error updating workflow progress:', error);
    res.status(500).json({ error: 'Failed to update workflow progress' });
  }
});

// Create new fresher (regular route)
router.post('/', async (req, res) => {
  try {
    const { name, email, department, skills, trainingSchedule, workflowProgress } = req.body;
    
    const skillsJson = JSON.stringify(skills || []);
    const trainingJson = JSON.stringify(trainingSchedule || {});
    const workflowJson = JSON.stringify(workflowProgress || {});
    
    const [result] = await pool.promise().query(
      `INSERT INTO freshers (name, email, department, skills, training_schedule, workflow_progress, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, email, department, skillsJson, trainingJson, workflowJson]
    );
    
    res.status(201).json({
      message: 'Fresher created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating fresher:', error);
    res.status(500).json({ error: 'Failed to create fresher' });
  }
});

// Admin create fresher with auto-generated password
router.post('/admin-create', async (req, res) => {
  try {
    const { name, email, department } = req.body;
    
    // Validate required fields
    if (!name || !email || !department) {
      return res.status(400).json({ 
        error: 'Name, email, and department are required' 
      });
    }
    
    // Generate password based on name
    const namePrefix = name.toLowerCase().replace(/\s+/g, '').substring(0, 3);
    const password = `${namePrefix}123`;
    
    console.log('🔧 Creating new fresher:', { name, email, department, password });
    
    // Insert into database with default values
    const [result] = await pool.promise().query(
      `INSERT INTO freshers (name, email, password, department, role, skills, training_schedule, workflow_progress, quizzes, coding, assignments, certifications, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 'fresher', '[]', '{}', '{}', '0', '0', '0', '0', NOW(), NOW())`,
      [name, email, password, department]
    );
    
    console.log('✅ Fresher created successfully with ID:', result.insertId);
    
    res.status(201).json({
      message: 'Fresher created successfully',
      id: result.insertId,
      email: email,
      password: password,
      credentials: {
        email: email,
        password: password
      }
    });
  } catch (error) {
    console.error('❌ Error creating fresher:', error);
    
    // Check if it's a duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        error: 'A fresher with this email already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create fresher' });
  }
});

// Get fresher data with real-time updates
router.get('/realtime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.promise().query(
      'SELECT * FROM freshers WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fresher not found' });
    }
    
    const fresher = rows[0];
    
    // Parse JSON fields
    const skills = fresher.skills ? JSON.parse(fresher.skills) : [];
    const trainingSchedule = fresher.training_schedule ? JSON.parse(fresher.training_schedule) : {};
    const workflowProgress = fresher.workflow_progress ? JSON.parse(fresher.workflow_progress) : {};
    
    // Calculate overall progress
    const quizScore = parseInt(fresher.quizzes) || 0;
    const codingScore = parseInt(fresher.coding) || 0;
    const assignmentScore = parseInt(fresher.assignments) || 0;
    const certificationScore = parseInt(fresher.certifications) || 0;
    
    const overallProgress = Math.round((quizScore + codingScore + assignmentScore + certificationScore) / 4);
    
    // Determine training status
    const trainingStatus = {
      dailyQuiz: quizScore > 0 ? 'completed' : 'pending',
      codingChallenge: codingScore > 0 ? 'completed' : 'pending',
      assignment: assignmentScore > 0 ? 'submitted' : 'pending',
      certification: certificationScore > 0 ? 'completed' : 'in-progress'
    };
    
    // Assessment scores
    const assessmentScores = {
      quizScore: quizScore,
      codingScore: codingScore,
      assignmentScore: assignmentScore,
      certificationScore: certificationScore
    };
    
    res.json({
      ...fresher,
      skills,
      trainingSchedule,
      workflowProgress,
      overallProgress,
      trainingStatus,
      assessmentScores,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching real-time fresher data:', error);
    res.status(500).json({ error: 'Failed to fetch fresher data' });
  }
});

// Update fresher scores with enhanced real-time updates
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quizzes, coding, assignments, certifications } = req.body;
    
    const [result] = await pool.promise().query(
      `UPDATE freshers 
       SET quizzes = ?, coding = ?, assignments = ?, certifications = ?, updated_at = NOW() 
       WHERE id = ?`,
      [quizzes || '0', coding || '0', assignments || '0', certifications || '0', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fresher not found' });
    }
    
    // Get updated fresher data
    const [updatedRows] = await pool.promise().query(
      'SELECT * FROM freshers WHERE id = ?',
      [id]
    );
    
    if (updatedRows.length > 0) {
      const updatedFresher = updatedRows[0];
      
      // Calculate new overall progress
      const quizScore = parseInt(updatedFresher.quizzes) || 0;
      const codingScore = parseInt(updatedFresher.coding) || 0;
      const assignmentScore = parseInt(updatedFresher.assignments) || 0;
      const certificationScore = parseInt(updatedFresher.certifications) || 0;
      
      const overallProgress = Math.round((quizScore + codingScore + assignmentScore + certificationScore) / 4);
      
      res.json({ 
        message: 'Fresher scores updated successfully',
        scores: { quizzes, coding, assignments, certifications },
        overallProgress,
        updatedAt: new Date().toISOString(),
        triggerRefresh: true
      });
    } else {
      res.json({ 
        message: 'Fresher scores updated successfully',
        scores: { quizzes, coding, assignments, certifications }
      });
    }
  } catch (error) {
    console.error('Error updating fresher scores:', error);
    res.status(500).json({ error: 'Failed to update fresher scores' });
  }
});

// Update fresher scores
router.put('/scores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quizzes, coding, assignments, certifications } = req.body;
    
    console.log('🔧 Updating fresher scores:', { id, quizzes, coding, assignments, certifications });
    
    const [result] = await pool.promise().query(
      `UPDATE freshers 
       SET quizzes = ?, coding = ?, assignments = ?, certifications = ?, updated_at = NOW()
       WHERE id = ?`,
      [quizzes || 0, coding || 0, assignments || 0, certifications || 0, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fresher not found' });
    }
    
    console.log('✅ Fresher scores updated successfully');
    
    res.json({
      message: 'Fresher scores updated successfully',
      id: id,
      scores: { quizzes, coding, assignments, certifications }
    });
  } catch (error) {
    console.error('❌ Error updating fresher scores:', error);
    res.status(500).json({ error: 'Failed to update fresher scores' });
  }
});

// Delete fresher
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.promise().query(
      'DELETE FROM freshers WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fresher not found' });
    }
    
    res.json({ message: 'Fresher deleted successfully' });
  } catch (error) {
    console.error('Error deleting fresher:', error);
    res.status(500).json({ error: 'Failed to delete fresher' });
  }
});

// Get all freshers
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.promise().query('SELECT * FROM freshers ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching freshers:', error);
    res.status(500).json({ error: 'Failed to fetch freshers' });
  }
});

module.exports = router; 