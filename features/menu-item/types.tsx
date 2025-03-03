export interface MenuItem {
    id: number;
    dishId: number;
    menuId: number;
    categoryId: number;
    price: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    dish : Dish;
  }
  
  export interface MenuItemResponse {
    data: MenuItem[];
    message: string;
    httpStatus: number;
    timestamp: string;
    error: null | string;
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
  export interface Menu {
    id: number;
    name: string;
    startAt: string;
    endAt: string;
    status: string;
    menuItems: MenuItem[];
  }
   export interface MenuByIdResponse {
      data: MenuItem;
      message: string;
      httpStatus: number;
      timestamp: string;
      error: null | string;
    }
  export interface MenuItemRequest {
    dishId: number;
    menuId: number;
    categoryId: number;
    price: number;
    status: string;
  }
  