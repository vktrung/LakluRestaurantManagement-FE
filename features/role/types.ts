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
