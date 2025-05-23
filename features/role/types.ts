export interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
}

export interface RoleResponse {
  data: Role[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}
export interface Permission {
  id: number;
  name: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  department: string;
  employmentStatus: string;
}

export interface RoleDetail {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  users: User[];
}

export interface RoleDetailResponse {
  data: RoleDetail;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}
/* --- Dữ liệu gửi lên để thêm vai trò mới --- */
export interface AddRoleRequest {
  name: string;
  description: string;
  permissions: number[];
}

/* --- Dữ liệu gửi lên để cập nhật vai trò --- */
export interface UpdateRoleRequest {
  id: number;
  name: string;
  description: string;
  permissions: number[];
}

/* --- Dữ liệu trả về sau khi thêm vai trò mới --- */
export interface AddRoleResponse {
  data: RoleDetail; // Giả sử API trả về chi tiết của vai trò mới được tạo
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}