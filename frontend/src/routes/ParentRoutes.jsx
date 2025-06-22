import { Routes, Route } from 'react-router-dom';
import ParentLayout from '../components/layout/ParentLayout';
import ParentDashboard from '../pages/parent/ParentDashboard';
import Profile from '../pages/parent/Profile';
import Children from '../pages/parent/Children';
import ChildProgress from '../pages/parent/ChildProgress';
import FeeManagement from '../pages/parent/FeeManagement';
import Communication from '../pages/parent/Communication';
import Events from '../pages/parent/Events';
import Assignments from '../pages/parent/Assignments';
import NotFound from '../pages/NotFound';

const ParentRoutes = () => {
  return (
    <Routes>
      <Route element={<ParentLayout />}>
        <Route index element={<ParentDashboard />} />
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="children" element={<Children />} />
        <Route path="children/:childId/progress" element={<ChildProgress />} />
        <Route path="children/:childId/assignments" element={<Assignments />} />
        <Route path="fees" element={<FeeManagement />} />
        <Route path="communication" element={<Communication />} />
        <Route path="events" element={<Events />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default ParentRoutes; 