/**
 * User model matching Flutter implementation
 * Matches: lib/models/user/deafy_user.dart
 */

export interface DeafyUser {
  id?: number;
  name?: string;
  email: string;
  isAuthenticated?: boolean;
  photoUrl?: string;
  phoneNumber?: string;
  createdAt?: Date;
  lastLoginAt?: Date;
}

export interface AuthState {
  user: DeafyUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}
