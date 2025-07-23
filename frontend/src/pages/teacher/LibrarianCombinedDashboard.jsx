import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert, Chip, Tabs, Tab } from '@mui/material';
import { LibraryBooks, Refresh, Book, Group, Assessment } from '@mui/icons-material';
import { api } from '../../services/api';

const LibrarianCombinedDashboard = () => {
  const [tab, setTab] = useState(0);
  const [books, setBooks] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksRes, borrowedRes, statsRes] = await Promise.all([
        api.get('/library/books'), // Example endpoint
        api.get('/library/borrowed'),
        api.get('/library/stats'),
      ]);
      setBooks(booksRes.data.data || []);
      setBorrowed(borrowedRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (err) {
      setError('Failed to fetch library data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      <Button startIcon={<Refresh />} onClick={fetchData} sx={{ mb: 2 }}>
        Refresh
      </Button>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Books" icon={<Book />} />
        <Tab label="Borrowed" icon={<Group />} />
        <Tab label="Stats" icon={<Assessment />} />
      </Tabs>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {tab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>All Books</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Author</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book._id}>
                        <TableCell>{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell><Chip label={book.status} color={book.status === 'Available' ? 'success' : 'default'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {books.length === 0 && <Typography>No books found.</Typography>}
              </CardContent>
            </Card>
          )}
          {tab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Borrowed Books</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Book</TableCell>
                      <TableCell>Borrower</TableCell>
                      <TableCell>Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {borrowed.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell>{entry.bookTitle}</TableCell>
                        <TableCell>{entry.borrowerName}</TableCell>
                        <TableCell>{entry.dueDate ? new Date(entry.dueDate).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {borrowed.length === 0 && <Typography>No borrowed books found.</Typography>}
              </CardContent>
            </Card>
          )}
          {tab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Library Stats</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined"><CardContent><Typography>Total Books</Typography><Typography variant="h5">{stats?.totalBooks ?? '-'}</Typography></CardContent></Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined"><CardContent><Typography>Borrowed</Typography><Typography variant="h5">{stats?.borrowed ?? '-'}</Typography></CardContent></Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined"><CardContent><Typography>Available</Typography><Typography variant="h5">{stats?.available ?? '-'}</Typography></CardContent></Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default LibrarianCombinedDashboard; 