import { authApiSlice } from '@/features/auth/authApiSlice';

import { configureStore } from '@reduxjs/toolkit';
import { staffApiSlice } from './features/staff/staffApiSlice';
import { roleApiSlice } from './features/role/roleApiSlice';
import { categoryApiSlice } from './features/category/categoryApiSlice';
import { salaryApiSlice } from './features/salary/salaryApiSlice';

import { permissionApiSlice } from './features/permission/permissionApiSlice';



import { dishApiSlice } from './features/dish/dishApiSlice';
import {menuApiSlice} from './features/menu/menuApiSlice';
import {menuItemApiSlice} from './features/menu-item/menuItemApiSlice';
import {fileAttachmentApiSlice} from './features/file-attachment/fileAttachmentApiSlice';
import { tableApiSlice } from './features/table/tableApiSlice';
export const store = configureStore({
  reducer: {
    [authApiSlice.reducerPath]: authApiSlice.reducer,
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
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
  .concat(authApiSlice.middleware)
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
  .concat(tableApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
