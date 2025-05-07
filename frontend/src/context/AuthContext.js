import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null
  });

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setAuth({
          isAuthenticated: true,
          user: userData,
          token: userData.token || null
        });
        
        // Set the default authorization header for axios
        if (userData.token) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Update auth state handler
  const updateAuth = (authData) => {
    setAuth(authData);
    
    // Update axios default headers when auth changes
    if (authData.isAuthenticated && authData.user?.token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authData.user.token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider value={{ ...auth, setAuth: updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
