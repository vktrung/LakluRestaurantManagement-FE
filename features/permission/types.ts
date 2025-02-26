export interface Permission {
  id: number;
  alias: string;
  name: string;
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
