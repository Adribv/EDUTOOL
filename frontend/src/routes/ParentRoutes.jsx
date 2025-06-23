import { Routes, Route } from 'react-router-dom';
import ParentLayout from '../components/layout/ParentLayout';
import ParentDashboard from '../pages/parent/ParentDashboard';
import Profile from '../pages/parent/Profile';
import Children from '../pages/parent/Children';
import ChildProgress from '../pages/parent/ChildProgress';
import FeeManagement from '../pages/parent/FeeManagement';
import P_Fee_Payments from '../pages/parent/P_Fee_Payments';
import Communication from '../pages/parent/Communication';
import Events from '../pages/parent/Events';
import Assignments from '../pages/parent/Assignments';
import P_Leave_Request from '../pages/parent/P_Leave_Request';
import P_Raise_Complaints from '../pages/parent/P_Raise_Complaints';
import Messages from '../pages/parent/Messages';
import Calendar from '../pages/parent/Calendar';
import Health from '../pages/parent/Health';
import Documents from '../pages/parent/Documents';
import Transport from '../pages/parent/Transport';
import Notifications from '../pages/parent/Notifications';
import StudentDetails from '../pages/parent/StudentDetails';
import NotFound from '../pages/NotFound';

const ParentRoutes = () => {
  return (
    <Routes>
      <Route element={<ParentLayout />}>
        <Route index element={<ParentDashboard />} />
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="children" element={<Children />} />
        <Route path="children/:rollNumber/progress" element={<ChildProgress />} />
        <Route path="children/:rollNumber/assignments" element={<Assignments />} />
        <Route path="children/:rollNumber/details" element={<StudentDetails />} />
        <Route path="fees" element={<FeeManagement />} />
        <Route path="fee-payments" element={<P_Fee_Payments />} />
        <Route path="communication" element={<Communication />} />
        <Route path="messages" element={<Messages />} />
        <Route path="events" element={<Events />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="leave-request" element={<P_Leave_Request />} />
        <Route path="complaints" element={<P_Raise_Complaints />} />
        <Route path="health" element={<Health />} />
        <Route path="documents" element={<Documents />} />
        <Route path="transport" element={<Transport />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default ParentRoutes; 