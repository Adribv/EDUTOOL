import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import ApprovalIcon from '@mui/icons-material/HowToReg';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '../../services/api';

// API service for Vice Principal using axios instance (token auto-attached)
const vpAPI = {
  getOverview: () => api.get('/api/vp/department/overview').then(res => res.data),
  getStaff: () => api.get('/api/vp/department/staff').then(res => res.data),
  getStatistics: () => api.get('/api/vp/department/statistics').then(res => res.data),
  getDepartment: () => api.get('/api/vp/department').then(res => res.data),
  updateDepartment: (data) => api.put('/api/vp/department', data).then(res => res.data),
  getTeachers: () => api.get('/api/vp/department/teachers').then(res => res.data),
  addTeacher: (teacherId) => api.post('/api/vp/department/teacher', { teacherId }).then(res => res.data),
  removeTeacher: (teacherId) => api.delete(`/api/vp/department/teacher/${teacherId}`).then(res => res.data),
  createDepartment: (data) => api.post('/api/vp/department', data).then(res => res.data),
};

export default function VicePrincipalDashboard() {
  const [tab, setTab] = useState(0);
  const [editDialog, setEditDialog] = useState(false);
  const [editDept, setEditDept] = useState({});
  const [addTeacherDialog, setAddTeacherDialog] = useState(false);
  const [newTeacherId, setNewTeacherId] = useState('');
  const [addDeptDialog, setAddDeptDialog] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '', subjects: '' });
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Queries
  const { data: overview, isLoading: loadingOverview } = useQuery({ queryKey: ['vpOverview'], queryFn: vpAPI.getOverview });
  const { data: staff, isLoading: loadingStaff } = useQuery({ queryKey: ['vpStaff'], queryFn: vpAPI.getStaff });
  const { data: statistics, isLoading: loadingStats } = useQuery({ queryKey: ['vpStats'], queryFn: vpAPI.getStatistics });
  const { data: department, isLoading: loadingDept } = useQuery({ queryKey: ['vpDepartment'], queryFn: vpAPI.getDepartment });
  const { data: teachers, isLoading: loadingTeachers } = useQuery({ queryKey: ['vpTeachers'], queryFn: vpAPI.getTeachers });

  // Mutations
  const updateDepartmentMutation = useMutation({
    mutationFn: vpAPI.updateDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpDepartment']);
      setEditDialog(false);
      toast.success('Department updated');
    },
    onError: () => toast.error('Failed to update department'),
  });

  const addTeacherMutation = useMutation({
    mutationFn: vpAPI.addTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpTeachers']);
      setAddTeacherDialog(false);
      setNewTeacherId('');
      toast.success('Teacher added');
    },
    onError: () => toast.error('Failed to add teacher'),
  });

  const removeTeacherMutation = useMutation({
    mutationFn: vpAPI.removeTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpTeachers']);
      toast.success('Teacher removed');
    },
    onError: () => toast.error('Failed to remove teacher'),
  });

  const createDepartmentMutation = useMutation({
    mutationFn: vpAPI.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries(['vpDepartment']);
      setAddDeptDialog(false);
      setNewDept({ name: '', description: '', subjects: '' });
      toast.success('Department created');
    },
    onError: () => toast.error('Failed to create department'),
  });

  if (user?.role !== 'VicePrincipal') {
    return <Box p={3}><Typography color="error">Access denied: Vice Principal only</Typography></Box>;
  }

  if (loadingOverview || loadingStaff || loadingStats || loadingDept || loadingTeachers) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <SecurityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h4" fontWeight={700}>Vice Principal Dashboard</Typography>
        <Chip label="Secured" color="success" sx={{ ml: 2 }} />
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Overview" icon={<AssessmentIcon />} />
        <Tab label="Staff" icon={<PeopleIcon />} />
        <Tab label="Statistics" icon={<EventIcon />} />
        <Tab label="Department" icon={<EditIcon />} />
        <Tab label="Teachers" icon={<ApprovalIcon />} />
      </Tabs>
      {tab === 0 && (
        <Card><CardContent>
          <Typography variant="h6">Department Overview</Typography>
          <Typography>Name: {overview?.data?.departmentName}</Typography>
          <Typography>Total Teachers: {overview?.data?.totalTeachers}</Typography>
          <Typography>Total Students: {overview?.data?.totalStudents}</Typography>
          <Typography>Subjects: {overview?.data?.subjects?.join(', ')}</Typography>
        </CardContent></Card>
      )}
      {tab === 1 && (
        <Card><CardContent>
          <Typography variant="h6">Department Staff</Typography>
          <pre>{JSON.stringify(staff?.data, null, 2)}</pre>
        </CardContent></Card>
      )}
      {tab === 2 && (
        <Card><CardContent>
          <Typography variant="h6">Department Statistics</Typography>
          <Typography>Attendance Rate: {statistics?.data?.attendanceRate}%</Typography>
          <Typography>Performance Metrics: {JSON.stringify(statistics?.data?.performanceMetrics)}</Typography>
        </CardContent></Card>
      )}
      {tab === 3 && (
        <Card><CardContent>
          <Typography variant="h6">Department Management</Typography>
          <Typography>Name: {department?.name}</Typography>
          <Typography>Description: {department?.description}</Typography>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 2, mr: 2 }} onClick={() => setAddDeptDialog(true)}>Add Department</Button>
          <Button variant="contained" startIcon={<EditIcon />} sx={{ mt: 2 }} onClick={() => { setEditDept({ name: department?.name, description: department?.description }); setEditDialog(true); }}>Edit Department</Button>
        </CardContent></Card>
      )}
      {tab === 4 && (
        <Card><CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Teacher Management</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddTeacherDialog(true)}>Add Teacher</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Joining Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers?.map((teacher) => (
                  <TableRow key={teacher._id}>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.phone}</TableCell>
                    <TableCell>{teacher.joiningDate}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => removeTeacherMutation.mutate(teacher._id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent></Card>
      )}
      {/* Edit Department Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={editDept.name || ''} onChange={e => setEditDept({ ...editDept, name: e.target.value })} />
          <TextField label="Description" fullWidth margin="normal" value={editDept.description || ''} onChange={e => setEditDept({ ...editDept, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => updateDepartmentMutation.mutate(editDept)}>Save</Button>
        </DialogActions>
      </Dialog>
      {/* Add Teacher Dialog */}
      <Dialog open={addTeacherDialog} onClose={() => setAddTeacherDialog(false)}>
        <DialogTitle>Add Teacher to Department</DialogTitle>
        <DialogContent>
          <TextField label="Teacher ID" fullWidth margin="normal" value={newTeacherId} onChange={e => setNewTeacherId(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTeacherDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => addTeacherMutation.mutate(newTeacherId)}>Add</Button>
        </DialogActions>
      </Dialog>
      {/* Add Department Dialog */}
      <Dialog open={addDeptDialog} onClose={() => setAddDeptDialog(false)}>
        <DialogTitle>Add Department</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} />
          <TextField label="Description" fullWidth margin="normal" value={newDept.description} onChange={e => setNewDept({ ...newDept, description: e.target.value })} />
          <TextField label="Subjects (comma separated)" fullWidth margin="normal" value={newDept.subjects} onChange={e => setNewDept({ ...newDept, subjects: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDeptDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createDepartmentMutation.mutate({ ...newDept, subjects: newDept.subjects.split(',').map(s => s.trim()) })}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 