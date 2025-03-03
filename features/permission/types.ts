// types.ts

export interface Permission {
  id: number;
  alias: string;
  name: string;
  // Sau khi chuyển đổi, description sẽ là plain text (hoặc null)
  description: string | null;
}

export interface PermissionGroup {
  groupName: string;
  groupAlias: string;
  groupDescription: string;
  permissions: Permission[];
}

export interface PermissionGroupResponse {
  data: PermissionGroup[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export interface UpdatePermissionPayload {
  id: number; // ID của permission cần cập nhật
  name?: string; // Các trường tùy theo API cho phép cập nhật
  alias?: string;
  // Description được gửi đi là plain text (ví dụ: "test")
  description?: string;
}
