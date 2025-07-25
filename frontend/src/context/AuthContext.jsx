import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI, api } from '../services/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (token) {
        const storedRole = localStorage.getItem('userRole');
        // Determine primary endpoint based on stored role
        const endpointOrder = storedRole === 'Student' ? [
          '/students/profile',
          '/parents/profile',
          '/staffs/profile',
        ] : storedRole === 'Parent' ? [
          '/parents/profile',
          '/students/profile',
          '/staffs/profile',
        ] : [
          '/staffs/profile',
          '/students/profile',
          '/parents/profile',
        ];

        let fetched = false;
        for (const ep of endpointOrder) {
          if (fetched) break;
          try {
            const res = await api.get(ep);
            setUser(res.data);
            fetched = true;
          } catch (_err) { // eslint-disable-line no-unused-vars
            // continue
          }
        }
        if (!fetched) {
          console.error('Failed to fetch user profile from all endpoints');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      // No need to set an error here, as it might show up on public pages
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials, userType = 'staff') => {
    try {
      setError(null);
      setLoading(true);
      
      let response;
      if (userType === 'student') {
        response = await authAPI.studentLogin(credentials);
      } else if (userType === 'parent') {
        response = await authAPI.parentLogin(credentials);
      } else {
        response = await authAPI.staffLogin(credentials);
      }
      
      const { token, user: userData, role } = response.data;
      console.log(response.data);
      localStorage.setItem('token', token);
      
      // For staff login, the backend only returns token and role
      // We need to fetch the full user profile after login
      let userProfile;
      if (userType === 'staff' && !userData) {
        // Fetch the full user profile using the correct endpoint
        try {
          const profileResponse = await api.get('/staffs/profile');
          userProfile = profileResponse.data;
        } catch (profileError) {
          console.error('Failed to fetch user profile after login:', profileError);
          throw new Error('Failed to fetch user profile');
        }
      } else {
        userProfile = userData;
      }
      
      // Ensure the role is set in the user profile
      if (role && !userProfile.role) {
        userProfile.role = role;
      }
      
      // Store the role in localStorage for consistency
      if (userProfile.role) {
        localStorage.setItem('userRole', userProfile.role);
      }
      
      setUser(userProfile);
      
      toast.success('Login successful!');
      return userProfile;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setError(null);
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Error during logout');
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user,
    checkAuth,
  }), [user, loading, error, login, logout, updateUser, clearError, checkAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 