export interface UserInfo {
  id: number;
  username: string;
  email: string;
}

export interface ActivityLog {
  id: number;
  staffId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  target: string;
  targetId: string;
  details: string;
  message: string;
  createdAt: string;
  userInfo: UserInfo;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface Sort {
  sorted: boolean;
  empty: boolean;
  unsorted: boolean;
}

export interface ActivityLogsData {
  content: ActivityLog[];
  pageable: Pageable;
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  empty: boolean;
}

export interface ActivityLogsResponse {
  data: ActivityLogsData;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: string | null;
}

export interface GetActivityLogsParams {
  startTime: string;
  endTime: string;
  page?: number;
  size?: number;
  sort?: string[];
} 