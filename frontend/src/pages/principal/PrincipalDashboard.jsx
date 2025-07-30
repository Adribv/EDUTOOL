import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Rating,
  Badge
} from '@mui/material';
import {
  Security as SecurityIcon,
  DataObject as DataObjectIcon,
  Policy as PolicyIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert,
  CheckCircle,
  Warning,
  Error,
  TrendingUp,
  TrendingDown,
  Star,
  StarBorder,
  Visibility,
  VisibilityOff,
  CrisisAlert as CrisisAlertIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { 
  filterDashboardTabsByActivitiesControl, 
  useUserActivitiesControl,
  canPerformAction,
  getAccessLevelInfo
} from '../../utils/activitiesControl';
import { api } from '../../services/api';
import DelegationAuthorityNotice from '../../components/DelegationAuthorityNotice';


// Tab configuration for Principal Dashboard
const allPrincipalTabs = [
  { label: 'Overview', icon: <DataObjectIcon />, key: 'overview' },
  { label: 'Policies', icon: <PolicyIcon />, key: 'policies' },
  { label: 'Staff', icon: <GroupIcon />, key: 'staff' },
  { label: 'Delegation Authority', icon: <SecurityIcon />, key: 'delegationAuthority' },
  { label: 'Reports', icon: <AssessmentIcon />, key: 'reports' },
];

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();

  
  // Activities control hook
  const { hasAccess, canEdit, canApprove, getAccessLevel, getAccessLevelInfo } = useUserActivitiesControl();
  
  const [tab, setTab] = useState(0);
  const [editSchoolDialog, setEditSchoolDialog] = useState(false);
  const [policyDialog, setPolicyDialog] = useState(false);
  const [staffDialog, setStaffDialog] = useState(false);
  const [appraisalDialog, setAppraisalDialog] = useState(false);
  
  // Filter tabs based on activities control
  const principalTabs = useMemo(() => {
    return filterDashboardTabsByActivitiesControl(allPrincipalTabs, 'Principal');
  }, [hasAccess]);

  // School Info
  const { data: schoolInfo, isLoading: schoolLoading } = useQuery({
    queryKey: ['schoolInfo'],
    queryFn: api.getSchoolInfo,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => setSchoolForm(data),
  });
  const updateSchoolMutation = useMutation({
    mutationFn: api.updateSchoolInfo,
    onSuccess: () => {
      queryClient.invalidateQueries(['schoolInfo']);
      setEditSchoolDialog(false);
      toast.success('School info updated');
    },
    onError: () => toast.error('Failed to update school info'),
  });

  // Policies/Announcements (including Crisis/PR)
  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: () => api.getPolicies?.() || Promise.resolve([]),
    staleTime: 5 * 60 * 1000,
  });
  const createPolicyMutation = useMutation({
    mutationFn: api.createAnnouncement ? api.createAnnouncement : () => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries(['policies']);
      setPolicyDialog(false);
      setPolicyForm({ title: '', content: '', type: 'General' });
      toast.success('Policy/Announcement added');
    },
    onError: () => toast.error('Failed to add policy'),
  });

  // Staff
  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: api.getStaff,
    staleTime: 5 * 60 * 1000,
  });
  const createStaffMutation = useMutation({
    mutationFn: api.createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      setEditStaffDialog(false);
      setStaffForm({});
      toast.success('Staff added');
    },
    onError: () => toast.error('Failed to add staff'),
  });
  const updateStaffMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      setEditStaffDialog(false);
      setStaffForm({});
      setSelectedStaff(null);
      toast.success('Staff updated');
    },
    onError: () => toast.error('Failed to update staff'),
  });
  const deleteStaffMutation = useMutation({
    mutationFn: api.deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      toast.success('Staff deleted');
    },
    onError: () => toast.error('Failed to delete staff'),
  });

  // Reports
  const { data: schoolReport, isLoading: reportLoading } = useQuery({
    queryKey: ['schoolReport'],
    queryFn: () => api.generateSchoolReport?.() || Promise.resolve({}),
    staleTime: 5 * 60 * 1000,
  });

  // Departments
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: api.getDepartments,
    staleTime: 5 * 60 * 1000,
  });

  // Handlers
  const handleSchoolFormChange = (e) => {
    setSchoolForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handlePolicyFormChange = (e) => {
    setPolicyForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleStaffFormChange = (e) => {
    setStaffForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleAppraisalFormChange = (e) => {
    setAppraisalForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Helper to get activity name from tab label
  const getActivityNameFromTabLabel = (label, role) => {
    const tab = principalTabs.find(t => t.label === label);
    if (!tab) return null;

    switch (tab.key) {
      case 'policies': return 'School Management';
      case 'staff': return 'Principal Staff Management';
      case 'delegationAuthority': return 'Delegation Authority Management';
      case 'reports': return 'Principal Reports';
      default: return null;
    }
  };

  // Render tab content with access control
  const renderTabContent = () => {
    const currentTab = principalTabs[tab];
    if (!currentTab) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h6" color="text.secondary">
            No access to this feature
          </Typography>
        </Box>
      );
    }

    // Check access level for the current activity
    const activityName = getActivityNameFromTabLabel(currentTab.label, 'Principal');
    const accessLevelInfo = getAccessLevelInfo(activityName);

    if (!hasAccess(activityName, 'View')) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Alert severity="warning" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Access Restricted
            </Typography>
            <Typography>
              You don't have permission to access {currentTab.label}. 
              Please contact your Vice Principal for access.
            </Typography>
          </Alert>
        </Box>
      );
    }

    const renderContent = () => {
      switch (currentTab.key) {
        case 'overview':
          return (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Strategic Leadership</Typography>
                {schoolLoading ? <CircularProgress /> : (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2">School Vision</Typography>
                        <Typography>{schoolInfo?.vision || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2">Mission</Typography>
                        <Typography>{schoolInfo?.mission || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2">Long-term Goals</Typography>
                        <Typography>{schoolInfo?.goals || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2">Academic & Operational KPIs</Typography>
                        <Typography>{schoolInfo?.kpis || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2">Accreditation</Typography>
                        <Typography>{schoolInfo?.accreditation || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2">Compliance</Typography>
                        <Typography>{schoolInfo?.compliance || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2">Board/Authority Contacts</Typography>
                        <Typography>{schoolInfo?.boardContacts || '-'}</Typography>
                      </Grid>
                    </Grid>
                    {canEdit(activityName) && (
                      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setEditSchoolDialog(true)}>
                        Edit Strategic Info
                      </Button>
                    )}
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>Governance & Policy</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Draft and enforce school policies. Ensure legal and regulatory compliance. Liaise with the school board and education authorities.
                    </Typography>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>Management</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Oversee recruitment, training, and performance appraisal of staff. Manage crisis, discipline, and public relations. Supervise budgets, finances, and resource allocation.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        case 'policies':
          return (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Policies & Announcements</Typography>
                  {canEdit(activityName) && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPolicyDialog(true)}>
                      Add Policy/Announcement
                    </Button>
                  )}
                </Box>
                {policiesLoading ? <CircularProgress /> : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Content</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {policies?.map((policy, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{policy.title}</TableCell>
                          <TableCell>{policy.content}</TableCell>
                          <TableCell>{policy.type || 'General'}</TableCell>
                          <TableCell>
                            {canEdit(activityName) && (
                              <IconButton size="small" color="primary">
                                <EditIcon />
                              </IconButton>
                            )}
                            {canApprove(activityName) && (
                              <IconButton size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom><CrisisAlertIcon sx={{ mr: 1, color: 'error.main' }} />Crisis & Public Relations</Typography>
                <Typography variant="body2" color="text.secondary">
                  Use announcements for crisis management, discipline, and public relations. Add a new announcement with type "Crisis/PR" for urgent communications.
                </Typography>
              </CardContent>
            </Card>
          );
        case 'staff':
          return (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Staff Management</Typography>
                  {canEdit(activityName) && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setStaffDialog(true)}>
                      Add Staff
                    </Button>
                  )}
                </Box>
                {/* Staff management content */}
                <Typography variant="body2" color="text.secondary">
                  Manage staff recruitment, training, and performance appraisal.
                </Typography>
              </CardContent>
            </Card>
          );
        case 'delegationAuthority':
          return <DelegationAuthorityNotice />;
        case 'reports':
          return (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Reports & Analytics</Typography>
                {/* Reports content */}
                <Typography variant="body2" color="text.secondary">
                  View comprehensive reports and analytics for school performance.
                </Typography>
              </CardContent>
            </Card>
          );
        default:
          return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <Typography variant="h6" color="text.secondary">
                Feature not implemented yet
              </Typography>
            </Box>
          );
      }
    };

    return (
      <Box>
        {/* Access Level Indicator */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{currentTab.label}</Typography>
          <Chip 
            label={accessLevelInfo.label}
            color={accessLevelInfo.color}
            size="small"
            icon={currentTab.icon}
          />
        </Box>
        
        {/* Render the content */}
        {renderContent()}
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, width: '100%', maxWidth: '1400px', mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <SecurityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight={700}>Principal Dashboard</Typography>
          <Chip label="Activities Controlled" color="success" sx={{ ml: 2 }} />
        </Box>
      </Box>

      {/* Activities Control Summary */}
      <Box mb={3}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Your dashboard access is controlled by the Vice Principal. 
            Only authorized features are visible based on your assigned activities.
          </Typography>
        </Alert>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)} 
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
              minHeight: 64,
              '&.Mui-selected': {
                color: '#1976d2',
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976d2',
              height: 3
            }
          }}
        >
          {principalTabs.map((tabItem, index) => (
            <Tab 
              key={tabItem.key}
              label={tabItem.label} 
              icon={tabItem.icon}
              sx={{
                '& .MuiTab-iconWrapper': {
                  marginRight: 1
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper sx={{ width: '100%', minHeight: '60vh' }}>
        <Box sx={{ p: 3 }}>
          {renderTabContent()}
        </Box>
      </Paper>

      {/* Edit School Dialog */}
      <Dialog open={editSchoolDialog} onClose={() => setEditSchoolDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Strategic Info</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Vision" name="vision" value={schoolForm.vision || ''} onChange={handleSchoolFormChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Mission" name="mission" value={schoolForm.mission || ''} onChange={handleSchoolFormChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Long-term Goals" name="goals" value={schoolForm.goals || ''} onChange={handleSchoolFormChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="KPIs" name="kpis" value={schoolForm.kpis || ''} onChange={handleSchoolFormChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Accreditation" name="accreditation" value={schoolForm.accreditation || ''} onChange={handleSchoolFormChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Compliance" name="compliance" value={schoolForm.compliance || ''} onChange={handleSchoolFormChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Board/Authority Contacts" name="boardContacts" value={schoolForm.boardContacts || ''} onChange={handleSchoolFormChange} sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditSchoolDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => updateSchoolMutation.mutate(schoolForm)}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Policy Dialog */}
      <Dialog open={policyDialog} onClose={() => setPolicyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Policy/Announcement</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" name="title" value={policyForm.title} onChange={handlePolicyFormChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Content" name="content" value={policyForm.content} onChange={handlePolicyFormChange} sx={{ mb: 2 }} multiline rows={4} />
          <TextField fullWidth label="Type" name="type" value={policyForm.type} onChange={handlePolicyFormChange} sx={{ mb: 2 }} placeholder="General, Crisis/PR, etc." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPolicyDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createPolicyMutation.mutate(policyForm)}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Staff Dialog */}
      <Dialog open={editStaffDialog} onClose={() => setEditStaffDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedStaff ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" name="name" value={staffForm.name || ''} onChange={handleStaffFormChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Email" name="email" value={staffForm.email || ''} onChange={handleStaffFormChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Role" name="role" value={staffForm.role || ''} onChange={handleStaffFormChange} sx={{ mb: 2 }} />
          <TextField
            fullWidth
            select
            label="Department"
            name="department"
            value={staffForm.department || ''}
            onChange={handleStaffFormChange}
            SelectProps={{ native: true }}
            sx={{ mb: 2 }}
            disabled={departmentsLoading}
          >
            <option value="">
              {departmentsLoading ? 'Loading departments...' : 'Select Department'}
            </option>
            {departments?.map((d) => (
              <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditStaffDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            if (selectedStaff) updateStaffMutation.mutate({ id: selectedStaff._id || selectedStaff.id, ...staffForm });
            else createStaffMutation.mutate(staffForm);
          }}>{selectedStaff ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Performance Appraisal Dialog */}
      <Dialog open={appraisalDialog} onClose={() => setAppraisalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Performance Appraisal</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Staff"
            name="staffId"
            value={appraisalForm.staffId}
            onChange={handleAppraisalFormChange}
            SelectProps={{ native: true }}
            sx={{ mb: 2 }}
          >
            <option value="">Select Staff</option>
            {staff?.map((s) => (
              <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Performance"
            name="performance"
            value={appraisalForm.performance}
            onChange={handleAppraisalFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Notes"
            name="notes"
            value={appraisalForm.notes}
            onChange={handleAppraisalFormChange}
            sx={{ mb: 2 }}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAppraisalDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setAppraisalDialog(false); toast.success('Appraisal submitted (demo)'); }}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 