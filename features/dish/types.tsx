export interface Dish {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  price: number;
  images: Image[];  
}

export interface Image {
  id: number;
  link: string;
  name: string;
}

export interface DishResponse {
  data: Dish[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}

export interface DishByIdResponse {
  data: Dish;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}

export interface DishRequest {
  name: string;
  description: string;
  imageIds: number[];  
  price: number;      
}
