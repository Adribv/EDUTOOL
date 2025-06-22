import { studentAPI } from './api';

const studentService = {
  // Auth
  login: studentAPI.studentLogin,
  register: (data) => studentAPI.register(data), // Assuming a common register endpoint
  
  // Profile
  getProfile: studentAPI.getProfile,
  updateProfile: studentAPI.updateProfile,
  
  // Academic Dashboard
  getTimetable: studentAPI.getTimetable,
  getSubjectsAndTeachers: studentAPI.getSubjects,
  getAssignments: studentAPI.getAssignments,
  submitAssignment: studentAPI.submitAssignment,
  getSubmissionFeedback: studentAPI.getSubmissionFeedback,
  
  // Attendance
  getAttendanceRecords: studentAPI.getAttendance,
  submitLeaveRequest: studentAPI.submitLeaveRequest,
  getLeaveRequests: studentAPI.getLeaveRequests,
  
  // Examinations
  getUpcomingExams: studentAPI.getExams,
  getAdmitCard: studentAPI.getAdmitCard,
  getExamResults: studentAPI.getExamResults,
  getReportCards: studentAPI.getReportCards,
  getPerformanceAnalytics: studentAPI.getPerformanceAnalytics,
  
  // Fee Management
  getFeeStructure: studentAPI.getFeeStructure,
  getPaymentStatus: studentAPI.getFees,
  getPaymentReceipt: studentAPI.getPaymentReceipt,
  
  // Learning Resources
  getLearningResources: studentAPI.getResources,
  getResourceDetails: studentAPI.getResourceDetails,
  
  // Communication
  getAnnouncements: studentAPI.getAnnouncements,
  getMessages: studentAPI.getMessages,
  getMessageDetails: studentAPI.getMessageDetails,
  sendMessageReply: studentAPI.sendMessageReply,
  getClassDiscussions: studentAPI.getClassDiscussions,
  getDiscussionDetails: studentAPI.getDiscussionDetails,
  postDiscussionComment: studentAPI.postDiscussionComment,
  
  // Homework
  getHomework: studentAPI.getHomework,
  getHomeworkDetails: studentAPI.getHomeworkDetails,
  submitHomework: studentAPI.submitHomework,
  getHomeworkSubmissions: studentAPI.getHomeworkSubmissions,
};

export default studentService; 