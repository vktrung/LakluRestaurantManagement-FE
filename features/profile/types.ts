export interface Profile {
  id: number;
  userId: number;
  username: string;
  email: string;
  fullName: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  address: string | null;
  avatar: string | null;
  department: string | null;
  employmentStatus: 'WORKING' | 'TERMINATED' | 'ON_LEAVE' | 'SUSPENDED';
  hireDate: string;
  bankAccount: string | null;
  bankNumber: string | null;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
}

export interface ActivityLog {
  id: number;
  staffId: number;
  action: string;
  target: string;
  targetId: string;
  details: string;
  message: string;
  createdAt: string;
  userInfo: UserInfo;
}

export interface ApiResponse {
  code: string;
  message: string;
  data?: any;
} 