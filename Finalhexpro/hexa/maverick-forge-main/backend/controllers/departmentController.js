const db = require('../config/database');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    console.log('🔍 Fetching all departments...');
    
    const [departments] = await db.promise().query(`
      SELECT id, name, description, created_at, updated_at 
      FROM departments 
      ORDER BY name
    `);
    
    console.log('✅ Departments fetched successfully:', departments.length);
    
    res.json({
      success: true,
      data: departments
    });
    
  } catch (error) {
    console.error('❌ Error fetching departments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch departments' 
    });
  }
};

// Add new department
exports.addDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Department name is required'
      });
    }
    
    console.log('🔧 Adding new department:', { name, description });
    
    // Check if department already exists
    const [existing] = await db.promise().query(
      'SELECT id FROM departments WHERE name = ?',
      [name.trim()]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Department with this name already exists'
      });
    }
    
    // Insert new department
    const [result] = await db.promise().query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name.trim(), description || null]
    );
    
    console.log('✅ Department added successfully with ID:', result.insertId);
    
    // Fetch the newly created department
    const [newDepartment] = await db.promise().query(
      'SELECT * FROM departments WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Department added successfully',
      data: newDepartment[0]
    });
    
  } catch (error) {
    console.error('❌ Error adding department:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add department' 
    });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Department name is required'
      });
    }
    
    console.log('🔧 Updating department:', { id, name, description });
    
    // Check if department exists
    const [existing] = await db.promise().query(
      'SELECT id FROM departments WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }
    
    // Check if name already exists for another department
    const [nameExists] = await db.promise().query(
      'SELECT id FROM departments WHERE name = ? AND id != ?',
      [name.trim(), id]
    );
    
    if (nameExists.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Department with this name already exists'
      });
    }
    
    // Update department
    await db.promise().query(
      'UPDATE departments SET name = ?, description = ?, updated_at = NOW() WHERE id = ?',
      [name.trim(), description || null, id]
    );
    
    console.log('✅ Department updated successfully');
    
    // Fetch the updated department
    const [updatedDepartment] = await db.promise().query(
      'SELECT * FROM departments WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment[0]
    });
    
  } catch (error) {
    console.error('❌ Error updating department:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update department' 
    });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting department:', id);
    
    // Check if department exists
    const [existing] = await db.promise().query(
      'SELECT id FROM departments WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }
    
    // Check if any freshers are using this department
    const [freshersUsingDept] = await db.promise().query(
      'SELECT COUNT(*) as count FROM freshers WHERE department = (SELECT name FROM departments WHERE id = ?)',
      [id]
    );
    
    if (freshersUsingDept[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete department. ${freshersUsingDept[0].count} fresher(s) are currently assigned to this department.`
      });
    }
    
    // Delete department
    await db.promise().query(
      'DELETE FROM departments WHERE id = ?',
      [id]
    );
    
    console.log('✅ Department deleted successfully');
    
    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting department:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete department' 
    });
  }
}; 