import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  ArrowBack,
  Person,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import parentService from '../../services/parentService';

const StudentDetails = () => {
  const { rollNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchStudentData();
  }, [rollNumber]);

  const fetchStudentData = async () => {
    try {
      console.log('🔍 Fetching student data for rollNumber:', rollNumber);
      
      // Get student profile
      const studentRes = await parentService.getChildDetails(rollNumber);
      console.log('✅ Student data:', studentRes);
      console.log('✅ Student name:', studentRes?.name);
      console.log('✅ Student object keys:', Object.keys(studentRes || {}));
      console.log('✅ Student data type:', typeof studentRes);
      console.log('✅ Is studentRes an object:', studentRes && typeof studentRes === 'object');
      
      // Check if the response has a data property (common API pattern)
      const actualStudentData = studentRes?.data || studentRes;
      console.log('✅ Actual student data:', actualStudentData);
      console.log('✅ Actual student name:', actualStudentData?.name);
      
      setStudent(actualStudentData);

      // Get attendance data
      try {
        const attendanceRes = await parentService.getChildAttendance(rollNumber);
        console.log('✅ Attendance data:', attendanceRes);
        console.log('✅ Attendance records:', attendanceRes.records);
        console.log('✅ Attendance statistics:', attendanceRes.statistics);
        setAttendance(attendanceRes.records || []);
      } catch (error) {
        console.log('⚠️ No attendance data available');
        console.error('❌ Attendance error:', error);
        setAttendance([]);
      }

      // Get assignments data
      try {
        const assignmentsRes = await parentService.getChildAssignments(rollNumber);
        console.log('✅ Assignments data:', assignmentsRes);
        setAssignments(assignmentsRes || []);
      } catch {
        console.log('⚠️ No assignments data available');
        setAssignments([]);
      }

    } catch (err) {
      console.error('❌ Error fetching student data:', err);
      console.error('❌ Error response:', err.response?.data);
      setError('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box p={3}>
        <Alert severity="error">Student not found</Alert>
      </Box>
    );
  }

  // Ensure student has required fields
  if (!student.name) {
    return (
      <Box p={3}>
        <Alert severity="error">Student data is incomplete - name is missing</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button 
          variant="outlined" 
          onClick={async () => {
            try {
              console.log('🧪 Testing attendance API for rollNumber:', rollNumber);
              const response = await parentService.getChildAttendance(rollNumber);
              console.log('✅ Attendance API Response:', response);
              alert(`Attendance API Test: Found ${response.records?.length || 0} records`);
            } catch (error) {
              console.error('❌ Attendance API Error:', error);
              alert('Attendance API Error: ' + (error.response?.data?.message || error.message));
            }
          }}
        >
          Test Attendance API
        </Button>
      </Box>
      
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Student Details
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ width: 80, height: 80, mr: 2 }} src={student.profilePhoto}>
                {student.name ? student.name.charAt(0) : '?'}
              </Avatar>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {student.name || 'Unknown Student'}
                </Typography>
                <Chip 
                  label={student.status || 'Active'} 
                  color={student.status === 'Active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Academic Information
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Class:</strong> {student.class}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Section:</strong> {student.section}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Roll Number:</strong> {student.rollNumber}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Admission Date:</strong> {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            {student.email && (
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {student.email}
              </Typography>
            )}
            {student.contactNumber && (
              <Typography variant="body1" gutterBottom>
                <strong>Contact:</strong> {student.contactNumber}
              </Typography>
            )}
            {student.gender && (
              <Typography variant="body1" gutterBottom>
                <strong>Gender:</strong> {student.gender}
              </Typography>
            )}
            {student.dateOfBirth && (
              <Typography variant="body1" gutterBottom>
                <strong>Date of Birth:</strong> {new Date(student.dateOfBirth).toLocaleDateString()}
              </Typography>
            )}
          </Grid>
        </Grid>

        {student.address && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Address
            </Typography>
            <Typography variant="body1">
              {student.address.street && `${student.address.street}, `}
              {student.address.city && `${student.address.city}, `}
              {student.address.state && `${student.address.state}, `}
              {student.address.postalCode && `${student.address.postalCode}, `}
              {student.address.country}
            </Typography>
          </Box>
        )}

        {student.emergencyContact && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Emergency Contact
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Name:</strong> {student.emergencyContact.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Relationship:</strong> {student.emergencyContact.relationship}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Contact:</strong> {student.emergencyContact.contactNumber}
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab icon={<SchoolIcon />} label="Attendance" />
          <Tab icon={<AssignmentIcon />} label="Assignments" />
        </Tabs>

        {selectedTab === 0 && (
          <Box>
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Debug Info: Attendance records loaded: {attendance.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Roll Number: {rollNumber}
              </Typography>
            </Box>
            
            {attendance.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendance.slice(0, 10).map((record, index) => (
                      <TableRow key={record._id || index}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status} 
                            color={record.status === 'Present' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{record.remarks || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ textAlign: 'center', p: 3 }}>
                No attendance records available. This could be because:
                <br />
                1. No attendance has been marked for this student
                <br />
                2. The parent is not linked to this student
                <br />
                3. There's an issue with the API connection
              </Typography>
            )}
          </Box>
        )}

        {selectedTab === 1 && (
          <Box>
            {assignments.length > 0 ? (
              <Grid container spacing={2}>
                {assignments.slice(0, 6).map((assignment, index) => (
                  <Grid item xs={12} sm={6} md={4} key={assignment._id || index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {assignment.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Subject: {assignment.subject}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Typography>
                        <Chip 
                          label={assignment.submissionStatus || 'Not Submitted'} 
                          color={
                            assignment.submissionStatus === 'Not Submitted' ? 'warning' :
                            assignment.submissionStatus === 'Late' ? 'error' : 'success'
                          }
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography sx={{ textAlign: 'center', p: 3 }}>
                No assignments available
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StudentDetails; 