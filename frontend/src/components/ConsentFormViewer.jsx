import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty, Assignment } from '@mui/icons-material';
import { consentAPI } from '../services/api';

const ConsentFormViewer = ({ eventId, showTitle = true }) => {
  const { data: consentForm, isLoading, error } = useQuery({
    queryKey: ['consentForm', eventId],
    queryFn: () => consentAPI.getForm(eventId),
    enabled: !!eventId
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'awaitingParent': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'awaitingParent': return <HourglassEmpty />;
      case 'draft': return <Assignment />;
      default: return <Assignment />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'awaitingParent': return 'Awaiting Parent Response';
      case 'draft': return 'Draft';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !consentForm) {
    return (
      <Alert severity="info">
        No consent form available for this event yet.
      </Alert>
    );
  }

  return (
    <Box>
      {showTitle && (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5">
            Consent Form - {consentForm.title}
          </Typography>
          <Chip
            icon={getStatusIcon(consentForm.status)}
            label={getStatusLabel(consentForm.status)}
            color={getStatusColor(consentForm.status)}
            variant="outlined"
          />
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Event Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Event Information
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>School:</strong> {consentForm.schoolName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Address:</strong> {consentForm.address}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Phone:</strong> {consentForm.phone}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Event Title:</strong> {consentForm.title}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Purpose:</strong> {consentForm.purpose}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>From:</strong> {consentForm.dateFrom ? new Date(consentForm.dateFrom).toLocaleDateString() : 'TBD'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>To:</strong> {consentForm.dateTo ? new Date(consentForm.dateTo).toLocaleDateString() : 'TBD'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Departure:</strong> {consentForm.departureTime || 'TBD'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Return:</strong> {consentForm.returnTime || 'TBD'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Venue:</strong> {consentForm.venue || 'TBD'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Transport:</strong> {consentForm.transportMode || 'TBD'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Teacher In-charge:</strong> {consentForm.teacherIncharge || 'TBD'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Contact:</strong> {consentForm.teacherContact || 'TBD'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Student/Parent Details (if filled) */}
        {consentForm.status === 'completed' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Student Details
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="body2"><strong>Student Name:</strong> {consentForm.studentName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2"><strong>Class & Section:</strong> {consentForm.classSection}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2"><strong>Roll Number:</strong> {consentForm.rollNumber}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom color="primary">
                  Parent/Guardian Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="body2"><strong>Parent Name:</strong> {consentForm.parentName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2"><strong>Relationship:</strong> {consentForm.relationship}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2"><strong>Mobile:</strong> {consentForm.mobile}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2"><strong>Emergency Contact:</strong> {consentForm.emergencyContact}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom color="primary">
                  Health & Safety Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="body2"><strong>Allergies/Medical Conditions:</strong> {consentForm.allergies || 'None reported'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2"><strong>Medications:</strong> {consentForm.medication || 'None reported'}</Typography>
                  </Grid>
                </Grid>

                {consentForm.signedAt && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom color="primary">
                      Signature Details
                    </Typography>
                    <Typography variant="body2">
                      <strong>Signed on:</strong> {new Date(consentForm.signedAt).toLocaleDateString()} at {new Date(consentForm.signedAt).toLocaleTimeString()}
                    </Typography>
                    {consentForm.parentSignature && (
                      <Box sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                        <Typography variant="body2" gutterBottom>Parent Signature:</Typography>
                        <img 
                          src={consentForm.parentSignature} 
                          alt="Parent Signature" 
                          style={{ maxWidth: '200px', maxHeight: '100px', border: '1px solid #ccc' }}
                        />
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Consent Declaration */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Consent Declaration
              </Typography>
              <Typography variant="body2" sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                I, the undersigned, parent/guardian of the above-named student, hereby grant
                permission for my child to attend and participate in the aforementioned school
                trip/event. I acknowledge that I have been informed about the purpose, schedule,
                transportation, and supervision provided.
                <br /><br />
                I agree that my child will follow all school rules and authorize the school staff to
                take necessary action in case of medical emergency.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConsentFormViewer; 