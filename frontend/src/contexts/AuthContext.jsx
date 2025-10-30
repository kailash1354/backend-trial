import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authAPI from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // CRITICAL: Added for ProtectedRoute
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from token on mount and after context changes
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // If the token is valid, getMe will update the user state
          const response = await authAPI.getMe();
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is expired, invalid, or user is unverified (401 error)
          console.error('Auth check failed (401 or Invalid Token):', error);
          localStorage.removeItem('authToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, token, refreshToken } = response.data;
      
      // CRITICAL FIX: Save tokens to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken); // Keep refresh token local
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      navigate('/');
      
      return { success: true };
    } catch (error) {
      // Catch specific backend error messages (like 'Please verify your email...')
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // *** FIX 1: DO NOT LOG IN UPON REGISTRATION ***
      // The user must verify their email first.
      
      toast.success(response.message || 'Registration successful! Check your email to verify.');
      navigate('/login'); // Redirect to login page
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false); // Reset authentication status
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update password function
  const updatePassword = async (passwords) => {
    try {
      await authAPI.updatePassword(passwords);
      toast.success('Password updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Upload avatar function
  const uploadAvatar = async (formData) => {
    try {
      const response = await authAPI.uploadAvatar(formData);
      setUser(response.data.user);
      toast.success('Avatar uploaded successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Avatar upload failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Add address function
  const addAddress = async (addressData) => {
    try {
      const response = await authAPI.addAddress(addressData);
      setUser(prevUser => ({
        ...prevUser,
        addresses: response.data.addresses
      }));
      toast.success('Address added successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Address addition failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update address function
  const updateAddress = async (addressId, addressData) => {
    try {
      const response = await authAPI.updateAddress(addressId, addressData);
      setUser(prevUser => ({
        ...prevUser,
        addresses: response.data.addresses
      }));
      toast.success('Address updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Address update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete address function
  const deleteAddress = async (addressId) => {
    try {
      const response = await authAPI.deleteAddress(addressId);
      setUser(prevUser => ({
        ...prevUser,
        addresses: response.data.addresses
      }));
      toast.success('Address deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Address deletion failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successful');
      navigate('/login');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Verify email function
  const verifyEmail = async (token) => {
    try {
      await authAPI.verifyEmail(token);
      toast.success('Email verified successfully! You can now log in.');
      
      // Update user data if they are currently logged in 
      // (though they shouldn't be, this is good for edge cases)
      if (user) {
        const response = await authAPI.getMe();
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated, // Expose isAuthenticated for use in ProtectedRoute
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    uploadAvatar,
    addAddress,
    updateAddress,
    deleteAddress,
    forgotPassword,
    resetPassword,
    verifyEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};