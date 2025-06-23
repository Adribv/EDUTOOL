import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/counselor/Dashboard';
import Profile from '../pages/counselor/Profile';
import StudentCounseling from '../pages/counselor/StudentCounseling';
import AppointmentManagement from '../pages/counselor/AppointmentManagement';
import Reports from '../pages/counselor/Reports';

const CounselorRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="counseling" element={<StudentCounseling />} />
        <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
};

export default CounselorRoutes; 