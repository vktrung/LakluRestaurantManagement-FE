type SalaryType = "MONTHLY" | "HOURLY" | "SHIFTLY";

export interface EmployeeSalaryRequest {
  levelName: string;
  amount: number;
  type: SalaryType;
  isGlobal: boolean;
}

export interface EmployeeSalaryResponse {
  id: number;
  levelName: string;
  amount: number;
  type: SalaryType;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  data: EmployeeSalaryResponse[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}