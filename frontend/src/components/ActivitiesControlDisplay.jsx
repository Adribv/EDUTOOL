import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CheckCircle as ApproveIcon,
  Block as UnauthorizedIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
  Message as MessageIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
  RateReview as RateReviewIcon,
  AccountBalance as AccountBalanceIcon,
  Psychology as PsychologyIcon,
  CalendarToday as CalendarIcon,
  Approval as ApprovalIcon,
  Book as BookIcon,
  SupervisorAccount as SupervisorAccountIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  getUserActivitiesControl, 
  getActivityAccessLevel,
  getActivitiesControlSummary 
} from '../utils/activitiesControl';

// Activity icons mapping
const activityIcons = {
  'Staff Management': <PeopleIcon />,
  'Student Records': <SchoolIcon />,
  'Fee Management': <PaymentIcon />,
  'Inventory': <InventoryIcon />,
  'Events': <EventIcon />,
  'Communications': <MessageIcon />,
  'Classes': <SchoolIcon />,
  'System Settings': <SettingsIcon />,
  'User Management': <PeopleIcon />,
  'Permissions': <SecurityIcon />,
  'Reports': <AssessmentIcon />,
  'Enquiries': <MessageIcon />,
  'Visitors': <GroupIcon />,
  'Service Requests': <ApprovalIcon />,
  'Syllabus Completion': <RateReviewIcon />,
  'Salary Payroll': <AccountBalanceIcon />,
  'Assignments': <AssignmentIcon />,
  'Calendar': <CalendarIcon />,
  'Substitute Teacher Request': <ApprovalIcon />,
  'My Substitute Requests': <ApprovalIcon />,
  'Teacher Remarks': <RateReviewIcon />,
  'Counselling Request Form': <PsychologyIcon />,
  'Courses': <SchoolIcon />,
  'Student Assignments': <AssignmentIcon />,
  'Student Calendar': <CalendarIcon />,
  'Student Counselling Request Form': <PsychologyIcon />,
  'Principal Staff Management': <SupervisorAccountIcon />,
  'Principal Student Management': <SchoolIcon />,
  'School Management': <SettingsIcon />,
  'Academic Management': <BookIcon />,
  'Principal Approvals': <ApprovalIcon />,
  'Principal Reports': <AssessmentIcon />,
  'Department Management': <SchoolIcon />,
  'HOD Staff Management': <PeopleIcon />,
  'Course Management': <AssignmentIcon />,
  'HOD Reports': <AssessmentIcon />,
  'Lesson Plan Approvals': <ApprovalIcon />,
  'Counselling Requests': <PsychologyIcon />,
  'IT User Management': <PeopleIcon />,
  'IT Reports': <AssessmentIcon />,
  'IT System Settings': <SettingsIcon />
};

// Access level colors and icons
const accessLevelConfig = {
  'Unauthorized': {
    color: 'error',
    icon: <UnauthorizedIcon />,
    label: 'No Access'
  },
  'View': {
    color: 'info',
    icon: <VisibilityIcon />,
    label: 'View Only'
  },
  'Edit': {
    color: 'warning',
    icon: <EditIcon />,
    label: 'Can Edit'
  },
  'Approve': {
    color: 'success',
    icon: <ApproveIcon />,
    label: 'Can Approve'
  }
};

// Group activities by category
const groupActivitiesByCategory = (activities) => {
  const categories = {
    'Admin Activities': [
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
      'Salary Payroll'
    ],
    'Teacher Activities': [
      'Classes',
      'Assignments',
      'Calendar',
      'Substitute Teacher Request',
      'My Substitute Requests',
      'Teacher Remarks',
      'Counselling Request Form'
    ],
    'Student Activities': [
      'Courses',
      'Student Assignments',
      'Student Calendar',
      'Student Counselling Request Form'
    ],
    'Principal Activities': [
      'Principal Staff Management',
      'Principal Student Management',
      'School Management',
      'Academic Management',
      'Principal Approvals',
      'Principal Reports'
    ],
    'HOD Activities': [
      'Department Management',
      'HOD Staff Management',
      'Course Management',
      'HOD Reports',
      'Lesson Plan Approvals'
    ],
    'Counsellor Activities': [
      'Counselling Requests'
    ],
    'IT Admin Activities': [
      'IT User Management',
      'IT Reports',
      'IT System Settings'
    ]
  };

  const grouped = {};
  
  Object.entries(categories).forEach(([category, categoryActivities]) => {
    const availableActivities = categoryActivities.filter(activity => 
      activities.some(a => a.activity === activity)
    );
    
    if (availableActivities.length > 0) {
      grouped[category] = availableActivities.map(activity => {
        const assignment = activities.find(a => a.activity === activity);
        return {
          activity,
          accessLevel: assignment ? assignment.accessLevel : 'Unauthorized'
        };
      });
    }
  });

  return grouped;
};

export default function ActivitiesControlDisplay() {
  const [activitiesControl, setActivitiesControl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActivitiesControl = async () => {
      try {
        setLoading(true);
        
        if (user?._id || user?.id) {
          const staffId = user._id || user.id;
          const response = await api.get(`/vp/activities-control/staff/${staffId}`);
          const data = response.data?.data;
          
          if (data) {
            setActivitiesControl(data);
          } else {
            setActivitiesControl(null);
          }
        }
      } catch (error) {
        console.log('No activities control found for user');
        setActivitiesControl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActivitiesControl();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!activitiesControl || !activitiesControl.activityAssignments || activitiesControl.activityAssignments.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <SecurityIcon color="primary" />
            <Typography variant="h6">Activities Control</Typography>
          </Box>
          <Alert severity="info">
            No specific activities control has been assigned to you. You have default permissions based on your role.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const summary = getActivitiesControlSummary();
  const groupedActivities = groupActivitiesByCategory(activitiesControl.activityAssignments);

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Your Activities Control</Typography>
          <Tooltip title="Activities control permissions assigned by Vice Principal">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main">
                  {summary.view}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View Access
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main">
                  {summary.edit}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Edit Access
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main">
                  {summary.approve}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approve Access
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="text.secondary">
                  {summary.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Activities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Activities by Category */}
        <Typography variant="h6" gutterBottom>
          Your Assigned Activities
        </Typography>
        
        {Object.entries(groupedActivities).map(([category, activities]) => (
          <Accordion key={category} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {category}
                </Typography>
                <Badge badgeContent={activities.length} color="primary">
                  <AssignmentIcon color="action" />
                </Badge>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {activities.map((item, index) => {
                  const config = accessLevelConfig[item.accessLevel];
                  return (
                    <React.Fragment key={item.activity}>
                      <ListItem>
                        <ListItemIcon sx={{ color: 'primary.main' }}>
                          {activityIcons[item.activity] || <AssignmentIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.activity}
                          secondary={`Access Level: ${config.label}`}
                        />
                        <Chip
                          icon={config.icon}
                          label={config.label}
                          color={config.color}
                          size="small"
                          variant="outlined"
                        />
                      </ListItem>
                      {index < activities.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Additional Information */}
        {activitiesControl.remarks && (
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Remarks:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activitiesControl.remarks}
            </Typography>
          </Box>
        )}

        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date(activitiesControl.lastModified).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
} 