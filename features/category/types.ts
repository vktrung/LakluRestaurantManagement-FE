// category/types.ts
export interface Category {
  id: number; 
  name: string;
  description: null | string;
  createdAt: string; 
  updatedAt: null | string;
  isDeleted: boolean;
}

export interface CategoryResponse {
  data: Category[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}
export interface CategoryByIdResponse {
  data: Category;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}
export interface CategoryRequest {
  name: string;
  description: string;
}