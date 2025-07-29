import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CounsellingRequestsDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/counselling-requests')
      .then(res => {
        setRequests(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch requests');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '95vw', margin: 'auto', background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>Counselling Requests</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>School Name</th>
            <th>Requested By</th>
            <th>Student Name</th>
            <th>Reasons</th>
            <th>Preferred Mode</th>
            <th>Contact</th>
            <th>Date</th>
            <th>Brief Description</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req._id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{req.schoolName}</td>
              <td>{req.requestedBy}{req.requestedBy === 'Other' && req.requestedByOther ? ` (${req.requestedByOther})` : ''}</td>
              <td>{req.studentDetails?.fullName}</td>
              <td>{[...(req.reasons || []), req.reasonOther].filter(Boolean).join(', ')}</td>
              <td>{req.preferredMode}</td>
              <td>{req.contactNumber}<br />{req.email}</td>
              <td>{req.dateOfRequest ? new Date(req.dateOfRequest).toLocaleDateString() : ''}</td>
              <td>{req.briefDescription}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 