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
import Courses from './pages/student/Courses';
import Timetable from './pages/student/Timetable';
import Results from './pages/student/Results';
import Notifications from './pages/student/Notifications';
import Calendar from './pages/student/Calendar';
import Transport from './pages/student/Transport';
import StudyMaterials from './pages/student/StudyMaterials';
import Settings from './pages/student/Settings';

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
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/student-register" element={<StudentRegister />} />

              {/* Student Routes */}
              <Route
                path="/student"
                element={
                 <Layout role="student" />
                }
              >
                <Route index element={<StudentDashboard />} />
                <Route path="courses" element={<Courses />} />
                <Route path="timetable" element={<Timetable />} />
                <Route path="results" element={<Results />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="transport" element={<Transport />} />
                <Route path="materials" element={<StudyMaterials />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Staff Routes */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute>
                    <Layout role="staff" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<StaffDashboard />} />
                <Route path="profile" element={<StaffProfile />} />
                <Route path="classes" element={<ClassManagement />} />
                <Route path="assignments" element={<AssignmentManagement />} />
                <Route path="exams" element={<ExamManagement />} />
                <Route path="students" element={<StudentManagement />} />
              </Route>

              {/* Parent Routes */}
              <Route
                path="/parent"
                element={
                  <ProtectedRoute>
                    <Layout role="parent" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ParentDashboard />} />
                <Route path="profile" element={<ParentProfile />} />
                <Route path="progress" element={<ChildProgress />} />
                <Route path="fees" element={<FeeManagement />} />
                <Route path="communication" element={<Communication />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Layout role="admin" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="students" element={<StudentRecords />} />
                <Route path="fees" element={<FeeConfiguration />} />
                <Route path="settings" element={<SystemSettings />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* Redirect root to appropriate dashboard based on role */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
        <ToastContainer />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
