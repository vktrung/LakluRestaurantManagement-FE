export interface Staff {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  roles: string[];
}

export interface StaffResponse {
  data: Staff[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}