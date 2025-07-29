import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import {
  School as SchoolIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon,
  Comment as CommentIcon,
  Print as PrintIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import CurriculumTemplate from '../../components/CurriculumTemplate';

const CurriculumTemplateDemo = () => {
  const [showTemplate, setShowTemplate] = useState(false);

  // Sample curriculum data
  const sampleCurriculumData = {
    subject: 'Mathematics',
    grade: '7',
    departmentId: { name: 'Science' },
    instructor: { name: 'Dr. Sarah Johnson', email: 'sarah.johnson@school.edu' },
    courseCode: 'MATH701',
    prerequisites: 'Grade 6 Mathematics with minimum 70%',
    totalHours: '120 hours',
    contactHours: '80 hours',
    academicYear: '2024-25',
    description: 'This curriculum provides a comprehensive foundation in mathematics, designed to meet educational standards and learning objectives for Grade 7 students.',
    objectives: 'Students will develop critical thinking skills, problem-solving abilities, and a deep understanding of fundamental mathematical concepts including algebra, geometry, and statistics.',
    assessmentMethods: 'Assessment will include weekly quizzes (20%), monthly assignments (30%), mid-term examination (25%), and final examination (25%). Students will also be evaluated on class participation and project work.',
    learningResources: 'Primary textbook: Mathematics for Grade 7, Digital resources: Khan Academy, GeoGebra software, Laboratory equipment: Geometric shapes, measuring tools, calculators, and supplementary worksheets.',
    topics: [
      {
        title: 'Introduction to Algebra',
        description: 'Basic algebraic concepts and expressions',
        duration: '3 weeks',
        learningOutcomes: [
          'Understand basic algebraic expressions',
          'Solve simple linear equations',
          'Apply algebraic concepts to real-world problems'
        ]
      },
      {
        title: 'Geometry Fundamentals',
        description: 'Basic geometric shapes and properties',
        duration: '4 weeks',
        learningOutcomes: [
          'Identify and classify geometric shapes',
          'Calculate area and perimeter',
          'Understand geometric transformations'
        ]
      }
    ]
  };

  // Sample teacher remarks data
  const sampleTeacherRemarks = [
    {
      _id: '1',
      unitChapter: 'Week 1',
      teacherName: 'Mr. Smith',
      teacherRemarks: 'Students struggled with basic algebra concepts. Need to provide more practice exercises.',
      status: 'In Progress',
      startDate: '2024-01-15'
    },
    {
      _id: '2',
      unitChapter: 'Week 2',
      teacherName: 'Ms. Johnson',
      teacherRemarks: 'Excellent participation in geometry activities. Students are showing good understanding.',
      status: 'Completed',
      startDate: '2024-01-22'
    },
    {
      _id: '3',
      unitChapter: 'Week 3',
      teacherName: 'Mr. Davis',
      teacherRemarks: 'Some students need additional support with fractions. Will schedule extra help sessions.',
      status: 'Delayed',
      startDate: '2024-01-29'
    },
    {
      _id: '4',
      unitChapter: 'Week 4',
      teacherName: 'Mrs. Wilson',
      teacherRemarks: 'Statistics unit completed successfully. Students performed well in assessments.',
      status: 'Completed',
      startDate: '2024-02-05'
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would typically generate a PDF
    alert('PDF download functionality would be implemented here');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Curriculum Template Demo
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            About This Template
          </Typography>
          <Typography variant="body2" paragraph>
            This demonstrates how the curriculum template uses teacher remarks for <strong>Point 4: Weekly/Unit-Wise Syllabus Plan</strong> 
            instead of the traditional syllabus plan table. Teachers can add their feedback, observations, and progress notes 
            which will be displayed in this structured format.
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<BookIcon />}
              onClick={() => setShowTemplate(true)}
            >
              View Curriculum Template
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print Template
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download PDF
            </Button>
          </Box>
        </CardContent>
      </Card>

      {showTemplate && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Curriculum Template with Teacher Remarks
            </Typography>
            <Chip 
              label="Point 4: Teacher Remarks" 
              color="primary" 
              icon={<CommentIcon />}
            />
          </Box>
          
          <CurriculumTemplate 
            curriculumData={sampleCurriculumData}
            teacherRemarks={sampleTeacherRemarks}
          />
        </Box>
      )}

      {!showTemplate && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Key Features
                </Typography>
                <ul>
                  <li>Point 4 displays teacher remarks instead of syllabus plan</li>
                  <li>Teachers can add feedback and observations</li>
                  <li>Progress tracking with status indicators</li>
                  <li>Structured table format for easy reading</li>
                  <li>Printable and downloadable format</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CommentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Teacher Remarks Benefits
                </Typography>
                <ul>
                  <li>Real-time feedback on curriculum implementation</li>
                  <li>Identification of areas needing attention</li>
                  <li>Documentation of successful teaching strategies</li>
                  <li>Progress tracking for administrative review</li>
                  <li>Evidence-based curriculum improvement</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CurriculumTemplateDemo; 