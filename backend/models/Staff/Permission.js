const mongoose = require('mongoose');

// Permission schema: One document per staffId, all roles and access levels in roleAssignments array
const permissionSchema = new mongoose.Schema({
  // Staff member reference (unique)
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
    unique: true // Enforce one document per staff
  },
  // Assigned roles and access levels (all roles for this staff)
  roleAssignments: [
    {
      role: { type: String, required: true },
      access: { type: String, enum: ['Unauthorized', 'View Access', 'Edit Access'], required: true }
    }
  ],
  // Department (for HODs and department-specific roles)
  department: {
    type: String,
    enum: ['Academics', 'Administration', 'Support Staff', 'IT', 'Library', 'Wellness', 'Finance', 'Admin']
  },
  // Remarks/notes
  remarks: {
    type: String,
    default: ''
  },
  // Metadata
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Remove legacy/extra indexes (do not add)
// permissionSchema.index({ staffId: 1, role: 1 });
// permissionSchema.index({ role: 1, department: 1 });
// Add unique index for staffId
permissionSchema.index({ staffId: 1 }, { unique: true });

// Pre-save middleware to update lastModified
permissionSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Static method to get default permissions for a role
permissionSchema.statics.getDefaultPermissions = function(role, department = null) {
  const defaults = {
    Admin: {
      permissions: {
        students: 'Edit Access',
        teachers: 'Edit Access',
        classes: 'Edit Access',
        subjects: 'Edit Access',
        timetable: 'Edit Access',
        attendance: 'Edit Access',
        assignments: 'Edit Access',
        exams: 'Edit Access',
        fees: 'Edit Access',
        payments: 'Edit Access',
        salaries: 'Edit Access',
        expenses: 'Edit Access',
        staff: 'Edit Access',
        parents: 'Edit Access',
        communications: 'Edit Access',
        events: 'Edit Access',
        reports: 'Edit Access',
        analytics: 'Edit Access',
        settings: 'Edit Access',
        users: 'Edit Access',
        permissions: 'Edit Access',
        library: 'Edit Access',
        wellness: 'Edit Access',
        counselling: 'Edit Access',
        itSupport: 'Edit Access',
        inventory: 'Edit Access',
        transport: 'Edit Access',
        disciplinary: 'Edit Access'
      }
    },
    Principal: {
      permissions: {
        students: 'Edit Access',
        teachers: 'Edit Access',
        classes: 'Edit Access',
        subjects: 'Edit Access',
        timetable: 'Edit Access',
        attendance: 'View Access',
        assignments: 'View Access',
        exams: 'Edit Access',
        fees: 'Edit Access',
        payments: 'Edit Access',
        salaries: 'Edit Access',
        expenses: 'Edit Access',
        staff: 'Edit Access',
        parents: 'View Access',
        communications: 'Edit Access',
        events: 'Edit Access',
        reports: 'Edit Access',
        analytics: 'Edit Access',
        settings: 'Edit Access',
        users: 'View Access',
        permissions: 'View Access',
        library: 'View Access',
        wellness: 'View Access',
        counselling: 'View Access',
        itSupport: 'View Access',
        inventory: 'View Access',
        transport: 'View Access',
        disciplinary: 'Edit Access'
      }
    },
    'Vice Principal': {
      permissions: {
        students: 'Edit Access',
        teachers: 'View Access',
        classes: 'Edit Access',
        subjects: 'Edit Access',
        timetable: 'Edit Access',
        attendance: 'View Access',
        assignments: 'View Access',
        exams: 'Edit Access',
        fees: 'View Access',
        payments: 'View Access',
        salaries: 'No Access',
        expenses: 'View Access',
        staff: 'View Access',
        parents: 'View Access',
        communications: 'Edit Access',
        events: 'Edit Access',
        reports: 'View Access',
        analytics: 'View Access',
        settings: 'View Access',
        users: 'No Access',
        permissions: 'No Access',
        library: 'View Access',
        wellness: 'View Access',
        counselling: 'View Access',
        itSupport: 'View Access',
        inventory: 'View Access',
        transport: 'View Access',
        disciplinary: 'Edit Access'
      }
    },
    HOD: {
      permissions: {
        students: 'View Access',
        teachers: 'Edit Access',
        classes: 'View Access',
        subjects: 'Edit Access',
        timetable: 'Edit Access',
        attendance: 'View Access',
        assignments: 'View Access',
        exams: 'Edit Access',
        fees: 'No Access',
        payments: 'No Access',
        salaries: 'No Access',
        expenses: 'No Access',
        staff: 'View Access',
        parents: 'View Access',
        communications: 'Edit Access',
        events: 'View Access',
        reports: 'View Access',
        analytics: 'View Access',
        settings: 'No Access',
        users: 'No Access',
        permissions: 'No Access',
        library: 'View Access',
        wellness: 'View Access',
        counselling: 'View Access',
        itSupport: 'No Access',
        inventory: 'View Access',
        transport: 'No Access',
        disciplinary: 'Edit Access'
      }
    },
    Teacher: {
      permissions: {
        students: 'View Access',
        teachers: 'View Access',
        classes: 'View Access',
        subjects: 'View Access',
        timetable: 'View Access',
        attendance: 'Edit Access',
        assignments: 'Edit Access',
        exams: 'Edit Access',
        fees: 'No Access',
        payments: 'No Access',
        salaries: 'No Access',
        expenses: 'No Access',
        staff: 'View Access',
        parents: 'View Access',
        communications: 'Edit Access',
        events: 'View Access',
        reports: 'View Access',
        analytics: 'View Access',
        settings: 'No Access',
        users: 'No Access',
        permissions: 'No Access',
        library: 'View Access',
        wellness: 'View Access',
        counselling: 'View Access',
        itSupport: 'No Access',
        inventory: 'No Access',
        transport: 'No Access',
        disciplinary: 'Edit Access'
      }
    },
    Librarian: {
      permissions: {
        students: 'View Access',
        teachers: 'View Access',
        classes: 'No Access',
        subjects: 'No Access',
        timetable: 'No Access',
        attendance: 'No Access',
        assignments: 'No Access',
        exams: 'No Access',
        fees: 'No Access',
        payments: 'No Access',
        salaries: 'No Access',
        expenses: 'No Access',
        staff: 'View Access',
        parents: 'No Access',
        communications: 'View Access',
        events: 'View Access',
        reports: 'View Access',
        analytics: 'View Access',
        settings: 'No Access',
        users: 'No Access',
        permissions: 'No Access',
        library: 'Edit Access',
        wellness: 'No Access',
        counselling: 'No Access',
        itSupport: 'No Access',
        inventory: 'Edit Access',
        transport: 'No Access',
        disciplinary: 'No Access'
      }
    },
    'Wellness Counsellor': {
      permissions: {
        students: 'View Access',
        teachers: 'View Access',
        classes: 'View Access',
        subjects: 'No Access',
        timetable: 'No Access',
        attendance: 'View Access',
        assignments: 'No Access',
        exams: 'No Access',
        fees: 'No Access',
        payments: 'No Access',
        salaries: 'No Access',
        expenses: 'No Access',
        staff: 'View Access',
        parents: 'View Access',
        communications: 'Edit Access',
        events: 'View Access',
        reports: 'View Access',
        analytics: 'View Access',
        settings: 'No Access',
        users: 'No Access',
        permissions: 'No Access',
        library: 'View Access',
        wellness: 'Edit Access',
        counselling: 'Edit Access',
        itSupport: 'No Access',
        inventory: 'No Access',
        transport: 'No Access',
        disciplinary: 'Edit Access'
      }
    },
    Accountant: {
      permissions: {
        students: 'View Access',
        teachers: 'View Access',
        classes: 'No Access',
        subjects: 'No Access',
        timetable: 'No Access',
        attendance: 'No Access',
        assignments: 'No Access',
        exams: 'No Access',
        fees: 'Edit Access',
        payments: 'Edit Access',
        salaries: 'Edit Access',
        expenses: 'Edit Access',
        staff: 'View Access',
        parents: 'View Access',
        communications: 'View Access',
        events: 'View Access',
        reports: 'Edit Access',
        analytics: 'Edit Access',
        settings: 'No Access',
        users: 'No Access',
        permissions: 'No Access',
        library: 'No Access',
        wellness: 'No Access',
        counselling: 'No Access',
        itSupport: 'No Access',
        inventory: 'View Access',
        transport: 'View Access',
        disciplinary: 'No Access'
      }
    }
  };
  
  return defaults[role] || {};
};

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission; 