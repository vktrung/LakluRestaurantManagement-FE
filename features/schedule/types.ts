export type Shift = {
  id: number;
  date: string;        
  dayOfWeek: string;   
  timeIn: string;      
  timeOut: string;     
  detail: {
    id: number;
    attended: boolean;
    manager: string | null;  
    numberOfStaff: number;   
    usernames: string[];    
    note: string;           
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
  shiftType: 'MORNING' | 'EVENING' | 'NIGHT';
  note: string;
};

export type UpdateShiftRequest = {
  user: UserShift[];
  shiftStart: string;
  shiftEnd: string;
  shiftType: 'MORNING' | 'EVENING' | 'NIGHT';
  note: string;
};
export type  CheckInSuccessRequest ={ 
  scheduleId: Number;
  expiry: number;
  signature: string;
  username: string;
  password: string;
};
export type  CheckinSuccessResponse ={ 
  data: string;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: any;
};
export type CheckinResponse =
  | { url: string } 
  | { message: string; httpStatus: number; timestamp?: string; error?: any };
