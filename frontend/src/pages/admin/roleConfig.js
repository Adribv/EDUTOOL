// Role-based configuration for admin portal
// Maps each designation to sidebar items and dashboard widgets/functions

export const roleConfig = {
  'Class Coordinator': {
    sidebar: [
      'Attendance',
      'Classes',
      'Students',
      'Reports',
    ],
    dashboard: [
      'Track Attendance',
      'Behavior Issues',
      'Liaison Functions',
    ],
  },
  'AdminStaff': {
    sidebar: [
      'Fee_Management',
      'Inventory_Management',
      'UserManagement',
      'Enquiries',
      'Visitors',
      'A_Reports',
      'A_Events',
      'A_Communication',
      'A_Settings',
      'A_Users',
      'A_Classes',
      'A_Subjects',
      'A_Schedules',
      'Disciplinary_Forms',
      'Teacher_Remarks',
      'Audit_Log',
    ],
    dashboard: [
      'Admissions',
      'Finance',
      'Inventory',
      'Vendor Management',
      'Audit Log',
    ],
  },
  'IT Administrator': {
    sidebar: [
      'SystemSettings',
      'UserManagement',
      'A_Communication',
      'A_Reports',
    ],
    dashboard: [
      'Manage Systems',
      'Cybersecurity',
      'Train Staff/Students',
    ],
  },
  'Librarian': {
    sidebar: [
      'A_Reports',
      'A_Users',
      'A_Classes',
      'A_Subjects',
    ],
    dashboard: [
      'Catalog Management',
      'Resource Support',
      'Reading Programs',
    ],
  },
  'Counselor': {
    sidebar: [
      'A_Users',
      'A_Reports',
      'Disciplinary_Forms',
    ],
    dashboard: [
      'Counseling',
      'Confidential Records',
    ],
  },
  'Examination Controller': {
    sidebar: [
      'Exams',
      'Results',
      'A_Reports',
      'A_Schedules',
    ],
    dashboard: [
      'Exam Timetable',
      'Invigilation',
      'Mark Sheets',
      'Data Analytics',
    ],
  },
  'Co-curricular Coordinator': {
    sidebar: [
      'A_Events',
      'A_Reports',
    ],
    dashboard: [
      'Event Planning',
      'Participation Records',
      'Skill Logs',
    ],
  },
  'Support Staff': {
    sidebar: [
      'A_Inventory',
      'A_Reports',
    ],
    dashboard: [
      'Campus Cleanliness',
      'Transport Management',
      'Safety Protocols',
    ],
  },
};

// Sidebar values should match the component filenames (without .jsx) in /admin
// Dashboard values are for display and widget logic 