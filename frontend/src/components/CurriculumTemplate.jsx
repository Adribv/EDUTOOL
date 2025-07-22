import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  School as SchoolIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon,
  Comment as CommentIcon
} from '@mui/icons-material';

const CurriculumTemplate = ({ curriculumData, teacherRemarks = [] }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Curriculum Plan Template
      </Typography>

      <Grid container spacing={3}>
        {/* Point 1: Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                1. Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Subject:</strong> {curriculumData?.subject || 'Mathematics'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Grade:</strong> {curriculumData?.grade || '7'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Course Code:</strong> {curriculumData?.courseCode || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Instructor:</strong> {curriculumData?.instructor?.name || 'To be assigned'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Department:</strong> {curriculumData?.departmentId?.name || 'Science'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Academic Year:</strong> {curriculumData?.academicYear || '2024-25'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Prerequisites:</strong> {curriculumData?.prerequisites || 'None'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Hours:</strong> {curriculumData?.totalHours || 'N/A'} | <strong>Contact Hours:</strong> {curriculumData?.contactHours || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Point 2: Description */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                2. Description
              </Typography>
              <Typography variant="body2">
                {curriculumData?.description || 'This curriculum provides a comprehensive foundation in the subject area, designed to meet educational standards and learning objectives.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Point 3: Learning Objectives */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                3. Learning Objectives
              </Typography>
              <Typography variant="body2">
                {curriculumData?.objectives || 'Students will develop critical thinking skills, problem-solving abilities, and a deep understanding of fundamental concepts.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Point 4: Weekly/Unit-Wise Syllabus Plan (Teacher Remarks) */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CommentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                4. Weekly/Unit-Wise Syllabus Plan
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Use the table format below to structure teacher remarks and feedback:
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Week / Unit</strong></TableCell>
                      <TableCell><strong>Teacher Name</strong></TableCell>
                      <TableCell><strong>Remarks / Feedback</strong></TableCell>
                      <TableCell><strong>Action Taken</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teacherRemarks.length > 0 ? (
                      teacherRemarks.map((remark, index) => (
                        <TableRow key={remark._id || index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {remark.unitChapter || `Week ${index + 1}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {remark.teacherName || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {remark.teacherRemarks || remark.remarksTopicsLeft || 'No remarks provided'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={remark.status === 'Completed' ? 'Completed' : 
                                     remark.status === 'In Progress' ? 'In Progress' : 
                                     remark.status === 'Delayed' ? 'Needs Attention' : 'Not Started'}
                              color={remark.status === 'Completed' ? 'success' : 
                                     remark.status === 'In Progress' ? 'primary' : 
                                     remark.status === 'Delayed' ? 'warning' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {remark.startDate ? new Date(remark.startDate).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="textSecondary">
                            No teacher remarks available. Teachers can add remarks through their dashboard.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Point 5: Assessment Methods */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                5. Assessment Methods
              </Typography>
              <Typography variant="body2">
                {curriculumData?.assessmentMethods || 'Assessment will be conducted through a combination of formative and summative evaluations including quizzes, assignments, projects, and examinations.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Point 6: Resources */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                6. Learning Resources
              </Typography>
              <Typography variant="body2">
                {curriculumData?.learningResources || 'Textbooks, digital resources, laboratory equipment, and supplementary materials will be provided to support the learning process.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Topics & Learning Outcomes */}
        {curriculumData?.topics && curriculumData.topics.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Topics & Learning Outcomes
                </Typography>
                <Box>
                  {curriculumData.topics.map((topic, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {topic.title} ({topic.duration})
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {topic.description}
                      </Typography>
                      {topic.learningOutcomes && topic.learningOutcomes.length > 0 && (
                        <Box mt={1}>
                          <Typography variant="caption" fontWeight="medium">
                            Learning Outcomes:
                          </Typography>
                          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                            {topic.learningOutcomes.map((outcome, idx) => (
                              <li key={idx}>
                                <Typography variant="caption" color="textSecondary">
                                  {outcome}
                                </Typography>
                              </li>
                            ))}
                          </ul>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CurriculumTemplate; 