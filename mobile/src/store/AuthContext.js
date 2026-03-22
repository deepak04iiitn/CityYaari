import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Update this to your local machine IP if testing on a physical device
const API_BASE_URL = 'http://192.168.31.65:5000/api'; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Optionally verify token with backend here
      }
    } catch (error) {
      console.error('Failed to load auth data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        identifier,
        password,
      });

      const { token, ...userData } = response.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async ({
    fullName,
    username,
    email,
    password,
    occupationType,
    country,
    state,
    city,
    securityQuestion,
    securityAnswer,
  }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        fullName,
        username,
        email,
        password,
        occupationType,
        country,
        state,
        city,
        securityQuestion,
        securityAnswer,
      });

      const { token, ...userData } = response.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const getForgotPasswordQuestion = async (identifier) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password/question`, {
        identifier,
      });

      return {
        success: true,
        securityQuestion: response.data.securityQuestion,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Could not find that account',
      };
    }
  };

  const verifySecurityAnswer = async (identifier, securityAnswer) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password/verify-answer`, {
        identifier,
        securityAnswer,
      });

      return {
        success: true,
        resetToken: response.data.resetToken,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Security answer did not match',
      };
    }
  };

  const resetForgottenPassword = async (resetToken, newPassword) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password/reset`, {
        resetToken,
        newPassword,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Could not reset password',
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        getForgotPasswordQuestion,
        verifySecurityAnswer,
        resetForgottenPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
