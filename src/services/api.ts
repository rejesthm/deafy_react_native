/**
 * API service for backend communication
 */

import axios, {AxiosInstance, AxiosError} from 'axios';
import {DeafyUser, LoginCredentials, RegistrationData} from '@models/User';
import * as Keychain from 'react-native-keychain';

// API Base URL - Update with your backend URL
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api' // Development
  : 'https://api.deafy.app/api'; // Production

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async config => {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          config.headers.Authorization = `Bearer ${credentials.password}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          Keychain.resetGenericPassword();
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Store authentication token securely
   */
  async storeToken(token: string): Promise<void> {
    await Keychain.setGenericPassword('auth_token', token);
  }

  /**
   * Get stored authentication token
   */
  async getToken(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword();
    return credentials ? credentials.password : null;
  }

  /**
   * Clear authentication token
   */
  async clearToken(): Promise<void> {
    await Keychain.resetGenericPassword();
  }
}

const apiService = new ApiService();

/**
 * Authentication endpoints
 */

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<{user: DeafyUser; token: string}> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    const {user, token} = response.data;

    // Store token securely
    await apiService.storeToken(token);

    return {user, token};
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const registerUser = async (
  data: RegistrationData,
): Promise<{user: DeafyUser; token: string}> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    const {user, token} = response.data;

    // Store token securely
    await apiService.storeToken(token);

    return {user, token};
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logoutUser = async (): Promise<void> => {
  await apiService.clearToken();
};

/**
 * User endpoints
 */

export const getCurrentUser = async (): Promise<DeafyUser> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/me`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
};

export default apiService;
