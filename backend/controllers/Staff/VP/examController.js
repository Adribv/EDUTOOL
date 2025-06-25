const Exam = require('../../../models/Staff/HOD/examPaper.model');
const Department = require('../../../models/Staff/HOD/department.model');

// Get all exams
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new exam
exports.createExam = async (req, res) => {
  try {
    const { departmentId, name, grade, subject, date, duration, type, totalMarks, passingMarks, instructions } = req.body;
    
    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const exam = new Exam({
      departmentId: department._id,
      subject,
      class: grade,
      examType: type,
      examDate: new Date(date),
      duration: parseInt(duration),
      totalMarks: parseInt(totalMarks) || 100,
      passingMarks: parseInt(passingMarks) || 40,
      instructions: instructions || [],
      status: 'Draft',
      createdBy: req.user.id
    });
    
    await exam.save();
    
    const populatedExam = await Exam.findById(exam._id)
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email');
    
    res.status(201).json({ message: 'Exam created successfully', exam: populatedExam });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an exam
exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Update exam fields
    Object.keys(updateData).forEach(key => {
      if (key === 'date') {
        exam.examDate = new Date(updateData[key]);
      } else if (key === 'grade') {
        exam.class = updateData[key];
      } else if (key === 'type') {
        exam.examType = updateData[key];
      } else if (key === 'duration' || key === 'totalMarks' || key === 'passingMarks') {
        exam[key] = parseInt(updateData[key]);
      } else {
        exam[key] = updateData[key];
      }
    });
    
    await exam.save();
    
    const updatedExam = await Exam.findById(exam._id)
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email');
    
    res.json({ message: 'Exam updated successfully', exam: updatedExam });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an exam
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    await Exam.findByIdAndDelete(id);
    
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get exams by grade
exports.getExamsByGrade = async (req, res) => {
  try {
    const { grade } = req.params;
    
    const exams = await Exam.find({ class: grade })
      .populate('departmentId', 'name')
      .populate('createdBy', 'name email')
      .sort({ examDate: 1 });
    
    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams by grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 