import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Psychology as PsychologyIcon,
  SportsEsports as SportsIcon,
  MusicNote as MusicIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const OverallProgress = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState('panel1');
  const { user } = useAuth();

  useEffect(() => {
    fetchProgressData();
  }, [selectedPeriod]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const params = { academicYear: '2024-25' };
      if (selectedPeriod !== 'current') {
        params.assessmentPeriod = selectedPeriod;
      }

      const [progressResponse, analyticsResponse] = await Promise.all([
        studentAPI.getMyProgress(params),
        studentAPI.getMyAnalytics(params)
      ]);

      setProgressData(progressResponse.data || []);
      setAnalytics(analyticsResponse.data || {});
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'Improving':
        return <TrendingUpIcon color="success" />;
      case 'Declining':
        return <TrendingDownIcon color="error" />;
      default:
        return <TimelineIcon color="info" />;
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'success';
      case 'B+':
      case 'B':
        return 'primary';
      case 'C+':
      case 'C':
        return 'warning';
      default:
        return 'error';
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Excellent':
        return 'success';
      case 'Good':
        return 'primary';
      case 'Satisfactory':
        return 'warning';
      case 'Needs Improvement':
      case 'Poor':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRatingScore = (rating) => {
    const ratings = {
      'Excellent': 5,
      'Good': 4,
      'Satisfactory': 3,
      'Needs Improvement': 2,
      'Poor': 1
    };
    return ratings[rating] || 3;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const latestProgress = progressData[0];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Overall Progress Report
      </Typography>

      {/* Period Selection */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Assessment Period</InputLabel>
          <Select
            value={selectedPeriod}
            label="Assessment Period"
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <MenuItem value="current">Current Period</MenuItem>
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="Quarterly">Quarterly</MenuItem>
            <MenuItem value="Half-Yearly">Half-Yearly</MenuItem>
            <MenuItem value="Annual">Annual</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {latestProgress ? (
        <>
          {/* Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <SchoolIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        {latestProgress.academicPerformance.overallPercentage}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Overall Grade: {latestProgress.academicPerformance.overallGrade}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <CalendarIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        {latestProgress.attendance.percentage}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Attendance Rate
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <PsychologyIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        {latestProgress.behavior.overallRating}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Behavior Rating
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrophyIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        {latestProgress.academicPerformance.rank || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Class Rank
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Progress Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Academic Performance" />
              <Tab label="Attendance & Behavior" />
              <Tab label="Skills & Activities" />
              <Tab label="Analytics & Trends" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {selectedTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Subject-wise Performance
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Subject</TableCell>
                          <TableCell>Grade</TableCell>
                          <TableCell>Percentage</TableCell>
                          <TableCell>Improvement</TableCell>
                          <TableCell>Remarks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {latestProgress.academicPerformance.subjects.map((subject, index) => (
                          <TableRow key={index}>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={subject.grade}
                                color={getGradeColor(subject.grade)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{subject.percentage}%</TableCell>
                            <TableCell>
                              <Chip
                                label={subject.improvement}
                                color={getRatingColor(subject.improvement)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{subject.teacherRemarks || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {selectedTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Attendance Details
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Total Days"
                          secondary={latestProgress.attendance.totalDays}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Days Present"
                          secondary={latestProgress.attendance.daysPresent}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Days Absent"
                          secondary={latestProgress.attendance.daysAbsent}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Late Arrivals"
                          secondary={latestProgress.attendance.lateArrivals}
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Behavior Assessment
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Punctuality"
                          secondary={
                            <Chip
                              label={latestProgress.behavior.punctuality}
                              color={getRatingColor(latestProgress.behavior.punctuality)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Discipline"
                          secondary={
                            <Chip
                              label={latestProgress.behavior.discipline}
                              color={getRatingColor(latestProgress.behavior.discipline)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Participation"
                          secondary={
                            <Chip
                              label={latestProgress.behavior.participation}
                              color={getRatingColor(latestProgress.behavior.participation)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Teamwork"
                          secondary={
                            <Chip
                              label={latestProgress.behavior.teamwork}
                              color={getRatingColor(latestProgress.behavior.teamwork)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              )}

              {selectedTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Skills Assessment
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      {Object.entries(latestProgress.skills || {}).map(([skill, rating]) => (
                        <Box key={skill} sx={{ mb: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                              {skill.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                            <Rating
                              value={getRatingScore(rating)}
                              readOnly
                              size="small"
                            />
                          </Box>
                          <Chip
                            label={rating}
                            color={getRatingColor(rating)}
                            size="small"
                          />
                        </Box>
                      ))}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Co-curricular Activities
                    </Typography>
                    <Accordion expanded={expandedAccordion === 'panel1'} onChange={handleAccordionChange('panel1')}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <SportsIcon sx={{ mr: 1 }} />
                        <Typography>Sports</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Typography variant="body2">
                            Participated: {latestProgress.coCurricular.sports.participated ? 'Yes' : 'No'}
                          </Typography>
                          {latestProgress.coCurricular.sports.achievements.length > 0 && (
                            <Typography variant="body2">
                              Achievements: {latestProgress.coCurricular.sports.achievements.join(', ')}
                            </Typography>
                          )}
                          <Chip
                            label={latestProgress.coCurricular.sports.rating}
                            color={getRatingColor(latestProgress.coCurricular.sports.rating)}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={expandedAccordion === 'panel2'} onChange={handleAccordionChange('panel2')}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <MusicIcon sx={{ mr: 1 }} />
                        <Typography>Cultural</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Typography variant="body2">
                            Participated: {latestProgress.coCurricular.cultural.participated ? 'Yes' : 'No'}
                          </Typography>
                          {latestProgress.coCurricular.cultural.achievements.length > 0 && (
                            <Typography variant="body2">
                              Achievements: {latestProgress.coCurricular.cultural.achievements.join(', ')}
                            </Typography>
                          )}
                          <Chip
                            label={latestProgress.coCurricular.cultural.rating}
                            color={getRatingColor(latestProgress.coCurricular.cultural.rating)}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={expandedAccordion === 'panel3'} onChange={handleAccordionChange('panel3')}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <ScienceIcon sx={{ mr: 1 }} />
                        <Typography>Academic</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Typography variant="body2">
                            Participated: {latestProgress.coCurricular.academic.participated ? 'Yes' : 'No'}
                          </Typography>
                          {latestProgress.coCurricular.academic.achievements.length > 0 && (
                            <Typography variant="body2">
                              Achievements: {latestProgress.coCurricular.academic.achievements.join(', ')}
                            </Typography>
                          )}
                          <Chip
                            label={latestProgress.coCurricular.academic.rating}
                            color={getRatingColor(latestProgress.coCurricular.academic.rating)}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </Grid>
              )}

              {selectedTab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Progress Trends
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                        {getTrendIcon(analytics.academicTrend)}
                        <Typography variant="body1" sx={{ ml: 1 }}>
                          Academic Progress: {analytics.academicTrend}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                        {getTrendIcon(analytics.attendanceTrend)}
                        <Typography variant="body1" sx={{ ml: 1 }}>
                          Attendance: {analytics.attendanceTrend}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        {getTrendIcon(analytics.behaviorTrend)}
                        <Typography variant="body1" sx={{ ml: 1 }}>
                          Behavior: {analytics.behaviorTrend}
                        </Typography>
                      </Box>
                    </Box>

                    {analytics.recommendations && analytics.recommendations.length > 0 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Recommendations
                        </Typography>
                        <List>
                          {analytics.recommendations.map((recommendation, index) => (
                            <ListItem key={index}>
                              <ListItemAvatar>
                                <CheckCircleIcon color="primary" />
                              </ListItemAvatar>
                              <ListItemText primary={recommendation} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Skills Radar Chart
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={Object.entries(analytics.skillsDevelopment || {}).map(([skill, data]) => ({
                        subject: skill,
                        A: data.score,
                        fullMark: 5,
                      }))}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Radar name="Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Paper>

          {/* Goals and Targets */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Goals and Targets
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="primary">
                      Academic Goals
                    </Typography>
                    <Typography variant="body2">
                      {latestProgress.goals.academic.currentTarget || 'No specific target set'}
                    </Typography>
                    <Chip
                      label={latestProgress.goals.academic.achieved ? 'Achieved' : 'In Progress'}
                      color={latestProgress.goals.academic.achieved ? 'success' : 'warning'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="primary">
                      Behavioral Goals
                    </Typography>
                    <Typography variant="body2">
                      {latestProgress.goals.behavioral.currentTarget || 'No specific target set'}
                    </Typography>
                    <Chip
                      label={latestProgress.goals.behavioral.achieved ? 'Achieved' : 'In Progress'}
                      color={latestProgress.goals.behavioral.achieved ? 'success' : 'warning'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" color="primary">
                      Personal Goals
                    </Typography>
                    <Typography variant="body2">
                      {latestProgress.goals.personal.currentTarget || 'No specific target set'}
                    </Typography>
                    <Chip
                      label={latestProgress.goals.personal.achieved ? 'Achieved' : 'In Progress'}
                      color={latestProgress.goals.personal.achieved ? 'success' : 'warning'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      ) : (
        <Alert severity="info">
          No progress data available for the selected period. Please check back later.
        </Alert>
      )}
    </Box>
  );
};

export default OverallProgress; 