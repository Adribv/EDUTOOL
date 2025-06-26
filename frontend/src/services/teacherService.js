import { teacherAPI } from './api';
import { teacherSampleData, getTeacherData, simulateApiDelay, createMockResponse } from './teacherSampleData';

const teacherService = {
  // Dashboard
  getDashboard: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('dashboard'));
  },
  getDashboardStats: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('dashboard'));
  },
  
  // Class Management
  getClasses: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('classes'));
  },
  createClass: async (data) => {
    await simulateApiDelay();
    const newClass = {
      id: Date.now(),
      ...data,
      totalStudents: 0,
      averageGrade: 0,
      attendanceRate: 0
    };
    return createMockResponse(newClass);
  },
  updateClass: async (classId, data) => {
    await simulateApiDelay();
    return createMockResponse({ id: classId, ...data });
  },
  deleteClass: async (classId) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Class deleted successfully' });
  },
  getClassStudents: async (classId) => {
    await simulateApiDelay();
    const students = getTeacherData('students').filter(student => 
      student.class.includes(classId.toString())
    );
    return createMockResponse(students);
  },
  getClassAttendance: async (classId) => {
    await simulateApiDelay();
    const attendance = getTeacherData('attendance').filter(att => 
      att.classId === parseInt(classId)
    );
    return createMockResponse(attendance);
  },
  markAttendance: async (classId, data) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Attendance marked successfully' });
  },
  
  // Assignment Management
  getAssignments: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('assignments'));
  },
  createAssignment: async (data) => {
    await simulateApiDelay();
    const newAssignment = {
      id: Date.now(),
      ...data,
      totalStudents: 30,
      submittedCount: 0,
      gradedCount: 0,
      averageGrade: 0,
      status: "active"
    };
    return createMockResponse(newAssignment);
  },
  updateAssignment: async (assignmentId, data) => {
    await simulateApiDelay();
    return createMockResponse({ id: assignmentId, ...data });
  },
  deleteAssignment: async (assignmentId) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Assignment deleted successfully' });
  },
  getAssignmentSubmissions: async (assignmentId) => {
    await simulateApiDelay();
    const submissions = getTeacherData('assignmentSubmissions').filter(sub => 
      sub.assignmentId === parseInt(assignmentId)
    );
    return createMockResponse(submissions);
  },
  gradeAssignment: async (assignmentId, submissionId, data) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Assignment graded successfully' });
  },
  
  // Exam Management
  getExams: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('exams'));
  },
  createExam: async (data) => {
    await simulateApiDelay();
    const newExam = {
      id: Date.now(),
      ...data,
      totalStudents: 30,
      averageScore: null,
      highestScore: null,
      lowestScore: null,
      status: "scheduled"
    };
    return createMockResponse(newExam);
  },
  updateExam: async (examId, data) => {
    await simulateApiDelay();
    return createMockResponse({ id: examId, ...data });
  },
  deleteExam: async (examId) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Exam deleted successfully' });
  },
  getExamResults: async (examId) => {
    await simulateApiDelay();
    const results = getTeacherData('examResults').filter(result => 
      result.examId === parseInt(examId)
    );
    return createMockResponse(results);
  },
  gradeExam: async (examId, studentId, data) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Exam graded successfully' });
  },
  
  // Student Management
  getStudents: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('students'));
  },
  getStudentDetails: async (studentId) => {
    await simulateApiDelay();
    const student = getTeacherData('students').find(s => s.id === parseInt(studentId));
    return createMockResponse(student);
  },
  getStudentGrades: async (studentId) => {
    await simulateApiDelay();
    const grades = getTeacherData('grades').filter(grade => 
      grade.studentId === parseInt(studentId)
    );
    return createMockResponse(grades);
  },
  getStudentAttendance: async (studentId) => {
    await simulateApiDelay();
    const attendance = getTeacherData('studentAttendance').filter(att => 
      att.studentId === parseInt(studentId)
    );
    return createMockResponse(attendance);
  },
  getStudentAssignments: async (studentId) => {
    await simulateApiDelay();
    const submissions = getTeacherData('assignmentSubmissions').filter(sub => 
      sub.studentId === parseInt(studentId)
    );
    return createMockResponse(submissions);
  },
  
  // Grade Management
  getGrades: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('grades'));
  },
  createGrade: async (data) => {
    await simulateApiDelay();
    const newGrade = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString().split('T')[0]
    };
    return createMockResponse(newGrade);
  },
  updateGrade: async (gradeId, data) => {
    await simulateApiDelay();
    return createMockResponse({ id: gradeId, ...data });
  },
  deleteGrade: async (gradeId) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Grade deleted successfully' });
  },
  
  // Attendance Management
  getAttendance: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('attendance'));
  },
  createAttendance: async (data) => {
    await simulateApiDelay();
    const newAttendance = {
      id: Date.now(),
      ...data,
      attendanceRate: ((data.presentCount / data.totalStudents) * 100).toFixed(1)
    };
    return createMockResponse(newAttendance);
  },
  updateAttendance: async (attendanceId, data) => {
    await simulateApiDelay();
    return createMockResponse({ id: attendanceId, ...data });
  },
  deleteAttendance: async (attendanceId) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Attendance record deleted successfully' });
  },
  
  // Communication Management
  getAnnouncements: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('announcements'));
  },
  getMessages: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('messages'));
  },
  createAnnouncement: async (data) => {
    await simulateApiDelay();
    const newAnnouncement = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString().split('T')[0]
    };
    return createMockResponse(newAnnouncement);
  },
  updateAnnouncement: async (announcementId, data) => {
    await simulateApiDelay();
    return createMockResponse({ id: announcementId, ...data });
  },
  deleteAnnouncement: async (announcementId) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Announcement deleted successfully' });
  },
  createMessage: async (data) => {
    await simulateApiDelay();
    const newMessage = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString().split('T')[0],
      status: 'sent'
    };
    return createMockResponse(newMessage);
  },
  updateMessage: async (messageId, data) => {
    await simulateApiDelay();
    return createMockResponse({ id: messageId, ...data });
  },
  deleteMessage: async (messageId) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Message deleted successfully' });
  },
  
  // Profile Management
  getProfile: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('profile'));
  },
  updateProfile: async (data) => {
    await simulateApiDelay();
    return createMockResponse({ ...getTeacherData('profile'), ...data });
  },
  updatePassword: async (data) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Password updated successfully' });
  },
  uploadProfileImage: async (formData) => {
    await simulateApiDelay();
    return createMockResponse({ message: 'Profile image uploaded successfully' });
  },
  
  // Timetable
  getTimetable: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('timetable'));
  },
  
  // Learning Resources
  getResources: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('resources'));
  },
  uploadResource: async (data) => {
    await simulateApiDelay();
    const newResource = {
      id: Date.now(),
      ...data,
      uploadDate: new Date().toISOString().split('T')[0],
      downloads: 0
    };
    return createMockResponse(newResource);
  },
  
  // Lesson Plans
  getLessonPlans: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('lessonPlans'));
  },
  submitLessonPlan: async (data) => {
    await simulateApiDelay();
    const newLessonPlan = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    return createMockResponse(newLessonPlan);
  },
  
  // Projects
  getProjects: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('projects'));
  },
  createProject: async (data) => {
    await simulateApiDelay();
    const newProject = {
      id: Date.now(),
      ...data,
      totalStudents: 30,
      completedCount: 0
    };
    return createMockResponse(newProject);
  },
  
  // Parent Communications
  getParentCommunications: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('parentCommunications'));
  },
  recordCommunication: async (data) => {
    await simulateApiDelay();
    const newCommunication = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    };
    return createMockResponse(newCommunication);
  },
  
  // Feedback
  getFeedback: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('feedback'));
  },
  submitFeedback: async (data) => {
    await simulateApiDelay();
    const newFeedback = {
      id: Date.now(),
      ...data,
      date: new Date().toISOString().split('T')[0],
      status: 'submitted'
    };
    return createMockResponse(newFeedback);
  },
  
  // Notifications
  getNotifications: async () => {
    await simulateApiDelay();
    return createMockResponse(getTeacherData('notifications'));
  },
  
  // Reports
  generateClassReport: async (classId, params) => {
    await simulateApiDelay();
    const classData = getTeacherData('classes').find(c => c.id === parseInt(classId));
    const students = getTeacherData('students').filter(s => s.class.includes(classId.toString()));
    return createMockResponse({ class: classData, students, report: 'Class report generated' });
  },
  generateStudentReport: async (studentId, params) => {
    await simulateApiDelay();
    const student = getTeacherData('students').find(s => s.id === parseInt(studentId));
    const grades = getTeacherData('grades').filter(g => g.studentId === parseInt(studentId));
    return createMockResponse({ student, grades, report: 'Student report generated' });
  },
  generateAttendanceReport: async (params) => {
    await simulateApiDelay();
    return createMockResponse({ attendance: getTeacherData('attendance'), report: 'Attendance report generated' });
  },
  generateGradeReport: async (params) => {
    await simulateApiDelay();
    return createMockResponse({ grades: getTeacherData('grades'), report: 'Grade report generated' });
  },
};

export default teacherService; 