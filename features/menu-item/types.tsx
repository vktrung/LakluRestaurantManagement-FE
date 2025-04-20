export interface MenuItem {
  id: number;
  dishId: number;
  menuId: number;
  categoryId: number;
  price: number;
  status: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  dish: Dish;
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
  requiresPreparation?: boolean;
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
export interface MenuItemWithCategory {
  id: number;
  menuId: number;
  price: number;
  isActive: boolean;
  dish: Dish;
  category: Category;
}
export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
export interface GetMenuItemsByMenuIdResponse {
  data: {
    content: MenuItemWithCategory[];
    pagination: Pagination;
  };
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
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
  isActive: boolean;
}
export interface UpdateMenuItemStatusResponse{
  data: string;
  message: string;
  httpStatus: number;
  timestamp: string;
  error: null | string;
}