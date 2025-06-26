// Comprehensive sample data for Teacher Dashboard
// This provides realistic data for all teacher features

export const teacherSampleData = {
  // Teacher Profile
  profile: {
    id: "TCH001",
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@school.edu",
    phone: "+1 (555) 123-4567",
    department: "Mathematics",
    designation: "Senior Mathematics Teacher",
    qualification: "Ph.D. in Mathematics Education",
    experience: "8 years",
    subjects: ["Mathematics", "Advanced Calculus", "Statistics"],
    bio: "Passionate mathematics educator with expertise in making complex concepts accessible to students. Committed to fostering critical thinking and problem-solving skills.",
    profilePicture: null,
    address: "123 Education Street, Learning City, LC 12345",
    emergencyContact: {
      name: "John Wilson",
      relationship: "Spouse",
      phone: "+1 (555) 987-6543"
    },
    professionalDevelopment: [
      {
        id: 1,
        title: "Advanced Teaching Methodologies",
        institution: "National Education Institute",
        date: "2023-06-15",
        duration: "2 weeks",
        certificate: "certificate1.pdf"
      },
      {
        id: 2,
        title: "Digital Learning Tools Workshop",
        institution: "Tech Education Center",
        date: "2023-03-20",
        duration: "3 days",
        certificate: "certificate2.pdf"
      }
    ]
  },

  // Dashboard Statistics
  dashboardStats: {
    totalClasses: 6,
    totalStudents: 180,
    upcomingClasses: 3,
    pendingAssignments: 12,
    recentAnnouncements: [
      {
        id: 1,
        title: "Parent-Teacher Conference",
        content: "Parent-teacher conferences will be held on January 25th from 3:00 PM to 7:00 PM.",
        date: "2024-01-10",
        type: "event",
        priority: "high"
      },
      {
        id: 2,
        title: "Mathematics Competition",
        content: "Annual mathematics competition registration is now open. Deadline: January 30th.",
        date: "2024-01-08",
        type: "academic",
        priority: "medium"
      }
    ],
    upcomingEvents: [
      {
        id: 1,
        title: "Department Meeting",
        date: "2024-01-15",
        time: "2:00 PM",
        location: "Conference Room A"
      },
      {
        id: 2,
        title: "Staff Development Workshop",
        date: "2024-01-18",
        time: "9:00 AM",
        location: "Auditorium"
      }
    ],
    performanceMetrics: {
      averageAttendance: 94.2,
      averageGrade: 87.5,
      assignmentsCompleted: 85,
      studentSatisfaction: 4.2
    }
  },

  // Classes
  classes: [
    {
      id: 1,
      name: "10th Grade Mathematics A",
      subject: "Mathematics",
      section: "A",
      grade: "10",
      room: "Room 101",
      schedule: "Monday, Wednesday, Friday - 9:00 AM",
      totalStudents: 30,
      averageGrade: 88.5,
      attendanceRate: 95.2
    },
    {
      id: 2,
      name: "10th Grade Mathematics B",
      subject: "Mathematics",
      section: "B",
      grade: "10",
      room: "Room 102",
      schedule: "Monday, Wednesday, Friday - 10:30 AM",
      totalStudents: 28,
      averageGrade: 86.3,
      attendanceRate: 93.8
    },
    {
      id: 3,
      name: "11th Grade Advanced Calculus",
      subject: "Advanced Calculus",
      section: "A",
      grade: "11",
      room: "Room 201",
      schedule: "Tuesday, Thursday - 9:00 AM",
      totalStudents: 25,
      averageGrade: 89.1,
      attendanceRate: 96.5
    },
    {
      id: 4,
      name: "12th Grade Statistics",
      subject: "Statistics",
      section: "A",
      grade: "12",
      room: "Room 202",
      schedule: "Tuesday, Thursday - 10:30 AM",
      totalStudents: 22,
      averageGrade: 85.7,
      attendanceRate: 92.1
    },
    {
      id: 5,
      name: "9th Grade Mathematics A",
      subject: "Mathematics",
      section: "A",
      grade: "9",
      room: "Room 103",
      schedule: "Monday, Wednesday, Friday - 2:00 PM",
      totalStudents: 32,
      averageGrade: 84.2,
      attendanceRate: 91.8
    },
    {
      id: 6,
      name: "9th Grade Mathematics B",
      subject: "Mathematics",
      section: "B",
      grade: "9",
      room: "Room 104",
      schedule: "Monday, Wednesday, Friday - 3:30 PM",
      totalStudents: 30,
      averageGrade: 83.9,
      attendanceRate: 90.5
    }
  ],

  // Students
  students: [
    {
      id: 1,
      name: "Alex Johnson",
      studentId: "STU2024001",
      class: "10th Grade Mathematics A",
      email: "alex.johnson@school.edu",
      phone: "+1 (555) 111-1111",
      averageGrade: 92.5,
      attendanceRate: 96.8,
      status: "Active"
    },
    {
      id: 2,
      name: "Emily Davis",
      studentId: "STU2024002",
      class: "10th Grade Mathematics A",
      email: "emily.davis@school.edu",
      phone: "+1 (555) 111-1112",
      averageGrade: 89.3,
      attendanceRate: 94.2,
      status: "Active"
    },
    {
      id: 3,
      name: "Michael Chen",
      studentId: "STU2024003",
      class: "10th Grade Mathematics B",
      email: "michael.chen@school.edu",
      phone: "+1 (555) 111-1113",
      averageGrade: 87.8,
      attendanceRate: 91.5,
      status: "Active"
    },
    {
      id: 4,
      name: "Sarah Rodriguez",
      studentId: "STU2024004",
      class: "11th Grade Advanced Calculus",
      email: "sarah.rodriguez@school.edu",
      phone: "+1 (555) 111-1114",
      averageGrade: 94.1,
      attendanceRate: 98.2,
      status: "Active"
    },
    {
      id: 5,
      name: "David Wilson",
      studentId: "STU2024005",
      class: "12th Grade Statistics",
      email: "david.wilson@school.edu",
      phone: "+1 (555) 111-1115",
      averageGrade: 88.9,
      attendanceRate: 93.7,
      status: "Active"
    }
  ],

  // Assignments
  assignments: [
    {
      id: 1,
      title: "Algebra Problem Set",
      subject: "Mathematics",
      class: "10th Grade Mathematics A",
      description: "Complete problems 1-20 in Chapter 5. Show all work and submit as PDF.",
      dueDate: "2024-01-15",
      totalStudents: 30,
      submittedCount: 28,
      gradedCount: 25,
      averageGrade: 87.5,
      status: "active"
    },
    {
      id: 2,
      title: "Calculus Derivatives",
      subject: "Advanced Calculus",
      class: "11th Grade Advanced Calculus",
      description: "Solve derivative problems from Chapter 3. Include step-by-step solutions.",
      dueDate: "2024-01-20",
      totalStudents: 25,
      submittedCount: 23,
      gradedCount: 20,
      averageGrade: 89.2,
      status: "active"
    },
    {
      id: 3,
      title: "Statistics Project",
      subject: "Statistics",
      class: "12th Grade Statistics",
      description: "Conduct a statistical analysis project. Choose your own topic and dataset.",
      dueDate: "2024-01-25",
      totalStudents: 22,
      submittedCount: 18,
      gradedCount: 15,
      averageGrade: 85.8,
      status: "active"
    },
    {
      id: 4,
      title: "Geometry Quiz",
      subject: "Mathematics",
      class: "9th Grade Mathematics A",
      description: "Online quiz covering geometric concepts from Chapter 4.",
      dueDate: "2024-01-18",
      totalStudents: 32,
      submittedCount: 30,
      gradedCount: 28,
      averageGrade: 82.3,
      status: "completed"
    }
  ],

  // Assignment Submissions
  assignmentSubmissions: [
    {
      id: 1,
      assignmentId: 1,
      studentId: 1,
      studentName: "Alex Johnson",
      submittedAt: "2024-01-14T10:30:00Z",
      file: "algebra_problem_set_alex.pdf",
      grade: 92,
      feedback: "Excellent work! Clear solutions and good mathematical reasoning.",
      status: "graded"
    },
    {
      id: 2,
      assignmentId: 1,
      studentId: 2,
      studentName: "Emily Davis",
      submittedAt: "2024-01-14T14:15:00Z",
      file: "algebra_problem_set_emily.pdf",
      grade: 88,
      feedback: "Good work overall. Minor errors in problem 15.",
      status: "graded"
    },
    {
      id: 3,
      assignmentId: 2,
      studentId: 4,
      studentName: "Sarah Rodriguez",
      submittedAt: "2024-01-19T09:45:00Z",
      file: "calculus_derivatives_sarah.pdf",
      grade: 95,
      feedback: "Outstanding work! Excellent understanding of derivative concepts.",
      status: "graded"
    }
  ],

  // Exams
  exams: [
    {
      id: 1,
      title: "Midterm Examination",
      subject: "Mathematics",
      class: "10th Grade Mathematics A",
      date: "2024-01-30",
      duration: "90 minutes",
      totalStudents: 30,
      averageScore: 84.5,
      highestScore: 98,
      lowestScore: 65,
      status: "scheduled"
    },
    {
      id: 2,
      title: "Calculus Final",
      subject: "Advanced Calculus",
      class: "11th Grade Advanced Calculus",
      date: "2024-02-15",
      duration: "120 minutes",
      totalStudents: 25,
      averageScore: null,
      highestScore: null,
      lowestScore: null,
      status: "scheduled"
    },
    {
      id: 3,
      title: "Statistics Quiz",
      subject: "Statistics",
      class: "12th Grade Statistics",
      date: "2024-01-22",
      duration: "45 minutes",
      totalStudents: 22,
      averageScore: 87.2,
      highestScore: 100,
      lowestScore: 72,
      status: "completed"
    }
  ],

  // Exam Results
  examResults: [
    {
      id: 1,
      examId: 1,
      studentId: 1,
      studentName: "Alex Johnson",
      score: 95,
      grade: "A",
      feedback: "Excellent performance across all sections.",
      status: "graded"
    },
    {
      id: 2,
      examId: 1,
      studentId: 2,
      studentName: "Emily Davis",
      score: 88,
      grade: "B+",
      feedback: "Good work, needs improvement in problem-solving section.",
      status: "graded"
    },
    {
      id: 3,
      examId: 3,
      studentId: 5,
      studentName: "David Wilson",
      score: 92,
      grade: "A-",
      feedback: "Strong performance in statistical analysis.",
      status: "graded"
    }
  ],

  // Attendance
  attendance: [
    {
      id: 1,
      classId: 1,
      className: "10th Grade Mathematics A",
      date: "2024-01-15",
      totalStudents: 30,
      presentCount: 28,
      absentCount: 2,
      attendanceRate: 93.3
    },
    {
      id: 2,
      classId: 2,
      className: "10th Grade Mathematics B",
      date: "2024-01-15",
      totalStudents: 28,
      presentCount: 26,
      absentCount: 2,
      attendanceRate: 92.9
    },
    {
      id: 3,
      classId: 3,
      className: "11th Grade Advanced Calculus",
      date: "2024-01-16",
      totalStudents: 25,
      presentCount: 24,
      absentCount: 1,
      attendanceRate: 96.0
    }
  ],

  // Student Attendance Details
  studentAttendance: [
    {
      id: 1,
      studentId: 1,
      studentName: "Alex Johnson",
      classId: 1,
      date: "2024-01-15",
      status: "present",
      reason: null
    },
    {
      id: 2,
      studentId: 2,
      studentName: "Emily Davis",
      classId: 1,
      date: "2024-01-15",
      status: "present",
      reason: null
    },
    {
      id: 3,
      studentId: 3,
      studentName: "Michael Chen",
      classId: 2,
      date: "2024-01-15",
      status: "absent",
      reason: "Medical appointment"
    }
  ],

  // Grades
  grades: [
    {
      id: 1,
      studentId: 1,
      studentName: "Alex Johnson",
      classId: 1,
      className: "10th Grade Mathematics A",
      assignmentId: 1,
      assignmentTitle: "Algebra Problem Set",
      grade: 92,
      maxGrade: 100,
      percentage: 92,
      feedback: "Excellent work!",
      date: "2024-01-14"
    },
    {
      id: 2,
      studentId: 2,
      studentName: "Emily Davis",
      classId: 1,
      className: "10th Grade Mathematics A",
      assignmentId: 1,
      assignmentTitle: "Algebra Problem Set",
      grade: 88,
      maxGrade: 100,
      percentage: 88,
      feedback: "Good work overall.",
      date: "2024-01-14"
    },
    {
      id: 3,
      studentId: 4,
      studentName: "Sarah Rodriguez",
      classId: 3,
      className: "11th Grade Advanced Calculus",
      assignmentId: 2,
      assignmentTitle: "Calculus Derivatives",
      grade: 95,
      maxGrade: 100,
      percentage: 95,
      feedback: "Outstanding work!",
      date: "2024-01-19"
    }
  ],

  // Timetable
  timetable: [
    {
      id: 1,
      day: "Monday",
      time: "9:00 AM - 10:30 AM",
      class: "10th Grade Mathematics A",
      room: "Room 101",
      subject: "Mathematics"
    },
    {
      id: 2,
      day: "Monday",
      time: "10:30 AM - 12:00 PM",
      class: "10th Grade Mathematics B",
      room: "Room 102",
      subject: "Mathematics"
    },
    {
      id: 3,
      day: "Monday",
      time: "2:00 PM - 3:30 PM",
      class: "9th Grade Mathematics A",
      room: "Room 103",
      subject: "Mathematics"
    },
    {
      id: 4,
      day: "Tuesday",
      time: "9:00 AM - 10:30 AM",
      class: "11th Grade Advanced Calculus",
      room: "Room 201",
      subject: "Advanced Calculus"
    },
    {
      id: 5,
      day: "Tuesday",
      time: "10:30 AM - 12:00 PM",
      class: "12th Grade Statistics",
      room: "Room 202",
      subject: "Statistics"
    },
    {
      id: 6,
      day: "Wednesday",
      time: "9:00 AM - 10:30 AM",
      class: "10th Grade Mathematics A",
      room: "Room 101",
      subject: "Mathematics"
    },
    {
      id: 7,
      day: "Wednesday",
      time: "10:30 AM - 12:00 PM",
      class: "10th Grade Mathematics B",
      room: "Room 102",
      subject: "Mathematics"
    },
    {
      id: 8,
      day: "Wednesday",
      time: "2:00 PM - 3:30 PM",
      class: "9th Grade Mathematics A",
      room: "Room 103",
      subject: "Mathematics"
    },
    {
      id: 9,
      day: "Thursday",
      time: "9:00 AM - 10:30 AM",
      class: "11th Grade Advanced Calculus",
      room: "Room 201",
      subject: "Advanced Calculus"
    },
    {
      id: 10,
      day: "Thursday",
      time: "10:30 AM - 12:00 PM",
      class: "12th Grade Statistics",
      room: "Room 202",
      subject: "Statistics"
    },
    {
      id: 11,
      day: "Friday",
      time: "9:00 AM - 10:30 AM",
      class: "10th Grade Mathematics A",
      room: "Room 101",
      subject: "Mathematics"
    },
    {
      id: 12,
      day: "Friday",
      time: "10:30 AM - 12:00 PM",
      class: "10th Grade Mathematics B",
      room: "Room 102",
      subject: "Mathematics"
    },
    {
      id: 13,
      day: "Friday",
      time: "2:00 PM - 3:30 PM",
      class: "9th Grade Mathematics A",
      room: "Room 103",
      subject: "Mathematics"
    }
  ],

  // Learning Resources
  resources: [
    {
      id: 1,
      title: "Algebra Fundamentals",
      description: "Comprehensive guide to algebraic concepts",
      type: "PDF",
      subject: "Mathematics",
      class: "10th Grade Mathematics A",
      uploadDate: "2024-01-10",
      fileSize: "2.5 MB",
      downloads: 45
    },
    {
      id: 2,
      title: "Calculus Practice Problems",
      description: "Collection of practice problems for calculus students",
      type: "PDF",
      subject: "Advanced Calculus",
      class: "11th Grade Advanced Calculus",
      uploadDate: "2024-01-08",
      fileSize: "1.8 MB",
      downloads: 32
    },
    {
      id: 3,
      title: "Statistics Formulas Sheet",
      description: "Quick reference for statistical formulas",
      type: "PDF",
      subject: "Statistics",
      class: "12th Grade Statistics",
      uploadDate: "2024-01-05",
      fileSize: "0.8 MB",
      downloads: 28
    },
    {
      id: 4,
      title: "Geometry Interactive Module",
      description: "Interactive learning module for geometric concepts",
      type: "Interactive",
      subject: "Mathematics",
      class: "9th Grade Mathematics A",
      uploadDate: "2024-01-12",
      fileSize: "15.2 MB",
      downloads: 38
    }
  ],

  // Lesson Plans
  lessonPlans: [
    {
      id: 1,
      title: "Introduction to Quadratic Equations",
      subject: "Mathematics",
      class: "10th Grade Mathematics A",
      objectives: "Students will understand quadratic equations and solve them using various methods",
      activities: "Lecture, group work, practice problems",
      materials: "Whiteboard, calculators, worksheets",
      date: "2024-01-15",
      status: "approved"
    },
    {
      id: 2,
      title: "Derivatives and Applications",
      subject: "Advanced Calculus",
      class: "11th Grade Advanced Calculus",
      objectives: "Students will learn derivative rules and their applications",
      activities: "Interactive demonstration, problem-solving, real-world examples",
      materials: "Graphing software, calculators, real-world data",
      date: "2024-01-16",
      status: "pending"
    },
    {
      id: 3,
      title: "Statistical Analysis Project",
      subject: "Statistics",
      class: "12th Grade Statistics",
      objectives: "Students will conduct statistical analysis on real datasets",
      activities: "Data collection, analysis, presentation",
      materials: "Statistical software, datasets, presentation tools",
      date: "2024-01-17",
      status: "approved"
    }
  ],

  // Communication
  announcements: [
    {
      id: 1,
      title: "Mathematics Competition Registration",
      content: "Annual mathematics competition registration is now open. All interested students should register by January 30th.",
      date: "2024-01-10",
      type: "academic",
      priority: "medium",
      audience: "All Mathematics Students"
    },
    {
      id: 2,
      title: "Extra Help Sessions",
      content: "Extra help sessions will be available every Tuesday and Thursday after school in Room 101.",
      date: "2024-01-08",
      type: "academic",
      priority: "low",
      audience: "All Students"
    },
    {
      id: 3,
      title: "Exam Schedule Update",
      content: "The midterm examination schedule has been updated. Please check the new dates.",
      date: "2024-01-05",
      type: "academic",
      priority: "high",
      audience: "10th Grade Students"
    }
  ],

  // Messages
  messages: [
    {
      id: 1,
      from: "Principal's Office",
      to: "All Teachers",
      subject: "Staff Meeting Reminder",
      content: "Reminder: Staff meeting tomorrow at 2:00 PM in the auditorium.",
      date: "2024-01-14",
      status: "unread"
    },
    {
      id: 2,
      from: "Department Head",
      to: "Mathematics Teachers",
      subject: "Curriculum Update",
      content: "Please review the updated curriculum guidelines for the new semester.",
      date: "2024-01-12",
      status: "read"
    },
    {
      id: 3,
      from: "Sarah Wilson",
      to: "Parent of Alex Johnson",
      subject: "Student Progress Update",
      content: "Alex is doing excellent work in mathematics. His problem-solving skills have improved significantly.",
      date: "2024-01-10",
      status: "sent"
    }
  ],

  // Projects
  projects: [
    {
      id: 1,
      title: "Mathematics in Real Life",
      description: "Students will research and present how mathematics is used in various real-world applications",
      class: "10th Grade Mathematics A",
      startDate: "2024-01-20",
      endDate: "2024-02-20",
      status: "active",
      totalStudents: 30,
      completedCount: 0
    },
    {
      id: 2,
      title: "Statistical Analysis of School Data",
      description: "Students will analyze school performance data using statistical methods",
      class: "12th Grade Statistics",
      startDate: "2024-01-25",
      endDate: "2024-03-01",
      status: "planned",
      totalStudents: 22,
      completedCount: 0
    }
  ],

  // Parent Communications
  parentCommunications: [
    {
      id: 1,
      parentName: "Mrs. Johnson",
      studentName: "Alex Johnson",
      date: "2024-01-15",
      type: "Email",
      subject: "Student Progress",
      content: "Alex is performing excellently in mathematics. His analytical skills are outstanding.",
      status: "sent"
    },
    {
      id: 2,
      parentName: "Mr. Davis",
      studentName: "Emily Davis",
      date: "2024-01-12",
      type: "Phone Call",
      subject: "Attendance Concern",
      content: "Discussed Emily's recent absences and provided support strategies.",
      status: "completed"
    }
  ],

  // Feedback
  feedback: [
    {
      id: 1,
      type: "Curriculum Feedback",
      title: "Advanced Calculus Course Structure",
      content: "The course structure is well-organized and challenging. Consider adding more real-world applications.",
      date: "2024-01-10",
      status: "submitted"
    },
    {
      id: 2,
      type: "Resource Request",
      title: "Additional Graphing Calculators",
      content: "Request for additional graphing calculators for the advanced calculus class.",
      date: "2024-01-08",
      status: "pending"
    }
  ],

  // Notifications
  notifications: [
    {
      id: 1,
      title: "New Assignment Submission",
      content: "Alex Johnson submitted Algebra Problem Set",
      date: "2024-01-14T10:30:00Z",
      type: "assignment",
      read: false
    },
    {
      id: 2,
      title: "Staff Meeting Reminder",
      content: "Staff meeting tomorrow at 2:00 PM",
      date: "2024-01-14T09:00:00Z",
      type: "meeting",
      read: true
    },
    {
      id: 3,
      title: "Lesson Plan Approved",
      content: "Your lesson plan 'Introduction to Quadratic Equations' has been approved",
      date: "2024-01-13T14:30:00Z",
      type: "approval",
      read: false
    }
  ]
};

// Helper functions to get specific data
export const getTeacherData = (dataType, filters = {}) => {
  switch (dataType) {
    case 'profile':
      return teacherSampleData.profile;
    case 'dashboard':
      return teacherSampleData.dashboardStats;
    case 'classes':
      return teacherSampleData.classes;
    case 'students':
      return teacherSampleData.students;
    case 'assignments':
      return teacherSampleData.assignments;
    case 'assignmentSubmissions':
      return teacherSampleData.assignmentSubmissions;
    case 'exams':
      return teacherSampleData.exams;
    case 'examResults':
      return teacherSampleData.examResults;
    case 'attendance':
      return teacherSampleData.attendance;
    case 'studentAttendance':
      return teacherSampleData.studentAttendance;
    case 'grades':
      return teacherSampleData.grades;
    case 'timetable':
      return teacherSampleData.timetable;
    case 'resources':
      return teacherSampleData.resources;
    case 'lessonPlans':
      return teacherSampleData.lessonPlans;
    case 'announcements':
      return teacherSampleData.announcements;
    case 'messages':
      return teacherSampleData.messages;
    case 'projects':
      return teacherSampleData.projects;
    case 'parentCommunications':
      return teacherSampleData.parentCommunications;
    case 'feedback':
      return teacherSampleData.feedback;
    case 'notifications':
      return teacherSampleData.notifications;
    default:
      return null;
  }
};

// Simulate API delay
export const simulateApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Create mock API response
export const createMockResponse = (data) => ({
  data,
  status: 200,
  message: 'Success'
}); 