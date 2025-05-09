import { authApiSlice } from '@/features/auth/authApiSlice';
import { profileApiSlice } from '@/features/profile/profileApiSlice';

import { configureStore } from '@reduxjs/toolkit';
// import { authApiSlice } from '@/features/auth/authApiSlice';
import { staffApiSlice } from './features/staff/staffApiSlice';
import { roleApiSlice } from './features/role/roleApiSlice';
import { categoryApiSlice } from './features/category/categoryApiSlice';
import { salaryApiSlice } from './features/salary/salaryApiSlice';
import { payrollApiSlice } from './features/payroll/payrollApiSlice';
import { permissionApiSlice } from './features/permission/permissionApiSlice';
import { dishApiSlice } from './features/dish/dishApiSlice';
import { menuApiSlice } from './features/menu/menuApiSlice';
import { menuItemApiSlice } from './features/menu-item/menuItemApiSlice';
import { fileAttachmentApiSlice } from './features/file-attachment/fileAttachmentApiSlice';
import { tableApiSlice } from './features/table/tableApiSlice';
import { reservationApiSlice } from './features/reservation/reservationApiSlice';
import { scheduleApiSlice } from './features/schedule/scheduleApiSlice';
import { orderCashierApiSlice } from './features/order-cashier/orderCashierApiSlice';
import { orderApiSlice } from './features/order/orderApiSlice';
import { paymentApiSlice } from './features/payment/PaymentApiSlice';
// import {scheduleApiSlice} from './features/schedule/scheduleApiSlice';
import { statisticsApiSlice } from '@/features/statistics/statisticsApiSlice';
import { voucherApiSlice } from './features/voucher/voucherApiSlice';
import { activityLogApiSlice } from './features/activitylog/activityLogApiSlice';
import { tableOrderApiSlice } from './features/table-order/table-orderApiSlice';
import { cashRegisterApi } from './features/cash-register/cashregisterApiSlice';

export const store = configureStore({
  reducer: {
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [profileApiSlice.reducerPath]: profileApiSlice.reducer,
    [staffApiSlice.reducerPath]: staffApiSlice.reducer,
    [categoryApiSlice.reducerPath]: categoryApiSlice.reducer,
    [salaryApiSlice.reducerPath]: salaryApiSlice.reducer,
    [roleApiSlice.reducerPath]: roleApiSlice.reducer,
    [permissionApiSlice.reducerPath]: permissionApiSlice.reducer,
    [dishApiSlice.reducerPath]: dishApiSlice.reducer,
    [menuApiSlice.reducerPath]: menuApiSlice.reducer,
    [menuItemApiSlice.reducerPath]: menuItemApiSlice.reducer,
    [fileAttachmentApiSlice.reducerPath]: fileAttachmentApiSlice.reducer,
    [tableApiSlice.reducerPath]: tableApiSlice.reducer,
    [reservationApiSlice.reducerPath]: reservationApiSlice.reducer,
    [scheduleApiSlice.reducerPath]: scheduleApiSlice.reducer,
    [paymentApiSlice.reducerPath]: paymentApiSlice.reducer,
    [orderCashierApiSlice.reducerPath]: orderCashierApiSlice.reducer,
    [orderApiSlice.reducerPath]: orderApiSlice.reducer,
    [statisticsApiSlice.reducerPath]: statisticsApiSlice.reducer,
    [payrollApiSlice.reducerPath]: payrollApiSlice.reducer,
    [voucherApiSlice.reducerPath]: voucherApiSlice.reducer,
    [activityLogApiSlice.reducerPath]: activityLogApiSlice.reducer,
    [tableOrderApiSlice.reducerPath]: tableOrderApiSlice.reducer,
    [cashRegisterApi.reducerPath]: cashRegisterApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApiSlice.middleware)
      .concat(profileApiSlice.middleware)
      .concat(staffApiSlice.middleware)
      .concat(categoryApiSlice.middleware)
      .concat(salaryApiSlice.middleware)
      .concat(roleApiSlice.middleware)
      .concat(permissionApiSlice.middleware)
      .concat(roleApiSlice.middleware)
      .concat(dishApiSlice.middleware)
      .concat(menuApiSlice.middleware)
      .concat(menuItemApiSlice.middleware)
      .concat(fileAttachmentApiSlice.middleware)
      .concat(tableApiSlice.middleware)
      .concat(reservationApiSlice.middleware)
      .concat(scheduleApiSlice.middleware)
      .concat(orderCashierApiSlice.middleware)
      .concat(paymentApiSlice.middleware)
      .concat(orderApiSlice.middleware)
      .concat(statisticsApiSlice.middleware)
      .concat(payrollApiSlice.middleware)
      .concat(activityLogApiSlice.middleware)
      .concat(voucherApiSlice.middleware)
      .concat(tableOrderApiSlice.middleware)
      .concat(cashRegisterApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;