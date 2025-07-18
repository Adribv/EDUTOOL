import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/principal/Dashboard';
import Profile from '../pages/principal/Profile';
import SchoolManagement from '../pages/principal/SchoolManagement';
import StaffManagement from '../pages/principal/StaffManagement';
import StudentManagement from '../pages/principal/StudentManagement';
import AcademicManagement from '../pages/principal/AcademicManagement';
import Reports from '../pages/principal/Reports';
import Approvals from '../pages/principal/Approvals';
import LessonPlanApprovals from '../pages/principal/LessonPlanApprovals';

const PrincipalRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="school" element={<SchoolManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="academic" element={<AcademicManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="lesson-plans" element={<LessonPlanApprovals />} />
      </Route>
    </Routes>
  );
};

export default PrincipalRoutes; 