import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  LocalLibrary,
  Book,
  People,
  TrendingUp,
  Assignment,
  Schedule,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div" color={color}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const LibraryDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 15420,
    issuedBooks: 890,
    availableBooks: 14530,
    totalMembers: 1250,
    overdueBooks: 23,
    newArrivals: 45
  });

  const [recentActivities] = useState([
    { id: 1, activity: 'Book issued: "Physics Fundamentals"', member: 'John Doe', time: '2 hours ago' },
    { id: 2, activity: 'Book returned: "Mathematics Vol 1"', member: 'Jane Smith', time: '3 hours ago' },
    { id: 3, activity: 'New member registered', member: 'Mike Johnson', time: '5 hours ago' },
    { id: 4, activity: 'Book reserved: "Chemistry Basics"', member: 'Sarah Wilson', time: '1 day ago' },
  ]);

  const [popularBooks] = useState([
    { title: 'Physics Fundamentals', author: 'Dr. Smith', issued: 45 },
    { title: 'Mathematics Advanced', author: 'Prof. Johnson', issued: 38 },
    { title: 'Chemistry Basics', author: 'Dr. Wilson', issued: 32 },
    { title: 'Biology Essentials', author: 'Prof. Brown', issued: 28 },
  ]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Library Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage library resources, track book issues, and monitor member activities.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Books"
            value={stats.totalBooks.toLocaleString()}
            icon={<Book sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Issued Books"
            value={stats.issuedBooks}
            icon={<Assignment sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Available Books"
            value={stats.availableBooks.toLocaleString()}
            icon={<LocalLibrary sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon={<People sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Overdue Books"
            value={stats.overdueBooks}
            icon={<Schedule sx={{ fontSize: 40 }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="New Arrivals"
            value={stats.newArrivals}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="secondary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <Stack spacing={2}>
                {recentActivities.map((activity) => (
                  <Box key={activity.id}>
                    <Typography variant="body2" fontWeight={500}>
                      {activity.activity}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Member: {activity.member} • {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View All Activities
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Popular Books */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Popular Books
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Author</TableCell>
                      <TableCell align="right">Issues</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {popularBooks.map((book, index) => (
                      <TableRow key={index}>
                        <TableCell>{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell align="right">
                          <Chip label={book.issued} size="small" color="primary" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View All Books
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Book />}
                    onClick={() => window.location.href = '/library/books'}
                  >
                    Manage Books
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<People />}
                    onClick={() => window.location.href = '/library/members'}
                  >
                    Manage Members
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Assignment />}
                    onClick={() => window.location.href = '/library/issue-return'}
                  >
                    Issue/Return Books
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<TrendingUp />}
                    onClick={() => window.location.href = '/reports'}
                  >
                    View Reports
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LibraryDashboard; 