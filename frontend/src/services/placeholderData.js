// Comprehensive placeholder data for the entire application
// This ensures the app is viewable and accessible even without backend data

export const placeholderData = {
  // Student Profile Data
  studentProfile: {
    name: "Alex Johnson",
    studentId: "STU2024001",
    rollNumber: "RN001",
    class: "10th Grade",
    section: "A",
    email: "alex.johnson@school.edu",
    phone: "+1 (555) 123-4567",
    address: "123 Education Street, Learning City, LC 12345",
    dateOfBirth: "2008-03-15",
    gender: "Male",
    bloodGroup: "O+",
    emergencyContact: {
      name: "Sarah Johnson",
      relationship: "Mother",
      phone: "+1 (555) 987-6543",
      email: "sarah.johnson@email.com"
    },
    profilePicture: null,
    admissionDate: "2020-06-01",
    currentStatus: "Active",
    averageGrade: 87.5,
    attendanceRate: 94.2
  },

  // Subjects and Teachers
  subjects: [
    {
      id: 1,
      name: "Mathematics",
      teacher: "Dr. Sarah Wilson",
      teacherEmail: "sarah.wilson@school.edu",
      room: "Room 101",
      schedule: "Monday, Wednesday, Friday - 9:00 AM",
      grade: 92,
      progress: 75
    },
    {
      id: 2,
      name: "English Literature",
      teacher: "Ms. Emily Davis",
      teacherEmail: "emily.davis@school.edu",
      room: "Room 205",
      schedule: "Tuesday, Thursday - 10:30 AM",
      grade: 88,
      progress: 60
    },
    {
      id: 3,
      name: "Physics",
      teacher: "Mr. Robert Chen",
      teacherEmail: "robert.chen@school.edu",
      room: "Lab 301",
      schedule: "Monday, Wednesday - 2:00 PM",
      grade: 85,
      progress: 45
    },
    {
      id: 4,
      name: "History",
      teacher: "Dr. Maria Rodriguez",
      teacherEmail: "maria.rodriguez@school.edu",
      room: "Room 110",
      schedule: "Tuesday, Friday - 11:45 AM",
      grade: 90,
      progress: 80
    },
    {
      id: 5,
      name: "Biology",
      teacher: "Ms. Jennifer Lee",
      teacherEmail: "jennifer.lee@school.edu",
      room: "Lab 302",
      schedule: "Thursday - 1:15 PM",
      grade: 87,
      progress: 55
    }
  ],

  // Assignments
  assignments: [
    {
      id: 1,
      title: "Algebra Problem Set",
      subject: "Mathematics",
      teacher: "Dr. Sarah Wilson",
      description: "Complete problems 1-20 in Chapter 5. Show all work and submit as PDF.",
      dueDate: "2024-01-15",
      status: "pending",
      priority: "high",
      type: "assignment",
      grade: null,
      submissionDate: null,
      feedback: null
    },
    {
      id: 2,
      title: "Essay on Shakespeare",
      subject: "English Literature",
      teacher: "Ms. Emily Davis",
      description: "Write a 1000-word essay analyzing the themes in Hamlet. Include proper citations.",
      dueDate: "2024-01-20",
      status: "submitted",
      priority: "medium",
      type: "assignment",
      grade: 88,
      submissionDate: "2024-01-18",
      feedback: "Excellent analysis of themes. Consider exploring character development more deeply."
    },
    {
      id: 3,
      title: "Physics Lab Report",
      subject: "Physics",
      teacher: "Mr. Robert Chen",
      description: "Complete lab report for the pendulum experiment. Include graphs and calculations.",
      dueDate: "2024-01-25",
      status: "pending",
      priority: "high",
      type: "assignment",
      grade: null,
      submissionDate: null,
      feedback: null
    },
    {
      id: 4,
      title: "History Research Paper",
      subject: "History",
      teacher: "Dr. Maria Rodriguez",
      description: "Research paper on the Industrial Revolution. 1500 words minimum with bibliography.",
      dueDate: "2024-02-01",
      status: "pending",
      priority: "medium",
      type: "assignment",
      grade: null,
      submissionDate: null,
      feedback: null
    }
  ],

  // Homework
  homework: [
    {
      id: 1,
      title: "Math Practice Problems",
      subject: "Mathematics",
      description: "Complete exercises 1-15 in workbook",
      dueDate: "2024-01-16",
      status: "pending",
      priority: "medium"
    },
    {
      id: 2,
      title: "Reading Assignment",
      subject: "English Literature",
      description: "Read Chapters 5-7 of To Kill a Mockingbird",
      dueDate: "2024-01-17",
      status: "completed",
      priority: "low"
    },
    {
      id: 3,
      title: "Science Worksheet",
      subject: "Biology",
      description: "Complete the cell structure worksheet",
      dueDate: "2024-01-18",
      status: "pending",
      priority: "medium"
    }
  ],

  // Announcements
  announcements: [
    {
      id: 1,
      title: "Parent-Teacher Conference",
      content: "Parent-teacher conferences will be held on January 25th from 3:00 PM to 7:00 PM. Please schedule your appointment through the portal.",
      date: "2024-01-10",
      type: "event",
      priority: "high",
      author: "Principal's Office"
    },
    {
      id: 2,
      title: "Science Fair Registration",
      content: "Registration for the annual science fair is now open. Projects are due by February 15th. See your science teacher for details.",
      date: "2024-01-08",
      type: "academic",
      priority: "medium",
      author: "Science Department"
    },
    {
      id: 3,
      title: "Library Hours Extended",
      content: "The school library will now be open until 6:00 PM on weekdays to accommodate students working on projects and assignments.",
      date: "2024-01-05",
      type: "general",
      priority: "low",
      author: "Library Staff"
    },
    {
      id: 4,
      title: "Sports Team Tryouts",
      content: "Tryouts for spring sports teams will begin next week. Basketball, soccer, and track teams are looking for new members.",
      date: "2024-01-03",
      type: "sports",
      priority: "medium",
      author: "Athletics Department"
    }
  ],

  // Messages
  messages: [
    {
      id: 1,
      from: "Dr. Sarah Wilson",
      subject: "Math Assignment Clarification",
      content: "Hi Alex, I wanted to clarify the requirements for the algebra problem set. Please make sure to show all your work clearly.",
      date: "2024-01-12",
      read: false,
      priority: "medium"
    },
    {
      id: 2,
      from: "Ms. Emily Davis",
      subject: "Great work on your essay!",
      content: "Alex, I was very impressed with your analysis of Hamlet. Your insights into the themes were excellent. Keep up the great work!",
      date: "2024-01-10",
      read: true,
      priority: "low"
    },
    {
      id: 3,
      from: "Mr. Robert Chen",
      subject: "Physics Lab Reminder",
      content: "Don't forget to bring your lab notebook and calculator for tomorrow's physics lab session.",
      date: "2024-01-09",
      read: false,
      priority: "high"
    }
  ],

  // Upcoming Exams
  upcomingExams: [
    {
      id: 1,
      title: "Midterm Mathematics",
      subject: "Mathematics",
      date: "2024-01-30",
      time: "9:00 AM",
      duration: "2 hours",
      room: "Room 101",
      topics: ["Algebra", "Geometry", "Trigonometry"],
      type: "midterm"
    },
    {
      id: 2,
      title: "English Literature Final",
      subject: "English Literature",
      date: "2024-02-15",
      time: "10:30 AM",
      duration: "3 hours",
      room: "Room 205",
      topics: ["Shakespeare", "Modern Literature", "Essay Writing"],
      type: "final"
    },
    {
      id: 3,
      title: "Physics Quiz",
      subject: "Physics",
      date: "2024-01-22",
      time: "2:00 PM",
      duration: "1 hour",
      room: "Lab 301",
      topics: ["Mechanics", "Energy", "Momentum"],
      type: "quiz"
    }
  ],

  // Attendance Records
  attendance: [
    { date: "2024-01-15", status: "present", time: "8:45 AM" },
    { date: "2024-01-14", status: "present", time: "8:50 AM" },
    { date: "2024-01-13", status: "absent", reason: "Medical appointment" },
    { date: "2024-01-12", status: "present", time: "8:42 AM" },
    { date: "2024-01-11", status: "present", time: "8:48 AM" },
    { date: "2024-01-10", status: "late", time: "9:15 AM", reason: "Traffic delay" },
    { date: "2024-01-09", status: "present", time: "8:45 AM" },
    { date: "2024-01-08", status: "present", time: "8:47 AM" },
    { date: "2024-01-07", status: "present", time: "8:43 AM" },
    { date: "2024-01-06", status: "present", time: "8:46 AM" }
  ],

  // Performance Analytics
  performance: {
    averageGrade: 87.5,
    totalSubjects: 5,
    attendanceRate: 94.2,
    assignmentsCompleted: 12,
    assignmentsPending: 3,
    improvementTrend: "+2.3%",
    subjectPerformance: [
      { subject: "Mathematics", grade: 92, trend: "+5%" },
      { subject: "English Literature", grade: 88, trend: "+3%" },
      { subject: "Physics", grade: 85, trend: "+1%" },
      { subject: "History", grade: 90, trend: "+4%" },
      { subject: "Biology", grade: 87, trend: "+2%" }
    ]
  },

  // Fee Status
  feeStatus: {
    totalAmount: 5000,
    paidAmount: 3500,
    pendingAmount: 1500,
    dueDate: "2024-02-01",
    status: "partial",
    paymentHistory: [
      { date: "2024-01-01", amount: 2000, method: "Online Transfer" },
      { date: "2024-01-15", amount: 1500, method: "Credit Card" }
    ]
  },

  // Learning Resources
  learningResources: [
    {
      id: 1,
      title: "Mathematics Formula Sheet",
      subject: "Mathematics",
      type: "PDF",
      size: "2.5 MB",
      uploadDate: "2024-01-10",
      description: "Comprehensive formula sheet for all mathematics topics"
    },
    {
      id: 2,
      title: "Physics Lab Manual",
      subject: "Physics",
      type: "PDF",
      size: "5.2 MB",
      uploadDate: "2024-01-08",
      description: "Complete lab manual with experiment procedures"
    },
    {
      id: 3,
      title: "English Literature Study Guide",
      subject: "English Literature",
      type: "PDF",
      size: "3.1 MB",
      uploadDate: "2024-01-05",
      description: "Study guide for Shakespeare and modern literature"
    },
    {
      id: 4,
      title: "History Timeline",
      subject: "History",
      type: "Image",
      size: "1.8 MB",
      uploadDate: "2024-01-03",
      description: "Visual timeline of major historical events"
    }
  ],

  // Leave Requests
  leaveRequests: [
    {
      id: 1,
      type: "Medical Leave",
      reason: "Dental appointment",
      startDate: "2024-01-20",
      endDate: "2024-01-20",
      status: "pending",
      submittedDate: "2024-01-15"
    },
    {
      id: 2,
      type: "Personal Leave",
      reason: "Family event",
      startDate: "2024-01-25",
      endDate: "2024-01-26",
      status: "approved",
      submittedDate: "2024-01-10"
    }
  ],

  // Ongoing Lessons
  ongoingLessons: [
    {
      id: 1,
      subject: "Mathematics",
      teacher: "Dr. Sarah Wilson",
      room: "Room 101",
      startTime: "9:00",
      endTime: "10:00",
      status: "ongoing",
      topic: "Chapter 5: Quadratic Equations",
      progress: 65
    },
    {
      id: 2,
      subject: "English Literature",
      teacher: "Ms. Emily Davis",
      room: "Room 205",
      startTime: "10:30",
      endTime: "11:30",
      status: "upcoming",
      topic: "Shakespeare's Hamlet Analysis",
      progress: 0
    },
    {
      id: 3,
      subject: "Physics",
      teacher: "Mr. Robert Chen",
      room: "Lab 301",
      startTime: "2:00",
      endTime: "3:30",
      status: "completed",
      topic: "Pendulum Experiment",
      progress: 100
    }
  ],

  // Notifications
  notifications: [
    {
      id: 1,
      type: "assignment",
      title: "New Assignment Posted",
      message: "Algebra Problem Set due on January 15th",
      date: "2024-01-12",
      read: false,
      priority: "high"
    },
    {
      id: 2,
      type: "exam",
      title: "Exam Reminder",
      message: "Mathematics midterm on January 30th",
      date: "2024-01-11",
      read: false,
      priority: "medium"
    },
    {
      id: 3,
      type: "announcement",
      title: "New Announcement",
      message: "Parent-teacher conference registration open",
      date: "2024-01-10",
      read: true,
      priority: "low"
    }
  ],

  // Staff/Admin Data
  staffProfile: {
    name: "John Smith",
    employeeId: "EMP2024001",
    role: "adminstaff",
    email: "john.smith@school.edu",
    phone: "+1 (555) 234-5678",
    department: "Administration",
    position: "Administrative Staff",
    joiningDate: "2020-01-15",
    address: "456 Staff Avenue, Admin City, AC 67890",
    profilePicture: null,
    status: "Active"
  },

  // Admin Dashboard Stats
  adminStats: {
    totalStaff: 45,
    totalStudents: 850,
    totalFeeCollection: 425000,
    pendingTasks: 12,
    recentActivities: [
      {
        type: "staff",
        description: "New teacher registration: Ms. Jennifer Lee",
        timestamp: "2024-01-15T10:30:00Z"
      },
      {
        type: "student",
        description: "Student enrollment: Alex Johnson (Class 10A)",
        timestamp: "2024-01-14T14:20:00Z"
      },
      {
        type: "fee",
        description: "Fee payment received: $2,000 from Parent ID 123",
        timestamp: "2024-01-14T09:15:00Z"
      },
      {
        type: "task",
        description: "Assignment graded: Physics Lab Report",
        timestamp: "2024-01-13T16:45:00Z"
      },
      {
        type: "event",
        description: "Parent-teacher conference scheduled",
        timestamp: "2024-01-13T11:30:00Z"
      }
    ]
  },

  // Teacher Data
  teacherProfile: {
    name: "Dr. Sarah Wilson",
    employeeId: "EMP2023001",
    role: "teacher",
    email: "sarah.wilson@school.edu",
    phone: "+1 (555) 345-6789",
    department: "Mathematics",
    position: "Senior Mathematics Teacher",
    joiningDate: "2018-08-01",
    address: "789 Teacher Street, Education City, EC 34567",
    profilePicture: null,
    status: "Active",
    subjects: ["Mathematics", "Advanced Calculus"],
    classes: ["10A", "11B", "12A"]
  },

  // Parent Data
  parentProfile: {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 987-6543",
    address: "123 Education Street, Learning City, LC 12345",
    children: [
      {
        id: 1,
        name: "Alex Johnson",
        studentId: "STU2024001",
        class: "10th Grade",
        section: "A"
      }
    ],
    profilePicture: null
  },

  // HOD Data
  hodProfile: {
    name: "Dr. Michael Brown",
    employeeId: "EMP2022001",
    role: "hod",
    email: "michael.brown@school.edu",
    phone: "+1 (555) 456-7890",
    department: "Science",
    position: "Head of Science Department",
    joiningDate: "2015-06-01",
    address: "321 Department Street, Science City, SC 45678",
    profilePicture: null,
    status: "Active"
  },

  // Principal Data
  principalProfile: {
    name: "Dr. Elizabeth Davis",
    employeeId: "EMP2021001",
    role: "principal",
    email: "elizabeth.davis@school.edu",
    phone: "+1 (555) 567-8901",
    department: "Administration",
    position: "School Principal",
    joiningDate: "2010-01-01",
    address: "654 Principal Avenue, Leadership City, LC 56789",
    profilePicture: null,
    status: "Active"
  },

  // Counselor Data
  counselorProfile: {
    name: "Ms. Patricia Wilson",
    employeeId: "EMP2023002",
    role: "counsellor",
    email: "patricia.wilson@school.edu",
    phone: "+1 (555) 678-9012",
    department: "Counseling",
    position: "School Counselor",
    joiningDate: "2019-03-01",
    address: "987 Counseling Street, Support City, SC 67890",
    profilePicture: null,
    status: "Active",
    specialization: "Academic and Career Counseling"
  }
};

// Helper function to get placeholder data based on user role and data type
export const getPlaceholderData = (role, dataType) => {
  // Normalize role to lowercase for comparison
  const normalizedRole = (role || '').toLowerCase();
  
  switch (normalizedRole) {
    case 'student':
      return placeholderData[dataType] || [];
    case 'adminstaff':
    case 'admin_staff':
    case 'admin staff':
      return dataType === 'profile' ? placeholderData.staffProfile : 
             dataType === 'stats' ? placeholderData.adminStats : 
             placeholderData[dataType] || [];
    case 'teacher':
      return dataType === 'profile' ? placeholderData.teacherProfile : 
             placeholderData[dataType] || [];
    case 'parent':
      return dataType === 'profile' ? placeholderData.parentProfile : 
             placeholderData[dataType] || [];
    case 'hod':
    case 'head of department':
      return dataType === 'profile' ? placeholderData.hodProfile : 
             placeholderData[dataType] || [];
    case 'principal':
      return dataType === 'profile' ? placeholderData.principalProfile : 
             placeholderData[dataType] || [];
    case 'counsellor':
    case 'counselor':
      return dataType === 'profile' ? placeholderData.counselorProfile : 
             placeholderData[dataType] || [];
    default:
      return placeholderData[dataType] || [];
  }
};

// Helper function to create a mock API response
export const createMockResponse = (data) => ({
  data: data,
  status: 200,
  statusText: 'OK'
});

// Helper function to simulate API delay
export const simulateApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}; 