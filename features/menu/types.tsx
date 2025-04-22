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
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  price: number;
  requiresPreparation?: boolean; // Added from new API response
  images: Image[];
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
}

export interface MenuItem {
  id: number;
  dishId: number;
  menuId: number;
  categoryId: number;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  dish: Dish;
  category?: Category; // Added from new API response
  isActive?: boolean; // Added from new API response
}

export interface Menu {
  id: number;
  name: string;
  startAt: string;
  endAt: string;
  status: MenuStatus;
  menuItems: MenuItem[];
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface MenuResponse {
  data: Menu[];
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}

export interface MenuByIdResponse {
  data: Menu;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}

export interface MenuItemByIdResponse {
  data: MenuItem;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}

export interface MenuDishesResponse {
  data: {
    content: MenuItem[];
    pagination: Pagination;
  };
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