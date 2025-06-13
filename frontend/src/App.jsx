import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Theme
import theme from './theme';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentLogin from './pages/auth/StudentLogin';
import StudentRegister from './pages/auth/StudentRegister';
import NotFound from './pages/NotFound';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import Assignments from './pages/student/Assignments';
import Attendance from './pages/student/Attendance';
import Exams from './pages/student/Exams';
import Fees from './pages/student/Fees';
import Resources from './pages/student/Resources';
import Messages from './pages/student/Messages';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffProfile from './pages/staff/Profile';
import ClassManagement from './pages/staff/ClassManagement';
import AssignmentManagement from './pages/staff/AssignmentManagement';
import ExamManagement from './pages/staff/ExamManagement';
import StudentManagement from './pages/staff/StudentManagement';

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';
import ParentProfile from './pages/parent/Profile';
import ChildProgress from './pages/parent/ChildProgress';
import FeeManagement from './pages/parent/FeeManagement';
import Communication from './pages/parent/Communication';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import StaffManagement from './pages/admin/StaffManagement';
import StudentRecords from './pages/admin/StudentRecords';
import FeeConfiguration from './pages/admin/FeeConfiguration';
import SystemSettings from './pages/admin/SystemSettings';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';

// Role-based Components
import StudentRoutes from './routes/StudentRoutes';
import TeacherRoutes from './routes/TeacherRoutes';
import AdminRoutes from './routes/AdminRoutes';
import ParentRoutes from './routes/ParentRoutes';
import HODRoutes from './routes/HODRoutes';
import PrincipalRoutes from './routes/PrincipalRoutes';
import CounselorRoutes from './routes/CounselorRoutes';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student/*" element={<StudentRoutes />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                <Route path="/teacher/*" element={<TeacherRoutes />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['AdminStaff']} />}>
                <Route path="/admin/*" element={<AdminRoutes />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
                <Route path="/parent/*" element={<ParentRoutes />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['hod']} />}>
                <Route path="/hod/*" element={<HODRoutes />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['principal']} />}>
                <Route path="/principal/*" element={<PrincipalRoutes />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['counselor']} />}>
                <Route path="/counselor/*" element={<CounselorRoutes />} />
              </Route>

              {/* Redirect to login if no route matches */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
        <ToastContainer />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
