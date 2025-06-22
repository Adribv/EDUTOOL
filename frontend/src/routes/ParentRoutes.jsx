import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/parent/Dashboard';
import Profile from '../pages/parent/Profile';
import ChildProgress from '../pages/parent/ChildProgress';
import FeeManagement from '../pages/parent/FeeManagement';
import Communication from '../pages/parent/Communication';
import Assignments from '../pages/parent/Assignments';
import Events from '../pages/parent/Events';
import Notifications from '../pages/parent/Notifications';
import Messages from '../pages/parent/Messages';
import Students from '../pages/parent/Students';
import StudentDetails from '../pages/parent/StudentDetails';
import Progress from '../pages/parent/Progress';
import Transport from '../pages/parent/Transport';
import Health from '../pages/parent/Health';
import Calendar from '../pages/parent/Calendar';
import Children from '../pages/parent/Children';
import Documents from '../pages/parent/Documents';
import Fees from '../pages/parent/Fees';
import P_Feedback from '../pages/parent/P_Feedback';
import P_Raise_Complaints from '../pages/parent/P_Raise_Complaints';

const ParentRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="child-progress" element={<ChildProgress />} />
        <Route path="fees" element={<FeeManagement />} />
        <Route path="communication" element={<Communication />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="events" element={<Events />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="messages" element={<Messages />} />
        <Route path="students" element={<Students />} />
        <Route path="student-details" element={<StudentDetails />} />
        <Route path="progress" element={<Progress />} />
        <Route path="transport" element={<Transport />} />
        <Route path="health" element={<Health />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="children" element={<Children />} />
        <Route path="documents" element={<Documents />} />
        <Route path="fee-payments" element={<Fees />} />
        <Route path="feedback" element={<P_Feedback />} />
        <Route path="complaints" element={<P_Raise_Complaints />} />
      </Route>
    </Routes>
  );
};

export default ParentRoutes; 