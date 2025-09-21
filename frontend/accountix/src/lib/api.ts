// API Configuration and utilities for connecting to Django backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

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
      console.log('Making API request to:', url);
      const response = await fetch(url, config);
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.warn('Could not parse error response as JSON');
        }
        
        
        // Provide more specific error messages based on status code
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden.';
        } else if (response.status === 404) {
          errorMessage = 'API endpoint not found.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (errorData && typeof errorData === 'object' && 'message' in errorData) {
          errorMessage = String(errorData.message);
        } else if (errorData && typeof errorData === 'object' && 'detail' in errorData) {
          errorMessage = String(errorData.detail);
        }
        
        throw new ApiError(errorMessage, response.status, errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiError(
          'Unable to connect to the server. Please check if the backend is running and try again.',
          0
        );
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        0
      );
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    let fullEndpoint = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullEndpoint += (endpoint.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(fullEndpoint);
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
