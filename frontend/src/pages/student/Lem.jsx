import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  School,
  Assignment,
  Book,
  VideoLibrary,
  Quiz,
  Star,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';

const Lem = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const [modulesResponse, progressResponse] = await Promise.all([
        studentService.getLearningModules(),
        studentService.getLearningProgress(),
      ]);
      setModules(modulesResponse.data);
      setProgress(progressResponse.data);
    } catch {
      toast.error('Failed to load learning modules');
    } finally {
      setLoading(false);
    }
  };

  const handleStartModule = async (moduleId) => {
    try {
      await studentService.startLearningModule(moduleId);
      toast.success('Module started successfully');
      fetchModules();
    } catch {
      toast.error('Failed to start module');
    }
  };

  const handleCompleteActivity = async (moduleId, activityId) => {
    try {
      await studentService.completeLearningActivity(moduleId, activityId);
      toast.success('Activity completed successfully');
      fetchModules();
    } catch {
      toast.error('Failed to complete activity');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'reading':
        return <Book />;
      case 'video':
        return <VideoLibrary />;
      case 'quiz':
        return <Quiz />;
      case 'assignment':
        return <Assignment />;
      default:
        return <School />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in_progress':
        return <Pending color="warning" />;
      default:
        return <Star color="disabled" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Learning Experience
      </Typography>

      <Grid container spacing={3}>
        {modules.map((module) => (
          <Grid item xs={12} md={6} key={module.id}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{module.title}</Typography>
                <Chip
                  label={`${progress[module.id]?.percentage || 0}% Complete`}
                  color="primary"
                />
              </Box>

              <LinearProgress
                variant="determinate"
                value={progress[module.id]?.percentage || 0}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="textSecondary" paragraph>
                {module.description}
              </Typography>

              <List>
                {module.activities.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getActivityIcon(activity.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {activity.description}
                            </Typography>
                            <Box mt={1}>
                              <Chip
                                icon={getStatusIcon(activity.status)}
                                label={activity.status}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={`${activity.duration} mins`}
                                size="small"
                              />
                            </Box>
                          </Box>
                        }
                      />
                      {activity.status === 'not_started' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleStartModule(module.id)}
                        >
                          Start
                        </Button>
                      )}
                      {activity.status === 'in_progress' && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleCompleteActivity(module.id, activity.id)}
                        >
                          Complete
                        </Button>
                      )}
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Learning Objectives:
                </Typography>
                <List dense>
                  {module.objectives.map((objective, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={objective} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Lem; 