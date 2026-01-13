// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check auth status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
        withCredentials: true
      });
      setUser(response.data.user || response.data.data);
    } catch (error) {
      console.log('Auth check failed - not logged in');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.log('Logout API failed');
    }
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    logout,
    checkAuthStatus,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
