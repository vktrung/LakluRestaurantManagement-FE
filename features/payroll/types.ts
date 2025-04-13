export interface Payslip {
  payslipId: number;
  staffId: number;
  staffName: string;
  salaryMonth: string;
  totalWorkingDays: number;
  totalWorkingHours: number;
  totalSalary: number;
  lateCount: number;
  lateHours: number;
}

export interface PayslipResponse {
  data: Payslip[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}
