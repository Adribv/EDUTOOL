const mongoose = require('mongoose');

const activitiesControlSchema = new mongoose.Schema({
  // Staff member reference
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  // VP who assigned the activities
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  // Activity assignments with access levels
  activityAssignments: [
    {
      activity: {
        type: String,
        required: true,
        enum: [
          // Admin activities
          'Staff Management',
          'Student Records', 
          'Fee Management',
          'Inventory',
          'Events',
          'Communications',
          'Classes',
          'System Settings',
          'User Management',
          'Permissions',
          'Reports',
          'Enquiries',
          'Visitors',
          'Service Requests',
          'Syllabus Completion',
          'Audit Log',
          'Inspection Log',
          'Budget Approval',
          'Expense Log',
          'Income Log',
          'Salary Payroll',
          
          // Teacher activities
          'Classes',
          'Assignments',
          'Calendar',
          'Substitute Teacher Request',
          'My Substitute Requests',
          'Teacher Remarks',
          'Counselling Request Form',
          
          // Student activities
          'Courses',
          'Student Assignments',
          'Student Calendar',
          'Student Counselling Request Form',
          
                     // Principal activities
           'Principal Staff Management',
           'Principal Student Management',
           'School Management',
           'Academic Management',
           'Principal Approvals',
           'Principal Reports',
           'Delegation Authority Management',
           
           // Vice Principal activities
           'Vice Principal Staff Management',
           'Vice Principal Student Management',
           'Vice Principal School Management',
           'Vice Principal Academic Management',
           'Vice Principal Approvals',
           'Vice Principal Reports',
           'Delegation Authority Management',
           
           // HOD activities
          'Department Management',
          'HOD Staff Management',
          'Course Management',
          'HOD Reports',
          'Lesson Plan Approvals',
          'Delegation Authority Management',
          
          // Counsellor activities
          'Counselling Requests',
          
          // IT Admin activities
          'IT User Management',
          'IT Reports',
          'IT System Settings'
        ]
      },
      accessLevel: {
        type: String,
        required: true,
        enum: ['Unauthorized', 'View', 'Edit', 'Approve'],
        default: 'Unauthorized'
      }
    }
  ],
  // Department assignment (optional)
  department: {
    type: String,
    enum: ['Academics', 'Administration', 'Support Staff', 'IT', 'Library', 'Wellness', 'Finance', 'Admin', ''],
    default: ''
  },
  // Remarks/notes
  remarks: {
    type: String,
    default: ''
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  // Assignment date
  assignedDate: {
    type: Date,
    default: Date.now
  },
  // Last modified date
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
activitiesControlSchema.index({ staffId: 1 }, { unique: true });
activitiesControlSchema.index({ assignedBy: 1 });
activitiesControlSchema.index({ 'activityAssignments.activity': 1 });
activitiesControlSchema.index({ 'activityAssignments.accessLevel': 1 });

// Pre-save middleware to update lastModified
activitiesControlSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Static method to get all available activities
activitiesControlSchema.statics.getAvailableActivities = function() {
  return [
    // Admin activities
    'Staff Management',
    'Student Records', 
    'Fee Management',
    'Inventory',
    'Events',
    'Communications',
    'Classes',
    'System Settings',
    'User Management',
    'Permissions',
    'Reports',
    'Enquiries',
    'Visitors',
    'Service Requests',
    'Syllabus Completion',
    'Audit Log',
    'Inspection Log',
    'Budget Approval',
    'Expense Log',
    'Income Log',
    'Salary Payroll',
    
    // Teacher activities
    'Classes',
    'Assignments',
    'Calendar',
    'Substitute Teacher Request',
    'My Substitute Requests',
    'Teacher Remarks',
    'Counselling Request Form',
    
    // Student activities
    'Courses',
    'Student Assignments',
    'Student Calendar',
    'Student Counselling Request Form',
    
    // Principal activities
    'Principal Staff Management',
    'Principal Student Management',
    'School Management',
    'Academic Management',
    'Principal Approvals',
         'Principal Reports',
     'Delegation Authority Management',
     
     // Vice Principal activities
     'Vice Principal Staff Management',
     'Vice Principal Student Management',
     'Vice Principal School Management',
     'Vice Principal Academic Management',
     'Vice Principal Approvals',
     'Vice Principal Reports',
     'Delegation Authority Management',
     
     // HOD activities
    'Department Management',
    'HOD Staff Management',
    'Course Management',
    'HOD Reports',
    'Lesson Plan Approvals',
    'Delegation Authority Management',
    
    // Counsellor activities
    'Counselling Requests',
    
    // IT Admin activities
    'IT User Management',
    'IT Reports',
    'IT System Settings'
  ];
};

// Instance method to get access level for a specific activity
activitiesControlSchema.methods.getAccessLevel = function(activity) {
  const assignment = this.activityAssignments.find(a => a.activity === activity);
  return assignment ? assignment.accessLevel : 'Unauthorized';
};

// Instance method to check if staff has access to an activity
activitiesControlSchema.methods.hasAccess = function(activity, requiredLevel = 'View') {
  const accessLevel = this.getAccessLevel(activity);
  
  if (accessLevel === 'Unauthorized') return false;
  if (requiredLevel === 'View') return true;
  if (requiredLevel === 'Edit') return ['Edit', 'Approve'].includes(accessLevel);
  if (requiredLevel === 'Approve') return accessLevel === 'Approve';
  
  return false;
};

const ActivitiesControl = mongoose.model('ActivitiesControl', activitiesControlSchema);

module.exports = ActivitiesControl; 