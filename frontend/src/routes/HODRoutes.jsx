import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/hod/Dashboard';
import Profile from '../pages/hod/Profile';
import DepartmentManagement from '../pages/hod/DepartmentManagement';
import StaffManagement from '../pages/hod/StaffManagement';
import CourseManagement from '../pages/hod/CourseManagement';
import Reports from '../pages/hod/Reports';

const HODRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="department" element={<DepartmentManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
};

export default HODRoutes; 