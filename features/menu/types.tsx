
export enum MenuStatus {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

export enum MenuItemStatus {
  ENABLE = "enable",
  DISABLE = "disable",
}

export interface Image {
  id: number;
  link: string;
  name: string;
}

export interface Dish {
  id: number;
  name: string;
  description: string;
  createdAt: string; 
  updatedAt: string; 
  price: number;
  images: Image[];
}

export interface MenuItem {
   id: number;
     dishId: number;
     menuId: number;
     categoryId: number;
     price: number;
     status: string;
     createdAt: string;
     updatedAt: string;
  dish: Dish;
  
}

export interface Menu {
  id: number;
  name: string;
  startAt: string; 
  endAt: string;   
  status: MenuStatus;
  menuItems: MenuItem[];
}

export interface MenuByIdResponse {
  data: Menu;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}

export interface MenuResponse {
  data: Menu[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}
export interface MenuItemByIdResponse {
  data: Menu;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}
export interface MenuRequest {
  name: string;
  startAt: string;  
  endAt: string;    
  status: "ENABLE" | "DISABLE";
}