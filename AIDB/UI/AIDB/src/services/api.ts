import type { ApiResponse, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7038/api';

export const apiClient = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  post: async <T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  put: async <T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

// Auth service
export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    // Mock authentication for now — replace with real API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@aidb.com' && password === 'password') {
          resolve({
            token: 'mock-jwt-token',
            user: {
              id: '1',
              name: 'Admin User',
              email: 'admin@aidb.com',
              role: 'Admin',
              avatar: '',
            },
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
};
