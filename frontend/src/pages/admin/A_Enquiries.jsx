import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, TableContainer, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, IconButton
} from '@mui/material';
import { adminAPI } from '../../services/api';
import ReplyIcon from '@mui/icons-material/Reply';

const A_Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchEnquiries = () => {
    adminAPI.getEnquiries().then(setEnquiries).finally(()=>setLoading(false));
  };
  useEffect(fetchEnquiries, []);

  const openReply = (e) => {
    setCurrent(e); setReplyText(e.reply || ''); setDialogOpen(true);
  };
  const submitReply = () => {
    adminAPI.replyEnquiry(current._id, replyText).then(updated=>{
      setEnquiries(prev=>prev.map(enq=>enq._id===updated._id?updated:enq));
      setDialogOpen(false);
    });
  };
  const setStatus = (id,status)=>{
    adminAPI.updateEnquiryStatus(id,status).then(updated=>setEnquiries(prev=>prev.map(e=>e._id===id?updated:e)));
  };

  if (loading) return 'Loading...';
  return (
    <Box>
      <Typography variant="h4" mb={3}>Enquiries</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead><TableRow>
            <TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Subject</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {enquiries.map(e=>(
              <TableRow key={e._id}>
                <TableCell>{e.name}</TableCell><TableCell>{e.email}</TableCell><TableCell>{e.subject}</TableCell>
                <TableCell><Chip label={e.status} color={e.status==='Pending'?'warning':e.status==='Replied'?'success':'default'} size="small"/></TableCell>
                <TableCell>
                  <IconButton onClick={()=>openReply(e)}><ReplyIcon/></IconButton>
                  {e.status!=='Closed' && (
                    <Button size="small" onClick={()=>setStatus(e._id,'Closed')}>Close</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Enquiry</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>{current?.message}</Typography>
          <TextField multiline fullWidth rows={4} value={replyText} onChange={e=>setReplyText(e.target.value)} label="Reply" sx={{ mt:2 }}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitReply}>Send Reply</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default A_Enquiries; 