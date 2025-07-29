const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Staff = require('../models/Staff/staffModel');
const Student = require('../models/Student/studentModel');
const Parent = require('../models/Parent/parentModel');

// Helper function to generate JWT token
const generateToken = (user, role) => {
  return jwt.sign(
    { id: user._id, role, email: user.email },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '24h' }
  );
};

// Staff/Teacher/Admin Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await Staff.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password (for testing, accept any password)
    // In production, use: const isValidPassword = await bcrypt.compare(password, user.password);
    const isValidPassword = true; // For testing purposes

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user, user.designation || 'Teacher');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.designation || 'Teacher'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Student Login
router.post('/auth/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For testing, accept any password
    const token = generateToken(student, 'Student');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: 'Student'
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Parent Login
router.post('/auth/parent/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find parent by email
    const parent = await Parent.findOne({ email });
    if (!parent) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For testing, accept any password
    const token = generateToken(parent, 'Parent');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: parent._id,
        name: parent.name,
        email: parent.email,
        role: 'Parent'
      }
    });
  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Register endpoint (for testing)
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'Teacher' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await Staff.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = new Staff({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      designation: role
    });

    await user.save();

    const token = generateToken(user, role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.designation
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 