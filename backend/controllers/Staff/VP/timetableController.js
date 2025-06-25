const mongoose = require('mongoose');
const Department = require('../../../models/Staff/HOD/department.model');

// Create an exam timetable model for scheduling exams
const examTimetableSchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  examName: {
    type: String,
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
  examDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  examType: {
    type: String,
    required: true
  },
  room: {
    type: String,
    default: 'Main Hall'
  },
  invigilator: {
    type: String,
    default: 'To be assigned'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  }
}, { timestamps: true });

// Check if model already exists before defining it
const ExamTimetable = mongoose.models.ExamTimetable || mongoose.model('ExamTimetable', examTimetableSchema);

// Get all exam timetables
exports.getAllTimetables = async (req, res) => {
  try {
    const timetables = await ExamTimetable.find()
      .populate('departmentId', 'name')
      .populate('examId', 'subject examType totalMarks')
      .populate('createdBy', 'name email')
      .sort({ examDate: 1, startTime: 1 });
    
    res.json(timetables);
  } catch (error) {
    console.error('Error fetching exam timetables:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new exam timetable entry
exports.createTimetable = async (req, res) => {
  try {
    const { 
      departmentId, 
      examId, 
      examName, 
      subject, 
      grade, 
      examDate, 
      startTime, 
      endTime, 
      duration, 
      examType, 
      room, 
      invigilator 
    } = req.body;
    
    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if exam is already scheduled at this time
    const existingSchedule = await ExamTimetable.findOne({
      examDate: new Date(examDate),
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });
    
    if (existingSchedule) {
      return res.status(400).json({ message: 'There is already an exam scheduled during this time slot' });
    }
    
    const timetable = new ExamTimetable({
      departmentId: department._id,
      examId,
      examName,
      subject,
      grade,
      examDate: new Date(examDate),
      startTime,
      endTime,
      duration: parseInt(duration),
      examType,
      room: room || 'Main Hall',
      invigilator: invigilator || 'To be assigned',
      createdBy: req.user.id
    });
    
    await timetable.save();
    
    const populatedTimetable = await ExamTimetable.findById(timetable._id)
      .populate('departmentId', 'name')
      .populate('examId', 'subject examType totalMarks')
      .populate('createdBy', 'name email');
    
    res.status(201).json({ message: 'Exam scheduled successfully', timetable: populatedTimetable });
  } catch (error) {
    console.error('Error creating exam timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an exam timetable entry
exports.updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const timetable = await ExamTimetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ message: 'Exam timetable not found' });
    }
    
    // Update timetable fields
    Object.keys(updateData).forEach(key => {
      if (key === 'examDate') {
        timetable.examDate = new Date(updateData[key]);
      } else if (key === 'duration') {
        timetable.duration = parseInt(updateData[key]);
      } else if (key !== 'id') {
        timetable[key] = updateData[key];
      }
    });
    
    await timetable.save();
    
    const updatedTimetable = await ExamTimetable.findById(timetable._id)
      .populate('departmentId', 'name')
      .populate('examId', 'subject examType totalMarks')
      .populate('createdBy', 'name email');
    
    res.json({ message: 'Exam timetable updated successfully', timetable: updatedTimetable });
  } catch (error) {
    console.error('Error updating exam timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an exam timetable entry
exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    
    const timetable = await ExamTimetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ message: 'Exam timetable not found' });
    }
    
    await ExamTimetable.findByIdAndDelete(id);
    
    res.json({ message: 'Exam timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get exam timetables by grade
exports.getTimetablesByGrade = async (req, res) => {
  try {
    const { grade } = req.params;
    
    const timetables = await ExamTimetable.find({ grade })
      .populate('departmentId', 'name')
      .populate('examId', 'subject examType totalMarks')
      .populate('createdBy', 'name email')
      .sort({ examDate: 1, startTime: 1 });
    
    res.json(timetables);
  } catch (error) {
    console.error('Error fetching exam timetables by grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get exam timetables by date range
exports.getTimetablesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.examDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const timetables = await ExamTimetable.find(query)
      .populate('departmentId', 'name')
      .populate('examId', 'subject examType totalMarks')
      .populate('createdBy', 'name email')
      .sort({ examDate: 1, startTime: 1 });
    
    res.json(timetables);
  } catch (error) {
    console.error('Error fetching exam timetables by date range:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 