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
  
  // Documents
  getDocuments: studentAPI.getDocuments,
};

// ----- Additional helper methods to prevent runtime errors on student pages -----
// These alias existing endpoints or return minimal placeholder data so that
// pages that reference them (e.g. Transport, Calendar) don't break if the
// backend feature isn't implemented yet.

// Generic empty success response helper
const emptySuccess = (data = {}) => Promise.resolve({ data });

// Attendance alias (some pages call getAttendance instead of getAttendanceRecords)
studentService.getAttendance = studentAPI.getAttendance;

// Grades alias (maps to exam results)
studentService.getGrades = studentAPI.getExamResults;

// Dashboard stats alias (maps to performance analytics)
studentService.getDashboardStats = studentAPI.getPerformanceAnalytics;

// Classes alias (maps to timetable)
studentService.getClasses = studentAPI.getTimetable;

// Transport related helpers (placeholder until backend routes are ready)
studentService.getTransportDetails = () =>
  emptySuccess({
    busNumber: 'N/A',
    pickupPoint: 'N/A',
    pickupTime: 'N/A',
    driverName: 'N/A',
    driverContact: 'N/A',
    emergencyContact: 'N/A',
  });
studentService.getRouteDetails = () => emptySuccess({ stops: [] });
studentService.updateTransportDetails = () => emptySuccess();

// Learning modules / progress placeholders
studentService.getLearningModules = studentAPI.getResources;
studentService.getLearningProgress = studentAPI.getPerformanceAnalytics;

// Forum posts alias (class discussions)
studentService.getForumPosts = studentAPI.getClassDiscussions;

// Notifications & Ongoing lessons helpers
studentService.getNotifications = studentAPI.getAnnouncements;
studentService.getOngoingLessons = studentAPI.getTimetable;

// Calendar events placeholder (could map to timetable or academic calendar if available)
studentService.getCalendarEvents = () => emptySuccess([]);

export default studentService; 