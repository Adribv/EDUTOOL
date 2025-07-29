const mongoose = require('mongoose');
const Department = require('../../../models/Staff/HOD/department.model');
const Staff = require('../../../models/Staff/staffModel');

// Create a HOD submission model
const hodSubmissionSchema = new mongoose.Schema({
  hodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  type: {
    type: String,
    enum: ['Exam Paper', 'Curriculum Plan', 'Timetable', 'Resource Request', 'Report'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  content: mongoose.Schema.Types.Mixed, // Flexible content based on type
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  approvedAt: Date,
  rejectionReason: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Check if model already exists before defining it
const HODSubmission = mongoose.models.HODSubmission || mongoose.model('HODSubmission', hodSubmissionSchema);

// Get all HOD submissions
exports.getAllHODSubmissions = async (req, res) => {
  try {
    const submissions = await HODSubmission.find()
      .populate('hodId', 'name email')
      .populate('departmentId', 'name')
      .populate('approvedBy', 'name email')
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching HOD submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending HOD submissions
exports.getPendingHODSubmissions = async (req, res) => {
  try {
    const submissions = await HODSubmission.find({ status: 'Pending' })
      .populate('hodId', 'name email')
      .populate('departmentId', 'name')
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching pending HOD submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve a HOD submission
exports.approveHODSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    
    const submission = await HODSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    submission.status = 'Approved';
    submission.approvedBy = req.user.id;
    submission.approvedAt = new Date();
    
    await submission.save();
    
    const approvedSubmission = await HODSubmission.findById(submission._id)
      .populate('hodId', 'name email')
      .populate('departmentId', 'name')
      .populate('approvedBy', 'name email');
    
    res.json({ message: 'Submission approved successfully', submission: approvedSubmission });
  } catch (error) {
    console.error('Error approving HOD submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a HOD submission
exports.rejectHODSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const submission = await HODSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    submission.status = 'Rejected';
    submission.rejectionReason = reason;
    
    await submission.save();
    
    const rejectedSubmission = await HODSubmission.findById(submission._id)
      .populate('hodId', 'name email')
      .populate('departmentId', 'name')
      .populate('approvedBy', 'name email');
    
    res.json({ message: 'Submission rejected successfully', submission: rejectedSubmission });
  } catch (error) {
    console.error('Error rejecting HOD submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get HOD submissions by department
exports.getHODSubmissionsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const submissions = await HODSubmission.find({ departmentId })
      .populate('hodId', 'name email')
      .populate('departmentId', 'name')
      .populate('approvedBy', 'name email')
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching HOD submissions by department:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get HOD submissions by type
exports.getHODSubmissionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const submissions = await HODSubmission.find({ type })
      .populate('hodId', 'name email')
      .populate('departmentId', 'name')
      .populate('approvedBy', 'name email')
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching HOD submissions by type:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 