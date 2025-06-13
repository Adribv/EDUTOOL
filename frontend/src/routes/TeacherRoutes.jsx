import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/teacher/Dashboard';
import Profile from '../pages/teacher/Profile';
import ClassManagement from '../pages/teacher/ClassManagement';
import AssignmentManagement from '../pages/teacher/AssignmentManagement';
import ExamManagement from '../pages/teacher/ExamManagement';
import StudentManagement from '../pages/teacher/StudentManagement';

const TeacherRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="classes" element={<ClassManagement />} />
        <Route path="assignments" element={<AssignmentManagement />} />
        <Route path="exams" element={<ExamManagement />} />
        <Route path="students" element={<StudentManagement />} />
      </Route>
    </Routes>
  );
};

export default TeacherRoutes; 