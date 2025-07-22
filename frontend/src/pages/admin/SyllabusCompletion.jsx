import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  TablePagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Upload,
  Refresh,
  Assessment,
  School,
  Person,
  Schedule,
  Warning
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syllabusAPI, adminAPI } from '../../services/api';
import TeacherRemarks from './TeacherRemarks';

const SyllabusCompletion = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Syllabus Completion
      </Typography>
      <TeacherRemarks />
    </Box>
  );
};

export default SyllabusCompletion; 