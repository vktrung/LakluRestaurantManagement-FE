'use client';

import Loading from '@/components/Loading/Loading';
import { LoadingProvider } from '@/components/Providers/LoadingProvider';
import { store } from '@/store';
import { Provider } from 'react-redux';
import { NotificationProvider } from '@/components/NotificationContext/NotificationContext';
import { Toaster } from 'sonner';

// Tạo một component trung gian để đảm bảo NotificationProvider
// chỉ được mount sau khi Redux store đã sẵn sàng
function NotificationWrapper({ children }: { children: React.ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      <Loading />
      <Provider store={store}>
        <NotificationWrapper>
          <Toaster richColors position="top-right" />
          {children}
        </NotificationWrapper>
      </Provider>
    </LoadingProvider>
  );
}
