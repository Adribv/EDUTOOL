const mongoose = require('mongoose');
const Department = require('../../../models/Staff/HOD/department.model');

// Create a curriculum plan model
const curriculumPlanSchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  objectives: {
    type: String,
    required: true
  },
  topics: [{
    title: String,
    description: String,
    duration: String,
    learningOutcomes: [String]
  }],
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  approvedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  }
}, { timestamps: true });

// Check if model already exists before defining it
const CurriculumPlan = mongoose.models.CurriculumPlan || mongoose.model('CurriculumPlan', curriculumPlanSchema);

// Get all curriculum plans
exports.getAllCurriculumPlans = async (req, res) => {
  try {
    const curriculumPlans = await CurriculumPlan.find()
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(curriculumPlans);
  } catch (error) {
    console.error('Error fetching curriculum plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new curriculum plan
exports.createCurriculumPlan = async (req, res) => {
  try {
    const { departmentId, subject, grade, description, objectives, topics } = req.body;
    
    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const curriculumPlan = new CurriculumPlan({
      departmentId: department._id,
      subject,
      grade,
      description,
      objectives,
      topics: topics || [],
      status: 'Draft',
      createdBy: req.user.id
    });
    
    await curriculumPlan.save();
    
    const populatedPlan = await CurriculumPlan.findById(curriculumPlan._id)
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email');
    
    res.status(201).json({ message: 'Curriculum plan created successfully', plan: populatedPlan });
  } catch (error) {
    console.error('Error creating curriculum plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a curriculum plan
exports.updateCurriculumPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const curriculumPlan = await CurriculumPlan.findById(id);
    if (!curriculumPlan) {
      return res.status(404).json({ message: 'Curriculum plan not found' });
    }
    
    // Update curriculum plan fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'id') {
        curriculumPlan[key] = updateData[key];
      }
    });
    
    await curriculumPlan.save();
    
    const updatedPlan = await CurriculumPlan.findById(curriculumPlan._id)
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');
    
    res.json({ message: 'Curriculum plan updated successfully', plan: updatedPlan });
  } catch (error) {
    console.error('Error updating curriculum plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve a curriculum plan
exports.approveCurriculumPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const curriculumPlan = await CurriculumPlan.findById(id);
    if (!curriculumPlan) {
      return res.status(404).json({ message: 'Curriculum plan not found' });
    }
    
    curriculumPlan.status = 'Approved';
    curriculumPlan.approvedBy = req.user.id;
    curriculumPlan.approvedAt = new Date();
    
    await curriculumPlan.save();
    
    const approvedPlan = await CurriculumPlan.findById(curriculumPlan._id)
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');
    
    res.json({ message: 'Curriculum plan approved successfully', plan: approvedPlan });
  } catch (error) {
    console.error('Error approving curriculum plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a curriculum plan
exports.rejectCurriculumPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const curriculumPlan = await CurriculumPlan.findById(id);
    if (!curriculumPlan) {
      return res.status(404).json({ message: 'Curriculum plan not found' });
    }
    
    curriculumPlan.status = 'Rejected';
    curriculumPlan.rejectionReason = reason;
    
    await curriculumPlan.save();
    
    res.json({ message: 'Curriculum plan rejected successfully' });
  } catch (error) {
    console.error('Error rejecting curriculum plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get curriculum plans by grade
exports.getCurriculumPlansByGrade = async (req, res) => {
  try {
    const { grade } = req.params;
    
    const curriculumPlans = await CurriculumPlan.find({ grade })
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(curriculumPlans);
  } catch (error) {
    console.error('Error fetching curriculum plans by grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a curriculum plan
exports.deleteCurriculumPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const curriculumPlan = await CurriculumPlan.findById(id);
    if (!curriculumPlan) {
      return res.status(404).json({ message: 'Curriculum plan not found' });
    }
    
    await CurriculumPlan.findByIdAndDelete(id);
    
    res.json({ message: 'Curriculum plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting curriculum plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 