# Student Disciplinary Action Form System

## Overview
A comprehensive digital disciplinary form system that allows administrators to manage form templates, teachers to create and submit disciplinary forms, and students and parents to acknowledge forms with digital signatures.

## System Architecture

### Backend Components

#### 1. Database Model (`disciplinaryForm.model.js`)
- **Schema Fields:**
  - School information (name, date, warning number)
  - Student information (name, grade, section, roll number, parent details)
  - Incident details (date, time, location, description, reporting staff)
  - Type of misconduct (checkboxes for various categories)
  - Action taken (checkboxes for various actions including suspension)
  - Student and parent acknowledgments with digital signatures
  - Status tracking and workflow management
  - Follow-up requirements and admin approval

#### 2. Controller (`disciplinaryForm.controller.js`)
- **Admin Functions:**
  - `createTemplate()` - Create/update template settings
  - `getTemplate()` - Get template settings
  - `getAllForms()` - Get all forms with filtering
  - `getFormStats()` - Get statistics and analytics
  - `deleteForm()` - Delete forms

- **Teacher Functions:**
  - `createForm()` - Create new disciplinary form
  - `updateForm()` - Update existing form
  - `submitForm()` - Submit form to students/parents
  - `getTeacherForms()` - Get forms created by teacher

- **Student Functions:**
  - `getStudentForms()` - Get forms for student
  - `studentAcknowledge()` - Submit student acknowledgment

- **Parent Functions:**
  - `getParentForms()` - Get forms for parent's children
  - `parentAcknowledge()` - Submit parent acknowledgment

- **Common Functions:**
  - `getFormById()` - Get single form with role-based access control

#### 3. API Routes (`disciplinaryForm.routes.js`)
- **Public Routes:**
  - `GET /template` - Get template settings

- **Admin Routes:**
  - `POST /admin/template` - Create/update template
  - `GET /admin/forms` - Get all forms
  - `GET /admin/stats` - Get statistics
  - `DELETE /admin/forms/:id` - Delete form

- **Teacher Routes:**
  - `POST /teacher/forms` - Create form
  - `GET /teacher/forms` - Get teacher's forms
  - `PUT /teacher/forms/:id` - Update form
  - `POST /teacher/forms/:id/submit` - Submit form

- **Student Routes:**
  - `GET /student/forms` - Get student forms
  - `POST /student/forms/:id/acknowledge` - Acknowledge form

- **Parent Routes:**
  - `GET /parent/forms` - Get parent forms
  - `POST /parent/forms/:id/acknowledge` - Acknowledge form

- **Common Routes:**
  - `GET /forms/:id` - Get form by ID

### Frontend Components

#### 1. Admin Template Management (`DisciplinaryFormTemplate.jsx`)
- **Features:**
  - Template settings configuration
  - School information management
  - Form preview functionality
  - Statistics dashboard
  - Form management and deletion
  - Real-time form status tracking

- **Key Capabilities:**
  - Configure default settings (auto-notify parents, follow-up days)
  - View all disciplinary forms with filtering
  - Delete forms with confirmation
  - Statistics by status and misconduct type
  - Form preview with school branding

#### 2. Teacher Form Creation (`DisciplinaryFormCreate.jsx`)
- **Features:**
  - Student selection with autocomplete
  - Comprehensive incident reporting
  - Misconduct type selection (checkboxes)
  - Action taken selection (checkboxes)
  - Follow-up scheduling
  - Form preview and submission

- **Key Capabilities:**
  - Auto-populate student information
  - Validate required fields
  - Save drafts and submit forms
  - Preview form before submission
  - Touch-friendly interface for mobile devices

#### 3. Student Acknowledgment (`student/DisciplinaryFormAcknowledge.jsx`)
- **Features:**
  - Read-only form display
  - Digital signature capture
  - Comment submission
  - Acknowledgment confirmation
  - Status tracking

- **Key Capabilities:**
  - View complete form details
  - Provide digital signature with touch support
  - Add optional comments
  - Confirmation dialog before submission
  - Mobile-responsive design

#### 4. Parent Acknowledgment (`parent/DisciplinaryFormAcknowledge.jsx`)
- **Features:**
  - Complete form viewing
  - Student acknowledgment status
  - Parent name entry
  - Digital signature capture
  - Comment submission
  - Guidance for concerns

- **Key Capabilities:**
  - View child's disciplinary form
  - See student acknowledgment status
  - Provide parent signature and comments
  - Contact information for concerns
  - Mobile-optimized interface

#### 5. API Integration (`services/api.js`)
- **disciplinaryAPI Object:**
  - Admin APIs for template and form management
  - Teacher APIs for form creation and submission
  - Student APIs for form viewing and acknowledgment
  - Parent APIs for form viewing and acknowledgment
  - Common APIs for form retrieval

## Form Fields (Based on PDF Image)

### School Information
- School Name
- Date
- Warning Number

### Student Information
- Full Name
- Grade/Class
- Section
- Roll Number
- Parent/Guardian Name
- Contact Number

### Incident Details
- Date of Incident
- Time of Incident
- Location
- Reporting Staff Name
- Description of Incident

### Type of Misconduct (Checkboxes)
- ☐ Disruptive behavior in class
- ☐ Disrespect toward staff or students
- ☐ Physical aggression/fighting
- ☐ Use of inappropriate language
- ☐ Bullying/harassment
- ☐ Vandalism/property damage
- ☐ Cheating/academic dishonesty
- ☐ Skipping classes without permission
- ☐ Other (with description field)

### Action Taken (Checkboxes)
- ☐ Verbal warning
- ☐ Written warning
- ☐ Parent/guardian notified
- ☐ Counseling referral
- ☐ Detention
- ☐ Suspension (with number of days)
- ☐ Other (with description field)

### Acknowledgments
- Student signature and date
- Parent/guardian signature and date
- Comments sections for both

## Workflow Process

### 1. Admin Setup
1. Access `/admin/disciplinary-template`
2. Configure school information and default settings
3. Set up notification preferences
4. Configure follow-up requirements

### 2. Teacher Form Creation
1. Access `/teacher/disciplinary-forms/create`
2. Select student from autocomplete dropdown
3. Fill in incident details and description
4. Select misconduct types (multiple selection)
5. Select actions taken (multiple selection)
6. Set follow-up requirements if needed
7. Preview form and submit

### 3. Student Acknowledgment
1. Student receives notification
2. Access `/student/disciplinary-forms/:id/acknowledge`
3. Review complete form details
4. Provide digital signature
5. Add optional comments
6. Submit acknowledgment

### 4. Parent Acknowledgment
1. Parent receives notification
2. Access `/parent/disciplinary-forms/:id/acknowledge`
3. Review form and student acknowledgment status
4. Enter parent name
5. Provide digital signature
6. Add optional comments
7. Submit acknowledgment

### 5. Form Completion
1. Form status updates to "completed"
2. All parties receive confirmation
3. Form archived in system
4. Follow-up scheduled if required

## Status Tracking

### Form Statuses
- **Draft** - Form created but not submitted
- **Submitted** - Form submitted, awaiting acknowledgments
- **AwaitingStudentAck** - Waiting for student acknowledgment
- **AwaitingParentAck** - Waiting for parent acknowledgment
- **Completed** - Both acknowledgments received

### Workflow Logic
- Form starts as "Draft"
- Teacher submission changes to "Submitted"
- Student acknowledgment updates status based on parent status
- Parent acknowledgment updates status based on student status
- Both acknowledgments result in "Completed" status

## Security Features

### Role-Based Access Control
- **Admin**: Full access to all forms and settings
- **Teacher**: Can create/edit own forms, view submitted forms
- **Student**: Can view and acknowledge own forms only
- **Parent**: Can view and acknowledge forms for their children only

### Data Protection
- Digital signatures stored as base64 encoded images
- Form access validated by user role and relationship
- Audit trail for all form actions
- Secure API endpoints with authentication

## Technical Features

### Digital Signature Capture
- HTML5 Canvas-based signature drawing
- Touch-friendly for mobile devices
- Signature validation (non-empty check)
- Base64 encoding for storage

### Mobile Responsiveness
- Responsive grid layout
- Touch-optimized signature capture
- Mobile-friendly form controls
- Optimized for various screen sizes

### Real-time Updates
- React Query for data synchronization
- Automatic form status updates
- Live statistics and dashboards
- Instant notifications

### Data Validation
- Required field validation
- Form completeness checks
- Role-based access validation
- Input sanitization

## Installation & Usage

### Backend Setup
1. Install dependencies: `npm install`
2. Add routes to `server.js`
3. Ensure authentication middleware is configured
4. Start server: `npm start`

### Frontend Setup
1. Install dependencies: `npm install`
2. Add routes to your routing configuration
3. Import and use components in your app
4. Configure API endpoints
5. Start development server: `npm start`

### Database Setup
The system automatically creates the required collections:
- `disciplinaryforms` - Main form storage
- Related collections linked via ObjectId references

## API Endpoints Summary

```
POST   /api/disciplinary-forms/admin/template
GET    /api/disciplinary-forms/template
GET    /api/disciplinary-forms/admin/forms
GET    /api/disciplinary-forms/admin/stats
DELETE /api/disciplinary-forms/admin/forms/:id

POST   /api/disciplinary-forms/teacher/forms
GET    /api/disciplinary-forms/teacher/forms
PUT    /api/disciplinary-forms/teacher/forms/:id
POST   /api/disciplinary-forms/teacher/forms/:id/submit

GET    /api/disciplinary-forms/student/forms
POST   /api/disciplinary-forms/student/forms/:id/acknowledge

GET    /api/disciplinary-forms/parent/forms
POST   /api/disciplinary-forms/parent/forms/:id/acknowledge

GET    /api/disciplinary-forms/forms/:id
```

## Future Enhancements

### Potential Features
- Email notifications for form submissions
- PDF export functionality
- Advanced reporting and analytics
- Integration with student information systems
- Bulk form operations
- Form templates for different incident types
- Automated follow-up reminders
- Integration with school calendar systems

### Scalability Considerations
- Database indexing for performance
- Caching for frequently accessed data
- File storage for signature images
- Backup and recovery procedures
- Performance monitoring and optimization

This comprehensive system provides a complete digital solution for managing student disciplinary actions while maintaining proper workflow, security, and user experience across all stakeholders. 