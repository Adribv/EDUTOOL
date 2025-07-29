const mongoose = require('mongoose');
const Department = require('../../../models/Staff/HOD/department.model');
const TeacherRemarks = require('../../../models/teacherRemarks.model');

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
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false
  },
  courseCode: {
    type: String,
    default: ''
  },
  prerequisites: {
    type: String,
    default: ''
  },
  totalHours: {
    type: String,
    default: ''
  },
  contactHours: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  objectives: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    enum: ['First Term', 'Second Term', 'Third Term', 'Annual'],
    required: true
  },
  assessmentMethods: {
    type: String,
    default: ''
  },
  learningResources: {
    type: String,
    default: ''
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

// Get approved curriculum plans
exports.getApprovedCurriculumPlans = async (req, res) => {
  try {
    const approvedCurriculumPlans = await CurriculumPlan.find({ status: 'Approved' })
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ approvedAt: -1 });
    
    res.json(approvedCurriculumPlans);
  } catch (error) {
    console.error('Error fetching approved curriculum plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new curriculum plan
exports.createCurriculumPlan = async (req, res) => {
  try {
    const { 
      departmentId, 
      subject, 
      grade, 
      instructor,
      courseCode,
      prerequisites,
      totalHours,
      contactHours,
      description, 
      objectives, 
      topics,
      academicYear,
      semester,
      assessmentMethods,
      learningResources
    } = req.body;
    
    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const curriculumPlan = new CurriculumPlan({
      departmentId: department._id,
      subject,
      grade,
      instructor: instructor || null,
      courseCode: courseCode || '',
      prerequisites: prerequisites || '',
      totalHours: totalHours || '',
      contactHours: contactHours || '',
      description,
      objectives,
      academicYear: academicYear || new Date().getFullYear().toString(),
      semester: semester || 'First Term',
      assessmentMethods: assessmentMethods || '',
      learningResources: learningResources || '',
      topics: topics || [],
      status: 'Draft',
      createdBy: req.user.id
    });
    
    await curriculumPlan.save();
    
    const populatedPlan = await CurriculumPlan.findById(curriculumPlan._id)
      .populate('departmentId', 'name')
      .populate('instructor', 'name email')
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

// Get teacher remarks for a curriculum plan (for point 4)
exports.getTeacherRemarksForCurriculum = async (req, res) => {
  try {
    const { id } = req.params;
    const curriculumPlan = await CurriculumPlan.findById(id);
    if (!curriculumPlan) {
      return res.status(404).json({ message: 'Curriculum plan not found' });
    }
    // Map curriculum fields to teacher remarks query
    const filter = {
      class: curriculumPlan.grade,
      subject: curriculumPlan.subject,
      academicYear: curriculumPlan.academicYear || '',
      semester: curriculumPlan.semester || '',
    };
    // Optionally, add section if available
    if (curriculumPlan.section) filter.section = curriculumPlan.section;
    // Fetch teacher remarks
    const remarks = await TeacherRemarks.find(filter).sort({ startDate: 1 });
    res.json({ success: true, data: remarks });
  } catch (error) {
    console.error('Error fetching teacher remarks for curriculum:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const Staff = require('../../../models/Staff/staffModel');
    const teachers = await Staff.find({ role: 'Teacher' })
      .select('name email department')
      .populate('department', 'name')
      .sort({ name: 1 });
    
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get teachers by department
exports.getTeachersByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const Staff = require('../../../models/Staff/staffModel');
    const teachers = await Staff.find({ 
      role: 'Teacher', 
      department: departmentId 
    })
      .select('name email')
      .sort({ name: 1 });
    
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers by department:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 