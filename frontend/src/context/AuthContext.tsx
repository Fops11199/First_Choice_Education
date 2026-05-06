import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../api/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (full_name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: any) => void;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const formatError = (err: any) => {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail[0]?.msg || "Invalid input provided";
    }
    return "An unexpected error occurred.";
  };

  const clearError = () => setError(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email.trim().toLowerCase());
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (err: any) {
      const message = formatError(err);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (full_name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        full_name,
        email: email.trim().toLowerCase(),
        password
      });
      const { access_token, user: newUserData } = response.data;
      localStorage.setItem('token', access_token);
      setUser(newUserData);
      setIsAuthenticated(true);
      return true;
    } catch (err: any) {
      const message = formatError(err);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.info("Logged Out", { description: "You have been safely signed out." });
  };

  const updateUser = (data: any) => setUser(data);

  return (
    <AuthContext.Provider value={{ 
      user, loading, error, login, register, logout, updateUser, clearError, isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
