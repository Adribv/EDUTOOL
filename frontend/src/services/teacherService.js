import { teacherAPI } from './api';

const teacherService = {
  // Dashboard
  getDashboard: () => teacherAPI.getDashboard(),
  getDashboardStats: () => teacherAPI.getDashboard(), // Alias for compatibility
  
  // Class Management
  getClasses: () => teacherAPI.getClasses(),
  createClass: (data) => teacherAPI.createClass(data),
  updateClass: (classId, data) => teacherAPI.updateClass(classId, data),
  deleteClass: (classId) => teacherAPI.deleteClass(classId),
  getClassStudents: (classId) => teacherAPI.getClassStudents(classId),
  getClassAttendance: (classId) => teacherAPI.getClassAttendance(classId),
  markAttendance: (classId, data) => teacherAPI.markAttendance(classId, data),
  
  // Assignment Management
  getAssignments: () => teacherAPI.getAssignments(),
  createAssignment: (data) => teacherAPI.createAssignment(data),
  updateAssignment: (assignmentId, data) => teacherAPI.updateAssignment(assignmentId, data),
  deleteAssignment: (assignmentId) => teacherAPI.deleteAssignment(assignmentId),
  getAssignmentSubmissions: (assignmentId) => teacherAPI.getAssignmentSubmissions(assignmentId),
  gradeAssignment: (assignmentId, submissionId, data) => 
    teacherAPI.gradeAssignment(assignmentId, submissionId, data),
  
  // Exam Management
  getExams: () => teacherAPI.getExams(),
  createExam: (data) => teacherAPI.createExam(data),
  updateExam: (examId, data) => teacherAPI.updateExam(examId, data),
  deleteExam: (examId) => teacherAPI.deleteExam(examId),
  getExamResults: (examId) => teacherAPI.getExamResults(examId),
  gradeExam: (examId, studentId, data) => 
    teacherAPI.gradeExam(examId, studentId, data),
  
  // Student Management
  getStudents: () => teacherAPI.getStudents(),
  getStudentDetails: (studentId) => teacherAPI.getStudentDetails(studentId),
  getStudentGrades: (studentId) => teacherAPI.getStudentGrades(studentId),
  getStudentAttendance: (studentId) => teacherAPI.getStudentAttendance(studentId),
  getStudentAssignments: (studentId) => teacherAPI.getStudentAssignments(studentId),
  
  // Grade Management (specific methods needed by T_Grades.jsx)
  getGrades: () => teacherAPI.getGrades ? teacherAPI.getGrades() : 
    teacherAPI.getStudentGrades ? teacherAPI.getStudentGrades() : 
    Promise.resolve({ data: [] }), // Fallback if not implemented
  createGrade: (data) => teacherAPI.createGrade ? teacherAPI.createGrade(data) :
    teacherAPI.gradeAssignment ? teacherAPI.gradeAssignment(data.assignmentId, data.studentId, data) :
    Promise.reject(new Error('Grade creation not implemented')),
  updateGrade: (gradeId, data) => teacherAPI.updateGrade ? teacherAPI.updateGrade(gradeId, data) :
    teacherAPI.gradeAssignment ? teacherAPI.gradeAssignment(data.assignmentId, data.studentId, data) :
    Promise.reject(new Error('Grade update not implemented')),
  deleteGrade: (gradeId) => teacherAPI.deleteGrade ? teacherAPI.deleteGrade(gradeId) :
    Promise.reject(new Error('Grade deletion not implemented')),
  
  // Attendance Management (specific methods needed by T_Attendance.jsx)
  getAttendance: () => teacherAPI.getAttendance ? teacherAPI.getAttendance() :
    teacherAPI.getClassAttendance ? teacherAPI.getClassAttendance() :
    Promise.resolve({ data: [] }), // Fallback if not implemented
  createAttendance: (data) => teacherAPI.createAttendance ? teacherAPI.createAttendance(data) :
    teacherAPI.markAttendance ? teacherAPI.markAttendance(data.classId, data) :
    Promise.reject(new Error('Attendance creation not implemented')),
  updateAttendance: (attendanceId, data) => teacherAPI.updateAttendance ? teacherAPI.updateAttendance(attendanceId, data) :
    teacherAPI.markAttendance ? teacherAPI.markAttendance(data.classId, data) :
    Promise.reject(new Error('Attendance update not implemented')),
  deleteAttendance: (attendanceId) => teacherAPI.deleteAttendance ? teacherAPI.deleteAttendance(attendanceId) :
    Promise.reject(new Error('Attendance deletion not implemented')),
  
  // Communication Management (specific methods needed by T_Communication.jsx)
  getAnnouncements: () => teacherAPI.getAnnouncements ? teacherAPI.getAnnouncements() :
    Promise.resolve({ data: [] }), // Fallback if not implemented
  getMessages: () => teacherAPI.getMessages(),
  createAnnouncement: (data) => teacherAPI.createAnnouncement ? teacherAPI.createAnnouncement(data) :
    Promise.reject(new Error('Announcement creation not implemented')),
  updateAnnouncement: (announcementId, data) => teacherAPI.updateAnnouncement ? teacherAPI.updateAnnouncement(announcementId, data) :
    Promise.reject(new Error('Announcement update not implemented')),
  deleteAnnouncement: (announcementId) => teacherAPI.deleteAnnouncement ? teacherAPI.deleteAnnouncement(announcementId) :
    Promise.reject(new Error('Announcement deletion not implemented')),
  createMessage: (data) => teacherAPI.sendMessage(data),
  updateMessage: (messageId, data) => teacherAPI.updateMessage ? teacherAPI.updateMessage(messageId, data) :
    Promise.reject(new Error('Message update not implemented')),
  deleteMessage: (messageId) => teacherAPI.deleteMessage ? teacherAPI.deleteMessage(messageId) :
    Promise.reject(new Error('Message deletion not implemented')),
  
  // Profile Management
  getProfile: () => teacherAPI.getProfile(),
  updateProfile: (data) => teacherAPI.updateProfile(data),
  updatePassword: (data) => teacherAPI.updatePassword(data),
  uploadProfileImage: (formData) => teacherAPI.uploadProfileImage(formData),
  
  // Notifications
  getNotifications: () => teacherAPI.getNotifications(),
  
  // Reports
  generateClassReport: (classId, params) => teacherAPI.generateClassReport(classId, params),
  generateStudentReport: (studentId, params) => teacherAPI.generateStudentReport(studentId, params),
  generateAttendanceReport: (params) => teacherAPI.generateAttendanceReport(params),
  generateGradeReport: (params) => teacherAPI.generateGradeReport(params),
};

export default teacherService; 