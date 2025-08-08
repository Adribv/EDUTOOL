import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box, useTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { lazy, Suspense } from 'react';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';
import { StaffPermissionProvider } from './context/StaffPermissionContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeAwareWrapper from './components/ThemeAwareWrapper';


// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load all pages for better performance
const Register = lazy(() => import('./pages/auth/Register'));
const StudentLogin = lazy(() => import('./pages/auth/StudentLogin'));
const StudentRegister = lazy(() => import('./pages/auth/StudentRegister'));
const ParentLogin = lazy(() => import('./pages/auth/ParentLogin'));
const ParentRegister = lazy(() => import('./pages/auth/ParentRegister'));
const ManagementLogin = lazy(() => import('./pages/auth/ManagementLogin'));
const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AccountantLogin = lazy(() => import('./pages/auth/AccountantLogin'));
const AccountantDashboard = lazy(() => import('./pages/accountant/EnhancedAccountantDashboard'));
const AccountantProfile = lazy(() => import('./pages/accountant/AccountantProfile'));

// Main Dashboard
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Role-specific Dashboard Components - Simplified imports
const DashboardModule = lazy(() => import('./pages/Dashboard'));

// Student Pages
const StudentRoutes = lazy(() => import('./routes/StudentRoutes'));
// Parent Pages
const ParentRoutes = lazy(() => import('./routes/ParentRoutes'));
// Management Pages (unified for all management roles)
const ManagementRoutes = lazy(() => import('./routes/ManagementRoutes'));
// Individual route components (kept for backward compatibility)
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));
const TeacherRoutes = lazy(() => import('./routes/TeacherRoutes'));
const HODRoutes = lazy(() => import('./routes/HODRoutes'));
const PrincipalRoutes = lazy(() => import('./routes/PrincipalRoutes'));
const CounselorRoutes = lazy(() => import('./routes/CounselorRoutes'));
// Vice Principal Pages
const VicePrincipalDashboard = lazy(() => import('./pages/viceprincipal/VicePrincipalDashboard'));

// Loading component
const LoadingSpinner = () => {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      sx={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' }}
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
        <ThemeProvider>
          <Router>
            <AuthProvider>
              <StaffPermissionProvider>
                <ThemeAwareWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    {/* Public Auth Routes */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/student-login" element={<StudentLogin />} />
                    <Route path="/student-register" element={<StudentRegister />} />
                    <Route path="/parent-login" element={<ParentLogin />} />
                    <Route path="/parent-register" element={<ParentRegister />} />
                    <Route path="/management-login" element={<ManagementLogin />} />
                    <Route path="/accountant-login" element={<AccountantLogin />} />
                    
                    {/* Main Dashboard Route */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* Temporary Test Dashboard Route (no auth/role protection) */}
                    <Route path="/test-dashboard" element={<Dashboard />} />
                    
                    {/* Role-specific Dashboard Routes */}
                    <Route path="/dashboard/librarian" element={<DashboardModule />} />
                    <Route path="/dashboard/counselor" element={<DashboardModule />} />
                    <Route path="/dashboard/ptteacher" element={<DashboardModule />} />
                    <Route path="/dashboard/eventhandler" element={<DashboardModule />} />
                    <Route path="/dashboard/transportmanager" element={<DashboardModule />} />
                    <Route path="/dashboard/softskillsmanager" element={<DashboardModule />} />
                    <Route path="/dashboard/admin" element={<DashboardModule />} />
                    
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
                      <Route path="/student/*" element={<StudentRoutes />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['Parent']} />}>
                      <Route path="/parent/*" element={<ParentRoutes />} />
                    </Route>
                    {/* Management Routes - Unified system for all management roles */}
                    <Route element={<ProtectedRoute allowedRoles={['Admin', 'Principal', 'Vice Principal', 'HOD', 'Teacher', 'Librarian', 'Wellness Counsellor', 'IT Support', 'Accountant', 'AdminStaff']} />}>
                      <Route path="/management/*" element={<ManagementRoutes />} />
                    </Route>
                    
                    {/* Individual role routes (kept for backward compatibility) */}
                    <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
                      <Route path="/teacher/*" element={<TeacherRoutes />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['AdminStaff', 'Admin']} />}>
                      <Route path="/admin/*" element={<AdminRoutes />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['HOD']} />}>
                      <Route path="/hod/*" element={<HODRoutes />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['Principal']} />}>
                      <Route path="/principal/*" element={<PrincipalRoutes />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['Counsellor', 'Wellness Counsellor']} />}>
                      <Route path="/counselor/*" element={<CounselorRoutes />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['VicePrincipal', 'Vice Principal']} />}>
                      <Route path="/viceprincipal/dashboard" element={<VicePrincipalDashboard />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['Accountant']} />}>
                      <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
                      <Route path="/accountant/profile" element={<AccountantProfile />} />
                    </Route>
                    


                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </ThemeAwareWrapper>
              </StaffPermissionProvider>
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
