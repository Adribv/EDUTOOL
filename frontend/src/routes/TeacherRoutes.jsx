import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/teacher/Dashboard';
import Profile from '../pages/teacher/Profile';
import ClassManagement from '../pages/teacher/ClassManagement';
import AssignmentManagement from '../pages/teacher/AssignmentManagement';
import ExamManagement from '../pages/teacher/ExamManagement';
import StudentManagement from '../pages/teacher/StudentManagement';
import T_Assignments from '../pages/teacher/T_Assignments';
import T_Attendance from '../pages/teacher/T_Attendance';
import T_Classes from '../pages/teacher/T_Classes';
import T_Communication from '../pages/teacher/T_Communication';
import T_Dashboard from '../pages/teacher/T_Dashboard';
import T_Grades from '../pages/teacher/T_Grades';
import Timetable from '../pages/teacher/Timetable';
import Exams from '../pages/teacher/Exams';
import LearningResources from '../pages/teacher/LearningResources';
import Communication from '../pages/teacher/Communication';
import Assignments from '../pages/teacher/Assignments';
import Attendance from '../pages/teacher/Attendance';
import Calendar from '../pages/teacher/Calendar';
import Classes from '../pages/teacher/Classes';

const TeacherRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="classes" element={<ClassManagement />} />
        <Route path="assignments" element={<AssignmentManagement />} />
        <Route path="exams" element={<ExamManagement />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="t-assignments" element={<T_Assignments />} />
        <Route path="t-attendance" element={<T_Attendance />} />
        <Route path="t-classes" element={<T_Classes />} />
        <Route path="t-communication" element={<T_Communication />} />
        <Route path="t-dashboard" element={<T_Dashboard />} />
        <Route path="t-grades" element={<T_Grades />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="exam-management" element={<Exams />} />
        <Route path="learning-resources" element={<LearningResources />} />
        <Route path="communication" element={<Communication />} />
        <Route path="assignment-management" element={<Assignments />} />
        <Route path="attendance-management" element={<Attendance />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="class-management" element={<Classes />} />
      </Route>
    </Routes>
  );
};

export default TeacherRoutes; 