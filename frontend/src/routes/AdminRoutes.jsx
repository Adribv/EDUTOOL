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
import A_Fees from '../pages/admin/A_Fees';
import A_Reports from '../pages/admin/A_Reports';
import A_Settings from '../pages/admin/A_Settings';
import A_Users from '../pages/admin/A_Users';
import Inventory_Management from '../pages/admin/Inventory_Management';
import Teachers from '../pages/admin/Teachers';
import Students from '../pages/admin/Students';
import Timetable from '../pages/admin/Timetable';
import Results from '../pages/admin/Results';
import Settings from '../pages/admin/Settings';
import Subjects from '../pages/admin/Subjects';
import Parents from '../pages/admin/Parents';
import Fees from '../pages/admin/Fees';
import Attendance from '../pages/admin/Attendance';
import Classes from '../pages/admin/Classes';
import Exams from '../pages/admin/Exams';
import A_Dashboard from '../pages/admin/A_Dashboard';
import Visitors from '../pages/admin/Visitors';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
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
        <Route path="a-fees" element={<A_Fees />} />
        <Route path="a-reports" element={<A_Reports />} />
        <Route path="a-settings" element={<A_Settings />} />
        <Route path="a-users" element={<A_Users />} />
        <Route path="inventory-management" element={<Inventory_Management />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="student-records" element={<Students />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="results" element={<Results />} />
        <Route path="system-settings" element={<Settings />} />
        <Route path="subject-management" element={<Subjects />} />
        <Route path="parents" element={<Parents />} />
        <Route path="fee-management" element={<Fees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="class-management" element={<Classes />} />
        <Route path="exam-management" element={<Exams />} />
        <Route path="a-dashboard" element={<A_Dashboard />} />
        <Route path="Visitors" element={<Visitors />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes; 