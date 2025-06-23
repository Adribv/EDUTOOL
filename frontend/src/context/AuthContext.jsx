import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI, api } from '../services/api';
import { placeholderData, getPlaceholderData, createMockResponse } from '../services/placeholderData';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (token) {
        // Try to get profile from staff endpoint first (most common case)
        try {
          const response = await api.get('/api/staffs/profile');
          setUser(response.data);
        } catch (staffError) {
          // If staff profile fails, try other endpoints
          try {
            const response = await api.get('/api/students/profile');
            setUser(response.data);
          } catch (studentError) {
            try {
              const response = await api.get('/api/parents/profile');
              setUser(response.data);
            } catch (parentError) {
              // If all fail, use placeholder data based on stored role or default to staff
              const storedRole = localStorage.getItem('userRole') || 'adminstaff';
              const placeholderProfile = getPlaceholderData(storedRole, 'profile');
              setUser(placeholderProfile);
              console.warn('Using placeholder profile data');
              toast.info('Using demo data - some features may be limited');
            }
          }
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
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
      
      localStorage.setItem('token', token);
      
      // For staff login, the backend only returns token and role
      // We need to fetch the full user profile after login
      let userProfile;
      if (userType === 'staff' && !userData) {
        // Fetch the full user profile using the correct endpoint
        try {
          const profileResponse = await api.get('/api/staffs/profile');
          userProfile = profileResponse.data;
        } catch (profileError) {
          // If profile fetch fails, use placeholder data
          const userRole = role || 'adminstaff';
          userProfile = getPlaceholderData(userRole, 'profile');
          console.warn('Using placeholder profile data after login');
          toast.info('Using demo data - some features may be limited');
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