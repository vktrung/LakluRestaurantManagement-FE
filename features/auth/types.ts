import { UserRole } from '@/enums/roles.enums';

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  token: string
  message?: string
}

export interface CheckUsernameRequest {
  username: string
}

export interface CheckUsernameResponse {
  exists: boolean
  message?: string
}

/**
 * Kiểu dữ liệu request và response của checkPassword
 */
export interface CheckPasswordRequest {
  username: string
  password: string
}

export interface CheckPasswordResponse {
  token: string
  message?: string
}

export interface LoginCredentials {
   username: string
   password: string
}

export interface LoginApiResponse {
  data: {
    token: string;
  };
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  name: string;
  dob?: string;
  role?: UserRole;
  password: string;
}
export interface UserMeResponse {
  data: {
    id: number;
    username: string;
    email: string;
    permissions: string[];
    nameSalary: string; 
  };
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}
export interface RegisterApiResponse {
  username: string;
  email: string;
  name: string;
  dob?: string | null;
  last_login?: string | null;
  id: string;
  role?: UserRole;
  created_at: string;
  updated_at: string;
}

export interface RequestResetPasswordCredentials {
  email: string;
}

export interface RequestResetPasswordApiResponse {
  message: string;
}

export interface ConfirmResetPasswordCredentials {
  newPassword: string;
}

export interface ConfirmResetPasswordApiResponse extends RegisterApiResponse {}

export interface LogoutCredentials {
  refreshToken: string;
}
