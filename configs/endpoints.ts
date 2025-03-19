export const endpoints = {
  login: '/api/v1/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  requestResetPassword: '/auth/forgot-password',
  confirmResetPassword: '/auth/forgot-password/reset',
  me: '/users/me',
  getListStaff: '/api/v1/users/',
  CategoryApi:'/api/v1/categories/',
  SalaryRatesApi:'/api/v1/salary-rates/',
  // addStaff : '/api/v1/users',
  getRoles: '/api/v1/roles/',

  getPermissions : '/api/v1/permissions/',
  DishApi:'/api/v1/dishes/',
  MenuApi:'/api/v1/menus/',
  MenuItemApi: '/api/v1/menu-items/',
  FileAttachmentApi: '/api/v1/attachments',
  TableApi: '/api/v1/tables/',
  ReservationApi: '/api/v1/reservations/',
  PaymentApi: 'api/v1/payments/',
  
  ScheduleApi:'/api/v1/schedule/'
}
