'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, authApi } from '../services/auth';
import { ApiError } from '../api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: ApiError | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'invoicing_user' | 'contact';
    phone?: string;
    address?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (passwordData: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInvoicingUser: boolean;
  isContact: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        }
    } catch {
      // Token is invalid, clear it
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.login({ username, password });
      setUser(response.user);
      
      // Store refresh token
      localStorage.setItem('refresh_token', response.tokens.refresh);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Login failed', 0);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'invoicing_user' | 'contact';
    phone?: string;
    address?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.register(userData);
      setUser(response.user);
      
      // Store refresh token
      localStorage.setItem('refresh_token', response.tokens.refresh);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Registration failed', 0);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore logout errors
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      setError(null);
      const updatedUser = await authApi.updateProfile(userData);
      setUser(updatedUser);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Profile update failed', 0);
      setError(apiError);
      throw apiError;
    }
  };

  const changePassword = async (passwordData: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => {
    try {
      setError(null);
      await authApi.changePassword(passwordData);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Password change failed', 0);
      setError(apiError);
      throw apiError;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isInvoicingUser = user?.role === 'invoicing_user';
  const isContact = user?.role === 'contact';

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    isAdmin,
    isInvoicingUser,
    isContact,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
