import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SentimentDissatisfied } from '@mui/icons-material';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <SentimentDissatisfied sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => navigate('/')}
        sx={{ mt: 2 }}
      >
        Go to Homepage
      </Button>
    </Box>
  );
}

export default NotFound; 