import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Chip, Paper } from '@mui/material';
import { Assessment, Refresh, Lock, LockOpen, Check, Close, BarChart, School, Visibility as VisibilityIcon, Security as SecurityIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import { usePermission } from '../../components/PermissionGuard';
import { useNavigate } from 'react-router-dom';

const ExaminerDashboard = () => {
  const navigate = useNavigate();
  const { canView, canEdit, loading: permissionLoading, error: permissionError, dashboardName } = usePermission('examiner');
  const [tab, setTab] = useState(0);
  // Timetable state
  const [timetables, setTimetables] = useState([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  // Exam papers state
  const [examPapers, setExamPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  // Grading state
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [markSheet, setMarkSheet] = useState([]);
  const [loadingMarkSheet, setLoadingMarkSheet] = useState(false);
  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  // Transcript state
  const [studentId, setStudentId] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  // Dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);
  // Additional state for all data
  const [allTimetables, setAllTimetables] = useState([]);
  const [allExams, setAllExams] = useState([]);
  const [allExamPapers, setAllExamPapers] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Fetch exam timetables
  const fetchTimetables = async () => {
    setLoadingTimetable(true);
    try {
      const res = await api.get('/teachers/exam-timetable');
      setTimetables(res.data || []);
    } catch {
      setTimetables([]);
    } finally {
      setLoadingTimetable(false);
    }
  };

  // Fetch exam papers
  const fetchExamPapers = async () => {
    setLoadingPapers(true);
    try {
      const res = await api.get('/teachers/exams/papers');
      setExamPapers(res.data || []);
    } catch {
      setExamPapers([]);
    } finally {
      setLoadingPapers(false);
    }
  };

  // Fetch exams for grading
  const fetchExams = async () => {
    try {
      const res = await api.get('/teachers/exams/all');
      setExams(res.data || []);
    } catch {
      setExams([]);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async (examId) => {
    setLoadingAnalytics(true);
    try {
      const res = await api.get(`/teachers/exams/analytics?examId=${examId}`);
      setAnalytics(res.data.data);
    } catch {
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Fetch transcript
  const fetchTranscript = async () => {
    setLoadingTranscript(true);
    try {
      const res = await api.post('/teachers/exams/transcript', { studentId });
      setTranscript(res.data.data || []);
    } catch {
      setTranscript([]);
    } finally {
      setLoadingTranscript(false);
    }
  };

  // Fetch all exam-related data
  const fetchAllExamData = async () => {
    try {
      const [tt, ex, ep, st] = await Promise.all([
        api.get('/teachers/exam-timetables'),
        api.get('/teachers/all-exams'),
        api.get('/teachers/all-exam-papers'),
        api.get('/teachers/all-staff'),
      ]);
      setAllTimetables(tt.data.data || []);
      setAllExams(ex.data.data || []);
      setAllExamPapers(ep.data.data || []);
      setAllStaff(st.data.data || []);
    } catch (err) {
      setAllTimetables([]);
      setAllExams([]);
      setAllExamPapers([]);
      setAllStaff([]);
    }
  };

  useEffect(() => {
    if (tab === 0 || tab === 1) fetchTimetables();
    if (tab === 2) fetchExamPapers();
    if (tab === 3) fetchExams();
    fetchAllExamData();
  }, [tab]);

  // Show loading while permissions are being fetched
  if (permissionLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading permissions...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Show error if permissions failed to load
  if (permissionError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <SecurityIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Permission Error
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {permissionError}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // Show access denied if no view permission
  if (!canView) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <SecurityIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You don't have permission to view the {dashboardName}.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please contact your administrator for access.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // UI for each tab
  return (
    <Box>
      {/* Header with permission indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>Examiner Dashboard</Typography>
        {!canEdit && (
          <Chip 
            icon={<VisibilityIcon />} 
            label="View Only" 
            color="warning" 
            variant="outlined"
          />
        )}
      </Box>
      
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Exam Timetable" />
        <Tab label="Invigilation & Room" />
        <Tab label="Grading" />
      </Tabs>
      {/* Tab 0: Exam Timetable */}
      {tab === 0 && (
        <Card><CardContent>
          <Typography variant="h6">All Exam Timetables</Typography>
          <Table><TableHead><TableRow>
            <TableCell>Exam</TableCell><TableCell>Date</TableCell><TableCell>Start</TableCell><TableCell>End</TableCell><TableCell>Room</TableCell><TableCell>Invigilator</TableCell><TableCell>Status</TableCell>
          </TableRow></TableHead><TableBody>
            {allTimetables.map(t => (
              <TableRow key={t._id}>
                <TableCell>{t.examName}</TableCell>
                <TableCell>{t.examDate ? new Date(t.examDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{t.startTime}</TableCell>
                <TableCell>{t.endTime}</TableCell>
                <TableCell>{t.room}</TableCell>
                <TableCell>{t.invigilator}</TableCell>
                <TableCell>{t.status}</TableCell>
              </TableRow>
            ))}
          </TableBody></Table>
        </CardContent></Card>
      )}
      {/* Tab 1: Invigilation & Room Allotment */}
      {tab === 1 && (
        <Card><CardContent>
          <Typography variant="h6">Assign Invigilators & Rooms</Typography>
          {updateSuccess && <Alert severity="success" onClose={() => setUpdateSuccess('')}>{updateSuccess}</Alert>}
          {updateError && <Alert severity="error" onClose={() => setUpdateError('')}>{updateError}</Alert>}
          <Table><TableHead><TableRow>
            <TableCell>Exam</TableCell><TableCell>Date</TableCell><TableCell>Room</TableCell><TableCell>Invigilator</TableCell>
            {canEdit && <TableCell>Actions</TableCell>}
          </TableRow></TableHead><TableBody>
            {allTimetables.map(t => (
              <TableRow key={t._id}>
                <TableCell>{t.examName}</TableCell>
                <TableCell>{t.examDate ? new Date(t.examDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  {canEdit ? (
                    <TextField size="small" defaultValue={t.room} onBlur={async (e) => {
                      const newRoom = e.target.value;
                      if (newRoom !== t.room) {
                        setUpdateLoading(true);
                        try {
                          await api.put(`/teachers/exam-timetable/${t._id}`, { room: newRoom });
                          setUpdateSuccess('Room updated');
                          fetchAllExamData();
                        } catch (err) {
                          setUpdateError('Failed to update room');
                        } finally {
                          setUpdateLoading(false);
                        }
                      }
                    }} />
                  ) : (
                    t.room
                  )}
                </TableCell>
                <TableCell>
                  {canEdit ? (
                    <Select size="small" defaultValue={t.invigilator} onChange={async (e) => {
                      const newInv = e.target.value;
                      if (newInv !== t.invigilator) {
                        setUpdateLoading(true);
                        try {
                          await api.put(`/teachers/exam-timetable/${t._id}`, { invigilator: newInv });
                          setUpdateSuccess('Invigilator updated');
                          fetchAllExamData();
                        } catch (err) {
                          setUpdateError('Failed to update invigilator');
                        } finally {
                          setUpdateLoading(false);
                        }
                      }
                    }} style={{ minWidth: 120 }}>
                      {allStaff.map(staff => (
                        <MenuItem key={staff.name} value={staff.name}>{staff.name}</MenuItem>
                      ))}
                    </Select>
                  ) : (
                    t.invigilator
                  )}
                </TableCell>
                {canEdit && (
                  <TableCell>{updateLoading ? <CircularProgress size={20} /> : null}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody></Table>
        </CardContent></Card>
      )}
      {/* Tab 2: Grading */}
      {tab === 2 && (
        <Card><CardContent>
          <Typography variant="h6">Student Transcript</Typography>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <TextField label="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
            <Button onClick={fetchTranscript}>Generate</Button>
          </Box>
          {loadingTranscript ? <CircularProgress /> : (
            <Table><TableHead><TableRow>
              <TableCell>Exam</TableCell><TableCell>Subject</TableCell><TableCell>Date</TableCell><TableCell>Marks</TableCell><TableCell>Grade</TableCell><TableCell>Total</TableCell>
            </TableRow></TableHead><TableBody>
              {transcript.map((t, i) => (
                <TableRow key={i}>
                  <TableCell>{t.exam}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell>{t.date ? new Date(t.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{t.marks}</TableCell>
                  <TableCell>{t.grade}</TableCell>
                  <TableCell>{t.totalMarks}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          )}
        </CardContent></Card>
      )}
    </Box>
  );
};

export default ExaminerDashboard; 