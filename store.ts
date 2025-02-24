import { authApiSlice } from '@/features/auth/authApiSlice';

import { configureStore } from '@reduxjs/toolkit';
import { staffApiSlice } from './features/staff/staffApiSlice';
import { roleApiSlice } from './features/role/roleApiSlice';
import { categoryApiSlice } from './features/category/categoryApiSlice';
import { salaryApiSlice } from './features/salary/salaryApiSlice';

export const store = configureStore({
  reducer: {
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [staffApiSlice.reducerPath]: staffApiSlice.reducer,
    [categoryApiSlice.reducerPath]: categoryApiSlice.reducer,
    [salaryApiSlice.reducerPath]: salaryApiSlice.reducer,
    [roleApiSlice.reducerPath]: roleApiSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
  .concat(authApiSlice.middleware)
  .concat(staffApiSlice.middleware)
  .concat(categoryApiSlice.middleware)
  .concat(salaryApiSlice.middleware)
  .concat(roleApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
