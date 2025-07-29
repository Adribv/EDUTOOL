# Assignment System - Complete Implementation Guide

## 🎯 Overview

This is a complete, working assignment submission system that allows students to view, submit, and track their assignments. The system includes both frontend (React) and backend (Node.js/Express) components with proper authentication and file upload capabilities.

## ✅ Features

### Student Features
- **View Assignments**: See all assignments with status (Pending, Submitted, Graded)
- **Submit Assignments**: Submit text content and/or file attachments
- **Track Progress**: Monitor submission status and deadlines
- **View Grades**: See grades and feedback when available
- **Assignment Details**: View detailed assignment information
- **File Upload**: Support for PDF, DOC, DOCX, TXT, JPG, PNG files (up to 10MB)
- **Late Submissions**: Support for late submissions (if allowed by teacher)

### System Features
- **Authentication**: JWT-based authentication with role-based access control
- **File Management**: Secure file upload with type and size validation
- **Status Tracking**: Real-time assignment and submission status
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive UI**: Mobile-friendly Material-UI design

## 🏗 Architecture

### Backend Structure
```
backend/
├── routes/Student/studentRoutes.js          # Student API routes
├── controllers/Student/                     # Student controllers
│   ├── academicDashboardController.js       # Assignment logic
│   └── studentAuth.js                       # Authentication
├── models/Staff/Teacher/                    # Database models
│   ├── assignment.model.js                  # Assignment schema
│   └── submission.model.js                  # Submission schema
├── middlewares/                             # Middleware functions
│   ├── authMiddleware.js                    # JWT authentication
│   ├── roleMiddleware.js                    # Role-based permissions
│   └── uploadMiddleware.js                  # File upload handling
```

### Frontend Structure
```
frontend/
├── src/pages/student/Assignments.jsx       # Main assignment component
├── src/services/api.js                     # API service layer
└── src/context/AuthContext.jsx             # Authentication context
```

## 🚀 API Endpoints

### Authentication
```http
POST /api/students/login
Content-Type: application/json

{
  "rollNumber": "STUDENT001",
  "password": "password123"
}
```

### Get Assignments
```http
GET /api/students/assignments
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "assignment_id",
    "title": "Math Assignment 1",
    "description": "Solve algebraic equations",
    "subject": "Mathematics",
    "class": "10A",
    "dueDate": "2024-01-15T23:59:59.000Z",
    "maxMarks": 100,
    "submissionStatus": "Not Submitted",
    "canSubmit": true,
    "isOverdue": false,
    "daysUntilDue": 5
  }
]
```

### Submit Assignment
```http
POST /api/students/assignments/{assignmentId}/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- content: "Assignment submission text"
- file: [uploaded file]
```

### Get Assignment Details
```http
GET /api/students/assignments/{assignmentId}
Authorization: Bearer <token>
```

## 🛠 Setup Instructions

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Variables** (`.env`)
```env
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb://localhost:27017/edutool
PORT=5000
```

3. **Start Backend Server**
```bash
npm start
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Start Frontend Server**
```bash
npm run dev
```

## 🔧 Testing the System

### Manual Testing

1. **Login as Student**
   - Navigate to student login page
   - Use valid student credentials
   - Verify successful authentication

2. **View Assignments**
   - Navigate to Assignments page
   - Verify assignments are loaded
   - Check status indicators (Pending, Submitted, Graded)

3. **Submit Assignment**
   - Click "Submit" on a pending assignment
   - Add text content and/or upload a file
   - Verify successful submission
   - Check updated status

### Automated Testing

Use the provided test script:

```bash
# Install axios for testing
npm install axios

# Update test credentials in test_assignment_api.js
node test_assignment_api.js
```

## 📊 Database Schema

### Assignment Model
```javascript
{
  title: String,              // Assignment title
  description: String,        // Assignment description
  instructions: String,       // Special instructions
  class: String,             // Target class
  section: String,           // Target section
  subject: String,           // Subject name
  dueDate: Date,             // Submission deadline
  maxMarks: Number,          // Maximum marks
  status: String,            // Draft, Active, Completed, Archived
  submissionType: String,    // Text, File, Both
  allowLateSubmission: Boolean,
  createdBy: ObjectId        // Teacher who created it
}
```

### Submission Model
```javascript
{
  assignmentId: ObjectId,    // Reference to assignment
  studentId: ObjectId,       // Reference to student
  content: String,           // Text submission
  fileUrl: String,           // File path
  attachments: [Object],     // File metadata
  status: String,            // Submitted, Graded, Late
  grade: Number,             // Assigned grade
  feedback: String,          // Teacher feedback
  isLate: Boolean,           // Late submission flag
  submittedAt: Date          // Submission timestamp
}
```

## 🔐 Security Features

### Authentication
- JWT token-based authentication
- Role-based access control (Student role required)
- Token expiration handling

### File Upload Security
- File type validation (PDF, DOC, DOCX, TXT, JPG, PNG only)
- File size limits (10MB maximum)
- Secure file storage in dedicated directories
- Unique filename generation to prevent conflicts

### Data Validation
- Input sanitization on all endpoints
- Assignment ownership verification
- Class/section authorization checks
- Due date and submission window validation

## 🎨 UI Components

### Assignment Cards
- Visual status indicators with color coding
- Due date warnings and countdown
- Grade display with star ratings
- Hover effects and smooth transitions

### Submission Dialog
- File upload with drag-and-drop support
- Text content editor
- Real-time validation feedback
- Progress indicators during submission

### Status Management
- Tabbed interface (Pending, Submitted, Graded)
- Badge counters for each status
- Loading states and error handling
- Toast notifications for user feedback

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check JWT token validity
   - Verify user role permissions
   - Ensure proper Authorization header format

2. **File Upload Issues**
   - Check file size (must be < 10MB)
   - Verify file type is supported
   - Ensure upload directory exists and is writable

3. **Assignment Not Loading**
   - Verify student's class and section
   - Check assignment status (must be Active)
   - Ensure database connectivity

### Debug Mode

Enable detailed logging in the backend:
```javascript
// Add to academicDashboardController.js
console.log('Debug info:', { studentId, assignmentId, status });
```

## 📈 Performance Considerations

### Backend Optimizations
- Database indexing on frequently queried fields
- Proper population of related documents
- Error handling to prevent server crashes
- File upload size and type restrictions

### Frontend Optimizations
- React Query for efficient data caching
- Lazy loading for better performance
- Optimistic updates for better UX
- Debounced search and filtering

## 🚦 Deployment

### Environment Setup
- Set proper CORS origins for production
- Configure secure file upload directories
- Use environment variables for sensitive data
- Set up proper logging and monitoring

### Security Checklist
- [ ] HTTPS enabled
- [ ] JWT secret is secure
- [ ] File upload directory is secured
- [ ] Database connections are encrypted
- [ ] Input validation is comprehensive
- [ ] Error messages don't leak sensitive information

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify backend server logs
3. Ensure all dependencies are properly installed
4. Check database connectivity
5. Verify environment variables are set correctly

## 🎉 Success Indicators

The system is working correctly when:
- ✅ Students can log in successfully
- ✅ Assignments load with proper status indicators
- ✅ File uploads work without errors
- ✅ Submissions are saved to the database
- ✅ Assignment status updates in real-time
- ✅ Error messages are user-friendly
- ✅ The UI is responsive and intuitive

This implementation provides a robust, secure, and user-friendly assignment management system that can be extended with additional features as needed. 