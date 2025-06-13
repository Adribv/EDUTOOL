import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/student/Dashboard';
import Profile from '../pages/student/Profile';
import Assignments from '../pages/student/Assignments';
import Attendance from '../pages/student/Attendance';
import Exams from '../pages/student/Exams';
import Fees from '../pages/student/Fees';
import Resources from '../pages/student/Resources';
import Messages from '../pages/student/Messages';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="exams" element={<Exams />} />
        <Route path="fees" element={<Fees />} />
        <Route path="resources" element={<Resources />} />
        <Route path="messages" element={<Messages />} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes; 