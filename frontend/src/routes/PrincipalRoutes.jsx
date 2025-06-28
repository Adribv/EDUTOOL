import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/principal/Dashboard';
import Profile from '../pages/principal/Profile';
import SchoolManagement from '../pages/principal/SchoolManagement';
import StaffManagement from '../pages/principal/StaffManagement';
import AcademicManagement from '../pages/principal/AcademicManagement';
import Reports from '../pages/principal/Reports';
import Approvals from '../pages/principal/Approvals';

const PrincipalRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="school" element={<SchoolManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="academic" element={<AcademicManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="approvals" element={<Approvals />} />
      </Route>
    </Routes>
  );
};

export default PrincipalRoutes; 