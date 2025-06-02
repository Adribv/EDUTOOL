import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Event,
  Book,
  Group,
  CheckCircle,
  Warning,
  Close,
  Edit,
  Save,
  Cancel,
  Add,
  Download,
  Upload,
  Assessment,
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Exams = () => {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedExam, setEditedExam] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    subject: '',
    class: '',
    section: '',
    date: '',
    time: '',
    duration: '',
    totalMarks: '',
    type: 'Regular',
    room: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getExams();
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleViewExam = async (exam) => {
    try {
      const response = await teacherAPI.getExamResults(exam.id);
      setSelectedExam(exam);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching exam results:', error);
      toast.error('Failed to load exam results');
    }
  };

  const handleGradeExam = async (resultId, grade, remarks) => {
    try {
      await teacherAPI.gradeExam(resultId, { grade, remarks });
      toast.success('Grade submitted successfully');
      handleViewExam(selectedExam);
    } catch (error) {
      console.error('Error submitting grade:', error);
      toast.error('Failed to submit grade');
    }
  };

  const handleEditExam = (exam) => {
    setEditedExam(exam);
    setEditMode(true);
  };

  const handleSaveExam = async () => {
    try {
      await teacherAPI.updateExam(editedExam.id, editedExam);
      toast.success('Exam updated successfully');
      setEditMode(false);
      setEditedExam(null);
      fetchData();
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Failed to update exam');
    }
  };

  const handleCreateExam = async () => {
    try {
      await teacherAPI.createExam(newExam);
      toast.success('Exam created successfully');
      setCreateDialog(false);
      setNewExam({
        title: '',
        subject: '',
        class: '',
        section: '',
        date: '',
        time: '',
        duration: '',
        totalMarks: '',
        type: 'Regular',
        room: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Failed to create exam');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedExam(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Exams
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialog(true)}
        >
          Create Exam
        </Button>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{ mb: 3 }}
      >
        <Tab label="All Exams" />
        <Tab label="Upcoming Exams" />
        <Tab label="Completed Exams" />
      </Tabs>

      <Grid container spacing={3}>
        {exams
          .filter(exam => {
            if (selectedTab === 1) return exam.status === 'Upcoming';
            if (selectedTab === 2) return exam.status === 'Completed';
            return true;
          })
          .map((exam) => (
            <Grid item xs={12} md={6} key={exam.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {exam.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Book sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {exam.subject} - {exam.class} {exam.section}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Event sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {new Date(exam.date).toLocaleDateString()} at {exam.time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Assessment sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          Duration: {exam.duration} | Room: {exam.room}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Chip
                        icon={<Group />}
                        label={`${exam.students} students`}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Chip
                        label={exam.status}
                        color={exam.status === 'Upcoming' ? 'warning' : 'success'}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleViewExam(exam)}
                    >
                      View Results
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditExam(exam)}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Results Dialog */}
      <Dialog
        open={!!selectedExam}
        onClose={() => setSelectedExam(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedExam && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedExam.title} - Results
                </Typography>
                <IconButton onClick={() => setSelectedExam(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Rank</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>{result.studentName}</TableCell>
                        <TableCell>{result.score}</TableCell>
                        <TableCell>
                          <Chip
                            label={result.grade}
                            color={
                              result.grade === 'A' ? 'success' :
                              result.grade === 'B' ? 'primary' :
                              result.grade === 'C' ? 'info' :
                              result.grade === 'D' ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{result.rank}</TableCell>
                        <TableCell>{result.remarks || '-'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {result.status !== 'Graded' && (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                  const score = prompt('Enter score:');
                                  const remarks = prompt('Enter remarks:');
                                  if (score && remarks) {
                                    handleGradeExam(result.id, score, remarks);
                                  }
                                }}
                              >
                                Grade
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Download />}
                              onClick={() => window.open(result.reportUrl)}
                            >
                              Report
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedExam(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog
        open={editMode}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        {editedExam && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Edit Exam</Typography>
                <IconButton onClick={handleCancelEdit}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    fullWidth
                    value={editedExam.title}
                    onChange={(e) => setEditedExam({ ...editedExam, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Subject"
                    fullWidth
                    value={editedExam.subject}
                    onChange={(e) => setEditedExam({ ...editedExam, subject: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Class"
                    fullWidth
                    value={editedExam.class}
                    onChange={(e) => setEditedExam({ ...editedExam, class: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Section"
                    fullWidth
                    value={editedExam.section}
                    onChange={(e) => setEditedExam({ ...editedExam, section: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date"
                    type="date"
                    fullWidth
                    value={editedExam.date}
                    onChange={(e) => setEditedExam({ ...editedExam, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Time"
                    type="time"
                    fullWidth
                    value={editedExam.time}
                    onChange={(e) => setEditedExam({ ...editedExam, time: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Duration (minutes)"
                    type="number"
                    fullWidth
                    value={editedExam.duration}
                    onChange={(e) => setEditedExam({ ...editedExam, duration: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Total Marks"
                    type="number"
                    fullWidth
                    value={editedExam.totalMarks}
                    onChange={(e) => setEditedExam({ ...editedExam, totalMarks: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Room"
                    fullWidth
                    value={editedExam.room}
                    onChange={(e) => setEditedExam({ ...editedExam, room: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={editedExam.type}
                      label="Type"
                      onChange={(e) => setEditedExam({ ...editedExam, type: e.target.value })}
                    >
                      <MenuItem value="Regular">Regular</MenuItem>
                      <MenuItem value="Midterm">Midterm</MenuItem>
                      <MenuItem value="Final">Final</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelEdit}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSaveExam}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Exam Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create Exam</Typography>
            <IconButton onClick={() => setCreateDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={newExam.title}
                onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Subject"
                fullWidth
                value={newExam.subject}
                onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Class"
                fullWidth
                value={newExam.class}
                onChange={(e) => setNewExam({ ...newExam, class: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Section"
                fullWidth
                value={newExam.section}
                onChange={(e) => setNewExam({ ...newExam, section: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={newExam.date}
                onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                value={newExam.time}
                onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration (minutes)"
                type="number"
                fullWidth
                value={newExam.duration}
                onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Marks"
                type="number"
                fullWidth
                value={newExam.totalMarks}
                onChange={(e) => setNewExam({ ...newExam, totalMarks: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Room"
                fullWidth
                value={newExam.room}
                onChange={(e) => setNewExam({ ...newExam, room: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newExam.type}
                  label="Type"
                  onChange={(e) => setNewExam({ ...newExam, type: e.target.value })}
                >
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Midterm">Midterm</MenuItem>
                  <MenuItem value="Final">Final</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateExam}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Exams; 