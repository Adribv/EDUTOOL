import { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Button, Chip, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Tooltip, Divider
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import PolicyIcon from '@mui/icons-material/Policy';
import ApprovalIcon from '@mui/icons-material/HowToReg';
import DataObjectIcon from '@mui/icons-material/DataObject';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { principalAPI } from '../../services/api';
import { toast } from 'react-toastify';

export default function PrincipalDashboard() {
  const [tab, setTab] = useState(0);
  const [editSchoolDialog, setEditSchoolDialog] = useState(false);
  const [schoolForm, setSchoolForm] = useState({});
  const [policyDialog, setPolicyDialog] = useState(false);
  const [policyForm, setPolicyForm] = useState({ title: '', content: '', type: 'General' });
  const [editStaffDialog, setEditStaffDialog] = useState(false);
  const [staffForm, setStaffForm] = useState({});
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [appraisalDialog, setAppraisalDialog] = useState(false);
  const [appraisalForm, setAppraisalForm] = useState({ staffId: '', performance: '', notes: '' });
  const queryClient = useQueryClient();

  // School Info
  const { data: schoolInfo, isLoading: schoolLoading } = useQuery({
    queryKey: ['principalSchoolInfo'],
    queryFn: principalAPI.getSchoolInfo,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => setSchoolForm(data),
  });
  const updateSchoolMutation = useMutation({
    mutationFn: principalAPI.updateSchoolInfo,
    onSuccess: () => {
      queryClient.invalidateQueries(['principalSchoolInfo']);
      setEditSchoolDialog(false);
      toast.success('School info updated');
    },
    onError: () => toast.error('Failed to update school info'),
  });

  // Policies/Announcements (including Crisis/PR)
  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['principalPolicies'],
    queryFn: principalAPI.getAnnouncements ? principalAPI.getAnnouncements : () => Promise.resolve([]),
    staleTime: 5 * 60 * 1000,
    enabled: !!principalAPI.getAnnouncements,
  });
  const createPolicyMutation = useMutation({
    mutationFn: principalAPI.createAnnouncement ? principalAPI.createAnnouncement : () => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries(['principalPolicies']);
      setPolicyDialog(false);
      setPolicyForm({ title: '', content: '', type: 'General' });
      toast.success('Policy/Announcement added');
    },
    onError: () => toast.error('Failed to add policy'),
  });

  // Staff
  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ['principalStaff'],
    queryFn: principalAPI.getStaff,
    staleTime: 5 * 60 * 1000,
  });
  const createStaffMutation = useMutation({
    mutationFn: principalAPI.createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries(['principalStaff']);
      setEditStaffDialog(false);
      setStaffForm({});
      toast.success('Staff added');
    },
    onError: () => toast.error('Failed to add staff'),
  });
  const updateStaffMutation = useMutation({
    mutationFn: ({ id, ...data }) => principalAPI.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['principalStaff']);
      setEditStaffDialog(false);
      setStaffForm({});
      setSelectedStaff(null);
      toast.success('Staff updated');
    },
    onError: () => toast.error('Failed to update staff'),
  });
  const deleteStaffMutation = useMutation({
    mutationFn: principalAPI.deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries(['principalStaff']);
      toast.success('Staff deleted');
    },
    onError: () => toast.error('Failed to delete staff'),
  });

  // Reports
  const { data: schoolReport, isLoading: reportLoading } = useQuery({
    queryKey: ['principalSchoolReport'],
    queryFn: () => principalAPI.generateSchoolReport ? principalAPI.generateSchoolReport() : Promise.resolve({}),
    enabled: !!principalAPI.generateSchoolReport,
    staleTime: 10 * 60 * 1000,
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

  // UI
  return (
    <Box sx={{ p: { xs: 1, md: 3 }, width: '100%', maxWidth: '1400px', mx: 'auto' }}>
      <Box display="flex" alignItems="center" mb={3}>
        <SecurityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h4" fontWeight={700}>Principal Dashboard</Typography>
        <Chip label="Secured" color="success" sx={{ ml: 2 }} />
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }} variant="scrollable" scrollButtons="auto">
        <Tab label="Overview" icon={<DataObjectIcon />} />
        <Tab label="Policies" icon={<PolicyIcon />} />
        <Tab label="Staff" icon={<GroupIcon />} />
        <Tab label="Reports" icon={<AssessmentIcon />} />
      </Tabs>

      {/* Overview Tab */}
      {tab === 0 && (
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
                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setEditSchoolDialog(true)}>
                  Edit Strategic Info
                </Button>
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
      )}

      {/* Policies Tab */}
      {tab === 1 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Policies & Announcements</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPolicyDialog(true)}>
                Add Policy/Announcement
              </Button>
            </Box>
            {policiesLoading ? <CircularProgress /> : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Content</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {policies?.map((policy, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{policy.title}</TableCell>
                      <TableCell>{policy.content}</TableCell>
                      <TableCell>{policy.type || 'General'}</TableCell>
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
      )}

      {/* Staff Tab */}
      {tab === 2 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Staff Management</Typography>
              <Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditStaffDialog(true); setSelectedStaff(null); setStaffForm({}); }} sx={{ mr: 2 }}>
                  Add Staff
                </Button>
                <Button variant="outlined" startIcon={<AssessmentIcon />} onClick={() => setAppraisalDialog(true)}>
                  Performance Appraisal
                </Button>
              </Box>
            </Box>
            {staffLoading ? <CircularProgress /> : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staff?.map((s) => (
                    <TableRow key={s._id || s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.role}</TableCell>
                      <TableCell>{s.department}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit"><IconButton onClick={() => { setEditStaffDialog(true); setSelectedStaff(s); setStaffForm(s); }}><EditIcon /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton color="error" onClick={() => deleteStaffMutation.mutate(s._id || s.id)}><DeleteIcon /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reports Tab */}
      {tab === 3 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Budgets, Finances & Resource Allocation</Typography>
            {reportLoading ? <CircularProgress /> : (
              <Box>
                <Button variant="contained" startIcon={<DownloadIcon />} sx={{ mb: 2 }} onClick={() => {
                  if (principalAPI.generateSchoolReport) {
                    principalAPI.generateSchoolReport().then(() => toast.success('Report downloaded'));
                  }
                }}>
                  Download School Report
                </Button>
                {/* Add more financial/resource reports as needed */}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

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
          <TextField fullWidth label="Department" name="department" value={staffForm.department || ''} onChange={handleStaffFormChange} sx={{ mb: 2 }} />
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