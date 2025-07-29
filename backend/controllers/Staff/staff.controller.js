const Assignment = require('../../models/Staff/Teacher/assignment.model');
const Attendance = require('../../models/Staff/Teacher/attendance.model');
const Staff = require('../../models/Staff/staffModel');
const Student = require('../../models/Student/studentModel');
const Resource = require('../../models/Staff/Teacher/resource.model');
const LessonPlan = require('../../models/Staff/Teacher/lessonplan.model');


exports.createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAssignments = async (req, res) => {
  const assignments = await Assignment.find({ createdBy: req.user.id });
  res.json(assignments);
};

exports.markAttendance = async (req, res) => {
  const { studentRollNumber, date, status } = req.body;
  const attendance = await Attendance.create({ studentRollNumber, date, status, markedBy: req.user.id });
  res.status(201).json(attendance);
};

exports.getMarkedAttendance = async (req, res) => {
  const records = await Attendance.find({ markedBy: req.user.id });
  res.json(records);
};

// controllers/staff.controller.js — Additions for HOD
exports.assignSubjectToTeacher = async (req, res) => {
    const { teacherId } = req.body;
    const { class: cls, section, subject } = req.body;
  
    const teacher = await Staff.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }
  
    teacher.assignedSubjects.push({ class: cls, section, subject });
    await teacher.save();
    res.json({ message: 'Subject assigned successfully', teacher });
  };
  
  exports.getAssignedStudents = async (req, res) => {
    const staff = await Staff.findById(req.user.id);
    if (!staff || staff.role !== 'Teacher') return res.status(403).json({ message: 'Only teachers can access this' });
  
    const assignedStudents = [];
    for (const item of staff.assignedSubjects) {
      const students = await require('../../models/Student/studentModel').find({ class: item.class, section: item.section });
      assignedStudents.push({ subject: item.subject, class: item.class, section: item.section, students });
    }
  
    res.json(assignedStudents);
  };

exports.getClassData = async (req, res) => {
  // Teacher can view students in their assigned classes
  const staff = await Staff.findById(req.user.id);
  if (!staff) return res.status(404).json({ message: 'Staff not found' });

  const assigned = staff.assignedSubjects;
  let students = [];
  for (const subj of assigned) {
    const found = await Student.find({ class: subj.class, section: subj.section });
    students = students.concat(found);
  }
  res.json({ students });
};

exports.uploadResource = async (req, res) => {
  // Parse JSON fields from 'data' field in form-data
  let data = {};
  if (req.body.data) {
    try {
      data = JSON.parse(req.body.data);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON in data field' });
    }
  }
  const { title, description, class: cls, section, subject } = data;
  const fileUrl = req.file ? `/uploads/resources/${req.file.filename}` : null;
  const resource = await Resource.create({
    title,
    description,
    fileUrl,
    class: cls,
    section,
    subject,
    uploadedBy: req.user.id
  });
  res.status(201).json(resource);
};

exports.submitLessonPlan = async (req, res) => {
  // Parse JSON fields from 'data' field in form-data
  let data = {};
  if (req.body.data) {
    try {
      data = JSON.parse(req.body.data);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON in data field' });
    }
  }
  const { title, description, class: cls, section, subject } = data;
  const fileUrl = req.file ? `/uploads/lessonPlan/${req.file.filename}` : null;
  const lessonPlan = await LessonPlan.create({
    title,
    description,
    fileUrl,
    class: cls,
    section,
    subject,
    submittedBy: req.user.id
  });
  res.status(201).json(lessonPlan);
};

exports.getLessonPlans = async (req, res) => {
  // Teacher sees their own, HOD sees all for approval
  let filter = {};
  if (req.user.role === 'Teacher') filter = { submittedBy: req.user.id };
  const lessonPlans = await LessonPlan.find(filter);
  res.json(lessonPlans);
};

exports.approveLessonPlan = async (req, res) => {
  // Only HOD can approve
  const { id } = req.params;
  const { status } = req.body; // 'Approved' or 'Rejected'
  const lessonPlan = await LessonPlan.findById(id);
  if (!lessonPlan) return res.status(404).json({ message: 'Lesson plan not found' });
  lessonPlan.status = status;
  lessonPlan.approvedBy = req.user.id;
  await lessonPlan.save();
  res.json(lessonPlan);
};

exports.editGrades = async (req, res) => {
  // For simplicity, assume grades are stored in Student model as an array
  const { rollNumber, subject, grade, feedback } = req.body;
  const student = await Student.findOne({ rollNumber });
  if (!student) return res.status(404).json({ message: 'Student not found' });

  if (!student.grades) student.grades = [];
  const idx = student.grades.findIndex(g => g.subject === subject);
  if (idx > -1) {
    student.grades[idx] = { subject, grade, feedback };
  } else {
    student.grades.push({ subject, grade, feedback });
  }
  await student.save();
  res.json({ message: 'Grade updated', grades: student.grades });
};