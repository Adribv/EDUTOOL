import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/teacher/Dashboard';
import Profile from '../pages/teacher/Profile';
import ClassManagement from '../pages/teacher/ClassManagement';
import AssignmentManagement from '../pages/teacher/AssignmentManagement';
import ExamManagement from '../pages/teacher/ExamManagement';
import StudentManagement from '../pages/teacher/StudentManagement';
import Timetable from '../pages/teacher/Timetable';
import Exams from '../pages/teacher/Exams';
import LearningResources from '../pages/teacher/LearningResources';
import Communication from '../pages/teacher/Communication';
import Assignments from '../pages/teacher/Assignments';
import Attendance from '../pages/teacher/Attendance';
import Calendar from '../pages/teacher/Calendar';
import Classes from '../pages/teacher/Classes';
import LeaveRequests from '../pages/teacher/LeaveRequests';

const TeacherRoutes = () => {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="profile" element={<Profile />} />
      <Route path="classes" element={<ClassManagement />} />
      <Route path="assignments" element={<AssignmentManagement />} />
      <Route path="exams" element={<ExamManagement />} />
      <Route path="students" element={<StudentManagement />} />
      <Route path="timetable" element={<Timetable />} />
      <Route path="exam-management" element={<Exams />} />
      <Route path="learning-resources" element={<LearningResources />} />
      <Route path="communication" element={<Communication />} />
      <Route path="assignment-management" element={<Assignments />} />
      <Route path="attendance-management" element={<Attendance />} />
      <Route path="leave-requests" element={<LeaveRequests />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="class-management" element={<Classes />} />
    </Routes>
  );
};

export default TeacherRoutes; 