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
import FeeManagement from '../pages/student/FeeManagement';
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
        <Route path="/leave-requests" element={<LeaveRequests />} />
        
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
        <Route path="/fees" element={<FeeManagement />} />
        <Route path="/payment-receipts" element={<PaymentReceipts />} />
        
        {/* Other */}
        <Route path="/transport" element={<Transport />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </StudentLayout>
  );
};

export default StudentRoutes; 