import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box, useTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { lazy, Suspense } from 'react';
import 'react-toastify/dist/ReactToastify.css';

// Theme
import theme from './theme';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load all pages for better performance
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const StudentLogin = lazy(() => import('./pages/auth/StudentLogin'));
const StudentRegister = lazy(() => import('./pages/auth/StudentRegister'));
const ParentLogin = lazy(() => import('./pages/auth/ParentLogin'));
const ParentRegister = lazy(() => import('./pages/auth/ParentRegister'));
const ManagementLogin = lazy(() => import('./pages/auth/ManagementLogin'));
const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const Assignments = lazy(() => import('./pages/student/Assignments'));
const Attendance = lazy(() => import('./pages/student/Attendance'));
const Exams = lazy(() => import('./pages/student/Exams'));
const Fees = lazy(() => import('./pages/student/Fees'));
const Resources = lazy(() => import('./pages/student/Resources'));
const Messages = lazy(() => import('./pages/student/Messages'));
const Courses = lazy(() => import('./pages/student/Courses'));
const Timetable = lazy(() => import('./pages/student/Timetable'));
const Results = lazy(() => import('./pages/student/Results'));
const Notifications = lazy(() => import('./pages/student/Notifications'));
const Calendar = lazy(() => import('./pages/student/Calendar'));
const Transport = lazy(() => import('./pages/student/Transport'));
const StudyMaterials = lazy(() => import('./pages/student/StudyMaterials'));
const Settings = lazy(() => import('./pages/student/Settings'));

// Staff Pages
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'));
const StaffProfile = lazy(() => import('./pages/staff/Profile'));
const ClassManagement = lazy(() => import('./pages/staff/ClassManagement'));
const AssignmentManagement = lazy(() => import('./pages/staff/AssignmentManagement'));
const ExamManagement = lazy(() => import('./pages/staff/ExamManagement'));
const StudentManagement = lazy(() => import('./pages/staff/StudentManagement'));

// Parent Pages
const ParentDashboard = lazy(() => import('./pages/parent/Dashboard'));
const ParentProfile = lazy(() => import('./pages/parent/Profile'));
const ChildProgress = lazy(() => import('./pages/parent/ChildProgress'));
const FeeManagement = lazy(() => import('./pages/parent/FeeManagement'));
const Communication = lazy(() => import('./pages/parent/Communication'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));
const StaffManagement = lazy(() => import('./pages/admin/StaffManagement'));
const StudentRecords = lazy(() => import('./pages/admin/StudentRecords'));
const FeeConfiguration = lazy(() => import('./pages/admin/FeeConfiguration'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const Reports = lazy(() => import('./pages/admin/Reports'));

// Role-based Components
const StudentRoutes = lazy(() => import('./routes/StudentRoutes'));
const TeacherRoutes = lazy(() => import('./routes/TeacherRoutes'));
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));
const ParentRoutes = lazy(() => import('./routes/ParentRoutes'));
const HODRoutes = lazy(() => import('./routes/HODRoutes'));
const PrincipalRoutes = lazy(() => import('./routes/PrincipalRoutes'));
const CounselorRoutes = lazy(() => import('./routes/CounselorRoutes'));

// Loading component
const LoadingSpinner = () => {
  const theme = useTheme();
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)` }}
    >
      <CircularProgress size={60} sx={{ color: 'white' }} />
    </Box>
  );
};

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AuthProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  
                  {/* Public Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/student-login" element={<StudentLogin />} />
                  <Route path="/student-register" element={<StudentRegister />} />
                  <Route path="/parent-login" element={<ParentLogin />} />
                  <Route path="/parent-register" element={<ParentRegister />} />
                  <Route path="/management-login" element={<ManagementLogin />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                    <Route path="/student/*" element={<StudentRoutes />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
                    <Route path="/parent/*" element={<ParentRoutes />} />
                  </Route>

                  {/* Management Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                    <Route path="/teacher/*" element={<TeacherRoutes />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['adminstaff']} />}>
                    <Route path="/admin/*" element={<AdminRoutes />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['hod']} />}>
                    <Route path="/hod/*" element={<HODRoutes />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['principal']} />}>
                    <Route path="/principal/*" element={<PrincipalRoutes />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['counsellor']} />}>
                    <Route path="/counselor/*" element={<CounselorRoutes />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </Router>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
