import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/admin/Dashboard';
import A_Inventory from '../pages/admin/A_Inventory';
import A_Communication from '../pages/admin/A_Communication';
import A_Events from '../pages/admin/A_Events';
import A_Classes from '../pages/admin/A_Classes';
import A_Subjects from '../pages/admin/A_Subjects';
import A_Schedules from '../pages/admin/A_Schedules';
import Profile from '../pages/admin/Profile';
import StaffManagement from '../pages/admin/StaffManagement';
import StudentRecords from '../pages/admin/StudentRecords';
import FeeConfiguration from '../pages/admin/FeeConfiguration';
import SystemSettings from '../pages/admin/SystemSettings';
import UserManagement from '../pages/admin/UserManagement';
import Reports from '../pages/admin/Reports';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="students" element={<StudentRecords />} />
        <Route path="fees" element={<FeeConfiguration />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="inventory" element={<A_Inventory />} />
        <Route path="communications" element={<A_Communication />} />
        <Route path="events" element={<A_Events />} />
        <Route path="classes" element={<A_Classes />} />
        <Route path="subjects" element={<A_Subjects />} />
        <Route path="schedules" element={<A_Schedules />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes; 