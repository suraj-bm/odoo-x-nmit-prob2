// API Configuration and utilities for connecting to Django backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API Error class
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Generic API client
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        0
      );
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export API base URL for other uses
export { API_BASE_URL };
