import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, Button, Chip } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import FlagIcon from '@mui/icons-material/Flag';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import LockIcon from '@mui/icons-material/Lock';

export default function CounselorDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <SecurityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h4" fontWeight={700}>Counselor Dashboard</Typography>
        <Chip label="Secured" color="success" sx={{ ml: 2 }} />
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Flagged Students" icon={<FlagIcon />} />
        <Tab label="Add Notes/Reports" icon={<NoteAddIcon />} />
        <Tab label="Confidential Updates" icon={<LockIcon />} />
      </Tabs>
      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6">Flagged Students</Typography>
            {/* Flagged students list here */}
            <Button variant="contained" color="primary" sx={{ mt: 2 }}>View Flagged</Button>
          </CardContent>
        </Card>
      )}
      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6">Add Notes/Reports</Typography>
            {/* Add notes/reports form here */}
            <Button variant="contained" color="warning" sx={{ mt: 2 }}>Add Note</Button>
          </CardContent>
        </Card>
      )}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6">Confidential Updates</Typography>
            {/* Confidential updates here */}
            <Button variant="contained" color="success" sx={{ mt: 2 }}>View Updates</Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 