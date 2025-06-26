import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, CardHeader, Grid, Chip, Avatar, 
  List, ListItem, ListItemText, ListItemAvatar, Divider, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, FormControl, InputLabel, Select, MenuItem, Alert, Skeleton, 
  LinearProgress, Badge, CardActions, Accordion, AccordionSummary, 
  AccordionDetails, ListItemIcon, Tooltip, Fab, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  Assignment, Add, Edit, Delete, Visibility, Download, Upload, 
  CheckCircle, Schedule, Group, Grade, FileUpload, FileDownload,
  ExpandMore, MoreVert, FilterList, Search, Refresh, TrendingUp,
  TrendingDown, Equalizer, Assessment, Book, School, Person,
  Apps, List as ListIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teacherService from '../../services/teacherService';
import { toast } from 'react-toastify';

export default function Assignments() {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();

  const { data: assignmentsData, isLoading, error } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => teacherService.getAssignments()
  });

  const { data: submissionsData } = useQuery({
    queryKey: ['assignmentSubmissions'],
    queryFn: () => teacherService.getAssignmentSubmissions(selectedAssignment?.id)
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data) => teacherService.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assignments']);
      toast.success('Assignment created successfully');
      setDialogOpen(false);
    },
    onError: () => toast.error('Failed to create assignment')
  });

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load assignments data</Alert>;
  }

  const assignments = assignmentsData?.data || [];
  const submissions = submissionsData?.data || [];

  const filteredAssignments = assignments.filter(assignment => {
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getSubmissionRate = (assignment) => {
    return ((assignment.submittedCount / assignment.totalStudents) * 100).toFixed(1);
  };

  const getGradingRate = (assignment) => {
    return ((assignment.gradedCount / assignment.submittedCount) * 100).toFixed(1);
  };

  const renderGridCard = (assignment) => (
    <Card key={assignment.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <Assignment />
          </Avatar>
        }
        action={
          <IconButton>
            <MoreVert />
          </IconButton>
        }
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" noWrap>
              {assignment.title}
            </Typography>
            <Chip 
              label={assignment.status} 
              size="small" 
              color={getStatusColor(assignment.status)}
            />
          </Box>
        }
        subheader={
          <Box>
            <Typography variant="body2" color="textSecondary">
              {assignment.subject} • {assignment.class}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Due: {assignment.dueDate}
            </Typography>
          </Box>
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {assignment.description}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption">Submissions</Typography>
            <Typography variant="caption">
              {assignment.submittedCount}/{assignment.totalStudents}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getSubmissionRate(assignment)} 
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption">Graded</Typography>
            <Typography variant="caption">
              {assignment.gradedCount}/{assignment.submittedCount}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getGradingRate(assignment)} 
            sx={{ height: 6, borderRadius: 3 }}
            color="secondary"
          />
        </Box>

        {assignment.averageGrade > 0 && (
          <Box display="flex" alignItems="center" gap={1}>
            <Grade color="primary" fontSize="small" />
            <Typography variant="body2">
              Avg Grade: {assignment.averageGrade}%
            </Typography>
          </Box>
        )}
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          startIcon={<Visibility />}
          onClick={() => {
            setSelectedAssignment(assignment);
            setSubmissionsDialogOpen(true);
          }}
        >
          View Submissions
        </Button>
        <Button size="small" startIcon={<Edit />}>
          Edit
        </Button>
        <Button size="small" color="error" startIcon={<Delete />}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );

  const renderTableView = () => (
    <Card>
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Assignment</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submissions</TableCell>
                <TableCell>Graded</TableCell>
                <TableCell>Avg Grade</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{assignment.title}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {assignment.description.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={assignment.subject} size="small" color="primary" />
                  </TableCell>
                  <TableCell>{assignment.class}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{assignment.dueDate}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={assignment.status} 
                      size="small" 
                      color={getStatusColor(assignment.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box textAlign="center">
                      <Typography variant="body2">
                        {assignment.submittedCount}/{assignment.totalStudents}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={getSubmissionRate(assignment)} 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box textAlign="center">
                      <Typography variant="body2">
                        {assignment.gradedCount}/{assignment.submittedCount}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={getGradingRate(assignment)} 
                        sx={{ mt: 0.5 }}
                        color="secondary"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {assignment.averageGrade > 0 ? (
                      <Typography variant="body2" color="primary">
                        {assignment.averageGrade}%
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setSubmissionsDialogOpen(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" color="secondary">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {assignments.length}
                  </Typography>
                  <Typography variant="body2">Total Assignments</Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {assignments.filter(a => a.status === 'active').length}
                  </Typography>
                  <Typography variant="body2">Active Assignments</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {assignments.reduce((sum, a) => sum + a.submittedCount, 0)}
                  </Typography>
                  <Typography variant="body2">Total Submissions</Typography>
                </Box>
                <Upload sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {assignments.reduce((sum, a) => sum + a.gradedCount, 0)}
                  </Typography>
                  <Typography variant="body2">Graded Submissions</Typography>
                </Box>
                <Grade sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search fontSize="small" color="action" />
                }}
              />
              <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={1}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <Apps />
                </ToggleButton>
                <ToggleButton value="table">
                  <List />
                </ToggleButton>
              </ToggleButtonGroup>
              <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                Create Assignment
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredAssignments.map(assignment => (
            <Grid item xs={12} sm={6} md={4} key={assignment.id}>
              {renderGridCard(assignment)}
            </Grid>
          ))}
        </Grid>
      ) : (
        renderTableView()
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assignment Title"
                placeholder="Enter assignment title"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                placeholder="e.g., Mathematics"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class"
                placeholder="e.g., 10th Grade Mathematics A"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                placeholder="Enter assignment description and requirements..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" defaultValue="active">
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label" startIcon={<FileUpload />}>
                Upload Assignment File
                <input type="file" hidden />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createAssignmentMutation.mutate({})}>
            Create Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog 
        open={submissionsDialogOpen} 
        onClose={() => setSubmissionsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Submissions for {selectedAssignment?.title}
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>File</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <Person />
                        </Avatar>
                        <Typography variant="body2">{submission.studentName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<Download />}>
                        {submission.file}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {submission.grade ? (
                        <Typography variant="body2" color="primary">
                          {submission.grade}%
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Not graded
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={submission.status} 
                        size="small" 
                        color={submission.status === 'graded' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton size="small" color="primary">
                          <Grade />
                        </IconButton>
                        <IconButton size="small" color="secondary">
                          <Visibility />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmissionsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="add assignment"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setDialogOpen(true)}
      >
        <Add />
      </Fab>
    </Box>
  );
} 