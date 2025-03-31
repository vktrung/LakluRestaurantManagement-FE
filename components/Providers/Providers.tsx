'use client';

import Loading from '@/components/Loading/Loading';
import { LoadingProvider } from '@/components/Providers/LoadingProvider';
import { store } from '@/store';
import { Provider } from 'react-redux';
import { NotificationProvider } from '@/components/NotificationContext/NotificationContext';
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      <Loading />
      <Provider store={store}>
        <NotificationProvider>{children}</NotificationProvider>
      </Provider>
    </LoadingProvider>
  );
}
