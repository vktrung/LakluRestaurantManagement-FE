export type Shift = {
  id: number;
  timeIn: string;
  timeOut: string;
  detail: {
    id: number;
    managerFullName: string;
    numberOfStaff: number;
    userFullNames: string[];
    note: string;
    timeIn: string;
    timeOut: string;
    attended: string; 
    userAttendancesByFullName: { [key: string]: boolean };
  };
};
export type GetShiftsByDateRangeRequest = {
  startDate: string;
  endDate: string;
};
export type GetShiftsByStaffAndDateRangeRequest = {
  staffId: number;   
  startDate: string;  
  endDate: string;    
};
export type GetShiftsByDateRangeResponse = {
  data: Shift[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error?: any;
};

export type GetAllShiftsResponse = {
  data: Shift[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: any;
};
export type GetShiftById = {
  data: AddShiftRequest;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: any;
};
export interface Staff {
  id: number;
  username: string;
  email: string;
}
export type UserShift = {
  staffId: number;
  isManager: boolean;
};

export type AddShiftRequest = {
  user: UserShift[];
  shiftStart: string;
  shiftEnd: string;  
  shiftType: 'MORNING' | 'EVENING' | 'NIGHT' | 'MORNING_TO_EVENING' | 'EVENING_TO_NIGHT' | 'FULL_DAY';
  note: string;
};

export type UpdateShiftRequest = {
  user: UserShift[];
  shiftStart: string;
  shiftEnd: string;
  shiftType: 'MORNING' | 'EVENING' | 'NIGHT' | 'MORNING_TO_EVENING' | 'EVENING_TO_NIGHT' | 'FULL_DAY';
  note: string;
};
export type CheckInSuccessRequest = {
  scheduleId: Number;
  expiry: number;
  signature: string;
  username: string;
  password: string;
};
export type CheckinSuccessResponse = {
  data: string;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: any;
};
export type CheckinResponse =
  | { url: string }
  | { message: string; httpStatus: number; timestamp?: string; error?: any };
