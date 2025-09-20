// Authentication API services

import { apiClient } from '../api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'invoicing_user' | 'contact';
  phone?: string;
  address?: string;
  is_verified: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'invoicing_user' | 'contact';
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// Authentication API functions
export const authApi = {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/users/users/login/', credentials);
    apiClient.setToken(response.tokens.access);
    return response;
  },

  // Register user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/users/users/register/', userData);
    apiClient.setToken(response.tokens.access);
    return response;
  },

  // Logout user
  async logout(): Promise<void> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refresh_token') 
      : null;
    
    if (refreshToken) {
      await apiClient.post('/users/users/logout/', { refresh_token: refreshToken });
    }
    
    apiClient.clearToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh_token');
    }
  },

  // Refresh token
  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refresh_token') 
      : null;
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ access: string }>('/users/users/refresh_token/', {
      refresh_token: refreshToken,
    });

    apiClient.setToken(response.access);
    return response;
  },

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/users/users/me/');
  },

  // Update current user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    return apiClient.put<User>('/users/users/update_me/', userData);
  },

  // Change password
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/users/users/change_my_password/', passwordData);
  },
};
