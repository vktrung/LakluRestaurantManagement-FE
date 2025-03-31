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

export interface PagedDishContent {
  content: Dish[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface PagedDishResponse {
  data: PagedDishContent;
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

export interface DishesParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
