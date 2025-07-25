import { Routes, Route, Navigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import Dashboard from '../pages/student/Dashboard';
import Assignments from '../pages/student/Assignments';
import Lem from '../pages/student/Lem';
import Examinations from '../pages/student/Examinations';
import Timetable from '../pages/student/Timetable';
import Transport from '../pages/student/Transport';
import Profile from '../pages/student/Profile';
import Attendance from '../pages/student/Attendance';
import StudyMaterials from '../pages/student/StudyMaterials';
import Communication from '../pages/student/Communication';
import Fees from '../pages/student/Fees';
import Documents from '../pages/student/Documents';
import Calendar from '../pages/student/Calendar';
import Notifications from '../pages/student/Notifications';
import Messages from '../pages/student/Messages';
import Homework from '../pages/student/Homework';
import LeaveRequests from '../pages/student/LeaveRequests';
import ExamResults from '../pages/student/ExamResults';
import ReportCards from '../pages/student/ReportCards';
import PerformanceAnalytics from '../pages/student/PerformanceAnalytics';
import LearningResources from '../pages/student/LearningResources';
import ClassDiscussions from '../pages/student/ClassDiscussions';
import PaymentReceipts from '../pages/student/PaymentReceipts';
import MCQTest from '../pages/student/MCQTest';
import MCQResults from '../pages/student/MCQResults';
import MCQAssignmentsList from '../pages/student/MCQAssignmentsList';
import DisciplinaryFormAcknowledge from '../pages/student/DisciplinaryFormAcknowledge';
import DisciplinaryMisconduct from '../pages/student/DisciplinaryMisconduct';
import TeacherRemarksView from '../pages/student/TeacherRemarksView';
import CounsellingRequestForm from '../components/CounsellingRequestForm';
import ITSupportRequest from '../pages/student/ITSupportRequest';

const StudentRoutes = () => {
  return (
    <StudentLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Academic Dashboard */}
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/subjects" element={<StudyMaterials />} />
        
        {/* Examinations */}
        <Route path="/examinations" element={<Examinations />} />
        <Route path="/exam-results" element={<ExamResults />} />
        <Route path="/report-cards" element={<ReportCards />} />
        <Route path="/performance-analytics" element={<PerformanceAnalytics />} />
        
        {/* Attendance */}
        <Route path="/attendance" element={<Attendance />} />
        
        {/* Service Requests */}
        <Route path="/leave-requests" element={<LeaveRequests />} />
        <Route path="/counselling-request" element={<CounsellingRequestForm />} />
        <Route path="/it-support-request" element={<ITSupportRequest />} />
        
        {/* Learning Resources */}
        <Route path="/study-materials" element={<StudyMaterials />} />
        <Route path="/learning-resources" element={<LearningResources />} />
        <Route path="/lem" element={<Lem />} />
        
        {/* Communication */}
        <Route path="/communication" element={<Communication />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/announcements" element={<Notifications />} />
        <Route path="/class-discussions" element={<ClassDiscussions />} />
        
        {/* Fee Management */}
        <Route path="/fees" element={<Fees />} />
        <Route path="/payment-receipts" element={<PaymentReceipts />} />
        
        {/* Other */}
        <Route path="/transport" element={<Transport />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        
        {/* MCQ Assignments */}
        <Route path="/mcq-assignments-list" element={<MCQAssignmentsList />} />
        <Route path="/mcq-test/:assignmentId" element={<MCQTest />} />
        <Route path="/mcq-results/:assignmentId" element={<MCQResults />} />
        
        {/* Disciplinary Forms */}
        <Route path="/disciplinary-forms/:formId/acknowledge" element={<DisciplinaryFormAcknowledge />} />
        <Route path="/disciplinary-misconduct" element={<DisciplinaryMisconduct />} />
        
        {/* Teacher Remarks */}
        <Route path="/teacher-remarks" element={<TeacherRemarksView />} />
      </Routes>
    </StudentLayout>
  );
};

export default StudentRoutes; 