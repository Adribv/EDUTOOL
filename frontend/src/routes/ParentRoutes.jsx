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
      </Route>
    </Routes>
  );
};

export default ParentRoutes; 