import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';

// Helper to extract YouTube video ID and thumbnail
const getYoutubeThumbnail = (url) => {
  if (!url) return null;
  const regex = /(?:[\?&]v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/0.jpg`;
  }
  return null;
};

const LessonPlans = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await studentService.getLessonPlans();
        setPlans(res.data || res);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load lesson plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Lesson Plans</Typography>
      {plans.length === 0 && (
        <Typography>No lesson plans available for your class yet.</Typography>
      )}
      <Grid container spacing={3}>
        {plans.map((plan) => {
          const thumb = getYoutubeThumbnail(plan.videoLink);
          return (
            <Grid item xs={12} sm={6} md={4} key={plan._id}>
              <Card onClick={() => setSelectedPlan(plan)} sx={{ cursor: 'pointer' }}>
                {thumb && (
                  <CardMedia component="img" height="180" image={thumb} alt={plan.title} />
                )}
                <CardContent>
                  <Typography variant="h6">{plan.title}</Typography>
                  <Box mt={1}>
                    <Chip label={plan.subject} size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Preview dialog */}
      <Dialog open={Boolean(selectedPlan)} onClose={() => setSelectedPlan(null)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedPlan?.title}</DialogTitle>
        <DialogContent>
          {selectedPlan?.videoLink ? (
            <Box component="iframe" width="100%" height="400" src={selectedPlan.videoLink.replace('watch?v=', 'embed/')} title="Video" />
          ) : selectedPlan?.pdfUrl ? (
            <Box component="iframe" src={`/${selectedPlan.pdfUrl}`} width="100%" height="400" />
          ) : (
            <Typography>No preview available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPlan(null)}>Close</Button>
          {selectedPlan?.pdfUrl && (
            <Button variant="contained" component="a" href={`/${selectedPlan.pdfUrl}`} download>
              Download Notes
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonPlans; 