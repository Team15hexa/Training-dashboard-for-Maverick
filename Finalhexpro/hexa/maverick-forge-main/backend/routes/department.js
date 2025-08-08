const express = require('express');
const router = express.Router();
const { 
  getAllDepartments, 
  addDepartment, 
  updateDepartment, 
  deleteDepartment 
} = require('../controllers/departmentController');

// Get all departments
router.get('/', getAllDepartments);

// Add new department
router.post('/', addDepartment);

// Update department
router.put('/:id', updateDepartment);

// Delete department
router.delete('/:id', deleteDepartment);

module.exports = router; 