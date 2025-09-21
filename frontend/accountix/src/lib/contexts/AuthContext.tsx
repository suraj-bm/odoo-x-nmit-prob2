'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, authApi } from '../services/auth';
import { ApiError, apiClient } from '../api';

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
      // Only run on client side
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
        console.log('checkAuth - token exists:', !!token);
        
        if (!token) {
          console.log('No token found, user not authenticated');
          setUser(null);
          setLoading(false);
          return;
        }

        // Try to validate the token by getting user profile
        console.log('Validating token...');
        apiClient.setToken(token);
        const currentUser = await authApi.getCurrentUser();
        console.log('User authenticated successfully:', currentUser);
        setUser(currentUser);
        
      } catch (error) {
        console.log('Token validation failed:', error);
        // Token is invalid, clear all token variations
        localStorage.removeItem('auth_token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        console.log('checkAuth completed, loading set to false');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting login process...');
      const response = await authApi.login({ username, password });
      console.log('Login successful, setting user:', response.user);
      
      // Store tokens with consistent keys
      localStorage.setItem('auth_token', response.tokens.access);
      localStorage.setItem('accessToken', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('refreshToken', response.tokens.refresh);
      
      console.log('Tokens stored:', {
        auth_token: localStorage.getItem('auth_token') ? 'exists' : 'missing',
        accessToken: localStorage.getItem('accessToken') ? 'exists' : 'missing'
      });
      
      // Set user state
      setUser(response.user);
      
      console.log('User state set, authentication should be complete');
      // Don't redirect here - let the login page handle it
      
    } catch (err) {
      console.error('Login failed:', err);
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
      
      // Store tokens with consistent keys
      localStorage.setItem('auth_token', response.tokens.access);
      localStorage.setItem('accessToken', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('refreshToken', response.tokens.refresh);
      
      // Redirect to dashboard after successful registration
      window.location.href = '/dashboard';
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
      // Clear all token variations
      localStorage.removeItem('auth_token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('refreshToken');
      // Redirect to login page
      window.location.href = '/loginpage';
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
