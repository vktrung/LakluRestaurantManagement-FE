export interface Staff {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  roles: string[];
  nameSalaryRate: string;
  profile: Profile;
}

export interface Profile {
  id: number;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  avatar: string | null;
  employmentStatus: 'WORKING' | 'RESIGNED' | 'TEMPORARY_LEAVE';
  hireDate: string;
  bankAccount: string;
  bankNumber: string;
  avatarImages: string | null;
  department: string;
}

export interface PaginatedUsers {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  users: Staff[];
}

export interface StaffResponse {
  data: PaginatedUsers;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export interface StaffByIdResponse {
  data: Staff;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export interface CreateStaffPayload {
  username: string;
  password: string;
  email: string;
  department: string;
  roleIds: number[];
  salaryRateId: number;
}