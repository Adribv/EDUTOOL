# Activities Control System - Complete Integration Guide

## Overview

The Activities Control System provides granular permission management for all staff roles in the educational management system. This system allows Vice Principals to assign specific activities to staff members with four distinct access levels: **Unauthorized**, **View**, **Edit**, and **Approve**.

## 🎯 Key Features

### Access Levels
- **Unauthorized**: No access to the activity
- **View**: Can only view/read the activity  
- **Edit**: Can view and modify the activity
- **Approve**: Can view, edit, and approve/reject items

### Dashboard Integration
- **Automatic Tab Filtering**: Only authorized tabs are visible in dashboards
- **Access Level Enforcement**: UI elements are controlled based on permissions
- **Real-time Permission Checking**: Access levels are enforced throughout the application
- **Graceful Degradation**: Default permissions when no activities control exists

## 🏗️ Architecture

### Backend Components

#### 1. Database Model (`backend/models/Staff/ActivitiesControl.js`)
```javascript
const activitiesControlSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  activityAssignments: [
    {
      activity: { type: String, required: true, enum: [...] },
      accessLevel: { type: String, required: true, enum: ['Unauthorized', 'View', 'Edit', 'Approve'] }
    }
  ],
  department: { type: String, enum: [...] },
  remarks: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  assignedDate: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now }
});
```

#### 2. Controller (`backend/controllers/Staff/VP/activitiesControlController.js`)
- `getAllStaffActivities`: Retrieve all staff with activities control
- `getStaffActivities`: Get activities control for specific staff
- `saveStaffActivities`: Create/update activities control
- `bulkAssignActivities`: Assign activities to multiple staff
- `getAvailableActivities`: Get list of available activities
- `getActivitiesSummary`: Get statistics and summary

#### 3. Middleware (`backend/middlewares/activitiesControlMiddleware.js`)
```javascript
// Check specific activity access
const checkActivityAccess = (activity, requiredLevel = 'View')

// Check multiple activities
const checkAnyActivityAccess = (activities, requiredLevel = 'View')

// Check edit permissions
const checkEditActivityAccess = (activity)

// Check approve permissions
const checkApproveActivityAccess = (activity)

// Get user's activities control
const getUserActivitiesControl = async (req, res, next)

// Check action permissions
const canPerformAction = (activity, action)
```

#### 4. Routes (`backend/routes/Staff/VP/vicePrincipalRoutes.js`)
```javascript
// Activities Control Routes
router.get('/activities-control/staff', activitiesControlController.getAllStaffActivities);
router.get('/activities-control/staff/:staffId', activitiesControlController.getStaffActivities);
router.post('/activities-control/staff/:staffId', activitiesControlController.saveStaffActivities);
router.delete('/activities-control/staff/:staffId', activitiesControlController.deleteStaffActivities);
router.get('/activities-control/activities', activitiesControlController.getAvailableActivities);
router.post('/activities-control/bulk-assign', activitiesControlController.bulkAssignActivities);
router.get('/activities-control/summary', activitiesControlController.getActivitiesSummary);
```

### Frontend Components

#### 1. Utility Functions (`frontend/src/utils/activitiesControl.js`)
```javascript
// Core permission checking
export const hasActivityAccess = (activity, requiredLevel = 'View')
export const canEditActivity = (activity)
export const canApproveActivity = (activity)
export const getActivityAccessLevel = (activity)

// Dashboard tab filtering
export const filterDashboardTabsByActivitiesControl = (tabs, userRole)
export const filterMenuItemsByActivitiesControl = (menuItems)

// Access level information
export const getAccessLevelInfo = (activity)
export const canPerformAction = (activity, action)

// Local storage management
export const storeUserActivitiesControl = (activitiesControl)
export const clearUserActivitiesControl = ()
export const getUserActivitiesControl = ()

// React hook
export const useUserActivitiesControl = ()
```

#### 2. Layout Integration (`frontend/src/components/layout/Layout.jsx`)
```javascript
// Fetch user's activities control on mount
const fetchUserActivitiesControl = async () => {
  try {
    const response = await api.get('/vp/activities-control/staff/me');
    if (response.data.success) {
      storeUserActivitiesControl(response.data.data);
      setUserActivitiesControl(response.data.data);
    }
  } catch (error) {
    console.error('Error fetching activities control:', error);
  }
};

// Filter menu items based on activities control
const getMenuItems = useMemo(() => {
  const allMenuItems = [...commonItems, ...(roleSpecificItems[user?.role] || [])];
  
  if (userActivitiesControl) {
    return filterMenuItemsByActivitiesControl(allMenuItems);
  }
  
  return allMenuItems;
}, [user?.role, user?.designation, userActivitiesControl]);
```

#### 3. Dashboard Components

##### Teacher Dashboard (`frontend/src/pages/teacher/Dashboard.jsx`)
```javascript
// Filter tabs based on activities control
const featureTabs = useMemo(() => {
  return filterDashboardTabsByActivitiesControl(allFeatureTabs, 'Teacher');
}, [hasAccess]);

// Render content with access control
const renderTabContent = () => {
  const currentTab = featureTabs[activeTab];
  const activityName = getActivityNameFromTabLabel(currentTab.label, 'Teacher');
  const accessLevelInfo = getAccessLevelInfo(activityName);

  if (!hasAccess(activityName, 'View')) {
    return <AccessRestrictedAlert activity={currentTab.label} />;
  }

  return (
    <Box>
      <AccessLevelIndicator 
        label={accessLevelInfo.label}
        color={accessLevelInfo.color}
        icon={currentTab.icon}
      />
      {renderContent()}
    </Box>
  );
};
```

##### HOD Dashboard (`frontend/src/pages/hod/Dashboard.jsx`)
```javascript
// Filter HOD tabs
const hodTabs = useMemo(() => {
  return filterDashboardTabsByActivitiesControl(allHODTabs, 'HOD');
}, [hasAccess]);

// Conditional rendering based on access levels
{canEdit(activityName) && (
  <Button variant="contained" startIcon={<Add />}>
    Add Teacher
  </Button>
)}

{canApprove(activityName) && (
  <IconButton size="small" color="error">
    <Delete />
  </IconButton>
)}
```

##### Principal Dashboard (`frontend/src/pages/principal/PrincipalDashboard.jsx`)
```javascript
// Filter principal tabs
const principalTabs = useMemo(() => {
  return filterDashboardTabsByActivitiesControl(allPrincipalTabs, 'Principal');
}, [hasAccess]);

// Access level enforcement in content
{canEdit(activityName) && (
  <Button variant="outlined" onClick={() => setEditSchoolDialog(true)}>
    Edit Strategic Info
  </Button>
)}
```

#### 4. Activities Control Display (`frontend/src/components/ActivitiesControlDisplay.jsx`)
```javascript
// Display user's assigned activities
export default function ActivitiesControlDisplay() {
  const { data: activitiesControl } = useQuery({
    queryKey: ['userActivitiesControl'],
    queryFn: () => api.get('/vp/activities-control/staff/me').then(res => res.data)
  });

  return (
    <Box>
      <Typography variant="h6">Your Assigned Activities</Typography>
      {activitiesControl?.data?.activityAssignments?.map(assignment => (
        <Chip 
          key={assignment.activity}
          label={`${assignment.activity}: ${assignment.accessLevel}`}
          color={getAccessLevelColor(assignment.accessLevel)}
        />
      ))}
    </Box>
  );
}
```

## 🔧 Implementation Details

### 1. Activity Mapping

The system maps dashboard tabs to specific activities:

```javascript
// Teacher Activities
'Timetable': 'Calendar',
'Attendance': 'Assignments',
'Assignments': 'Assignments',
'Exams': 'Assignments',
'Students': 'Classes',
'Leave Request': 'Substitute Teacher Request',
'Resources': 'Assignments',
'Lesson Plans': 'Teacher Remarks',
'Communication': 'Communications',
'Service Request': 'Counselling Request Form',

// HOD Activities
'Staff Management': 'HOD Staff Management',
'Teacher Attendance': 'HOD Staff Management',
'Teacher Evaluation': 'HOD Staff Management',
'Class Allocation': 'Course Management',
'Department Reports': 'HOD Reports',
'Lesson Plan Approvals': 'Lesson Plan Approvals',

// Principal Activities
'Policies': 'School Management',
'Staff': 'Principal Staff Management',
'Reports': 'Principal Reports',
```

### 2. Access Level Enforcement

#### Frontend Enforcement
```javascript
// Check if user can perform specific actions
const canEdit = canEditActivity('Staff Management');
const canApprove = canApproveActivity('Lesson Plan Approvals');

// Conditional rendering
{canEdit && <EditButton />}
{canApprove && <DeleteButton />}
```

#### Backend Enforcement
```javascript
// Route protection with middleware
router.get('/staff', 
  checkActivityAccess('Staff Management', 'View'),
  staffController.getAllStaff
);

router.post('/staff',
  checkEditActivityAccess('Staff Management'),
  staffController.createStaff
);

router.delete('/staff/:id',
  checkApproveActivityAccess('Staff Management'),
  staffController.deleteStaff
);
```

### 3. Dashboard Tab Filtering

```javascript
export const filterDashboardTabsByActivitiesControl = (tabs, userRole) => {
  const activitiesControl = getUserActivitiesControl();
  
  if (!activitiesControl || !activitiesControl.activityAssignments) {
    return tabs; // Show all tabs if no activities control
  }
  
  return tabs.filter(tab => {
    // Always allow Overview/Dashboard tab
    if (tab.label === 'Overview' || tab.label === 'Dashboard') {
      return true;
    }
    
    // Map tab labels to activity names
    const activityName = getActivityNameFromTabLabel(tab.label, userRole);
    
    // Check if user has access to this activity
    return hasAnyActivityAccess(activityName);
  });
};
```

## 🚀 Usage Guide

### For Vice Principals

1. **Access Activities Control**
   - Navigate to VP Dashboard
   - Click "Activities Control" tab

2. **Assign Activities to Staff**
   - Select staff member from the list
   - Choose activities and assign access levels
   - Add remarks and save

3. **Bulk Assignment**
   - Select multiple staff members
   - Assign same activities to all selected staff
   - Use for department-wide permissions

### For Staff Members

1. **View Assigned Activities**
   - Activities control is automatically applied
   - Only authorized tabs are visible in dashboard
   - Access levels are enforced throughout the system

2. **Understanding Access Levels**
   - **View**: Can see the feature but cannot modify
   - **Edit**: Can view and modify data
   - **Approve**: Can view, edit, and approve/reject items

## 🔒 Security Features

### 1. Backend Security
- All routes protected by authentication middleware
- Activities control enforced on every protected route
- Access level validation on all operations
- Audit trail for all permission changes

### 2. Frontend Security
- Real-time permission checking
- UI elements hidden based on permissions
- Graceful error handling for unauthorized access
- Local storage encryption for sensitive data

### 3. Data Protection
- Soft delete for activities control records
- Audit trail with timestamps
- VP assignment tracking
- Department-based organization

## 📊 Monitoring and Analytics

### 1. Activities Summary
- Total staff count
- Staff with activities control
- Access level distribution
- Recent assignments

### 2. Access Level Statistics
- View access count
- Edit access count
- Approve access count
- Unauthorized count

### 3. Recent Activity
- Last 10 assignments
- Assignment modifications
- VP assignment history

## 🔄 Integration Points

### 1. Existing Permission System
- Works alongside existing role-based permissions
- Provides additional granular control
- No conflicts with existing permissions
- Graceful fallback to default permissions

### 2. Menu System
- Automatic menu filtering
- Dynamic navigation based on permissions
- Real-time updates when permissions change

### 3. Dashboard Components
- All dashboard tabs filtered by permissions
- Access level indicators
- Conditional rendering of features
- Error handling for unauthorized access

## 🛠️ API Endpoints

### Activities Control Management
```javascript
// Get all staff with activities control
GET /api/vp/activities-control/staff

// Get specific staff activities control
GET /api/vp/activities-control/staff/:staffId

// Save/update staff activities control
POST /api/vp/activities-control/staff/:staffId

// Delete staff activities control
DELETE /api/vp/activities-control/staff/:staffId

// Get available activities
GET /api/vp/activities-control/activities

// Bulk assign activities
POST /api/vp/activities-control/bulk-assign

// Get activities summary
GET /api/vp/activities-control/summary

// Get current user's activities control
GET /api/vp/activities-control/staff/me
```

### Protected Routes Example
```javascript
// Staff management routes with activities control
router.get('/staff', 
  verifyToken, 
  checkActivityAccess('Staff Management', 'View'),
  staffController.getAllStaff
);

router.post('/staff',
  verifyToken,
  checkEditActivityAccess('Staff Management'),
  staffController.createStaff
);

router.put('/staff/:id',
  verifyToken,
  checkEditActivityAccess('Staff Management'),
  staffController.updateStaff
);

router.delete('/staff/:id',
  verifyToken,
  checkApproveActivityAccess('Staff Management'),
  staffController.deleteStaff
);
```

## 🎯 Benefits

### 1. Granular Control
- Precise permission management
- Activity-specific access levels
- Flexible assignment system

### 2. Enhanced Security
- Multi-level access control
- Real-time permission enforcement
- Comprehensive audit trail

### 3. Improved User Experience
- Clean, filtered interfaces
- Clear access level indicators
- Intuitive permission management

### 4. Administrative Efficiency
- Bulk assignment capabilities
- Department-based organization
- Comprehensive reporting

## 🔮 Future Enhancements

### 1. Advanced Features
- Time-based permissions
- Conditional access rules
- Permission inheritance
- Role templates

### 2. Enhanced UI
- Drag-and-drop assignment
- Visual permission mapping
- Real-time collaboration
- Mobile optimization

### 3. Analytics
- Permission usage analytics
- Access pattern analysis
- Security audit reports
- Performance metrics

### 4. Integration
- Third-party system integration
- API rate limiting
- Webhook notifications
- External audit systems

## 📝 Troubleshooting

### Common Issues

1. **Tabs Not Showing**
   - Check if activities control is assigned
   - Verify access levels are not 'Unauthorized'
   - Ensure proper activity mapping

2. **Access Denied Errors**
   - Verify user authentication
   - Check activities control assignment
   - Confirm required access level

3. **Permission Not Working**
   - Clear browser cache
   - Refresh activities control data
   - Check backend middleware configuration

### Debug Tools

1. **Frontend Debug**
   ```javascript
   // Check user's activities control
   console.log(getUserActivitiesControl());
   
   // Check specific activity access
   console.log(hasActivityAccess('Staff Management', 'Edit'));
   
   // Get access level info
   console.log(getAccessLevelInfo('Staff Management'));
   ```

2. **Backend Debug**
   ```javascript
   // Check middleware execution
   console.log('User ID:', req.user?.id);
   console.log('Activities Control:', req.userActivitiesControl);
   console.log('Access Level:', req.userAccessLevel);
   ```

## 📞 Support

For technical support or questions about the Activities Control System:

1. Check the troubleshooting section above
2. Review the API documentation
3. Contact the development team
4. Submit an issue through the project repository

---

**Note**: This system is designed to work seamlessly with the existing educational management system while providing enhanced security and granular control over user permissions. 