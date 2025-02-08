import { UserRole } from '@/enums/roles.enums';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginApiResponse {
  accessToken: {
    value: string;
    expiresIn: string;
  };
  refreshToken: {
    value: string;
    expiresIn: string;
  };
}

export interface RegisterCredentials {
  username: string;
  email: string;
  name: string;
  dob?: string;
  role?: UserRole;
  password: string;
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
