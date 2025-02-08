'use client';

import Loading from '@/components/Loading/Loading';
import { LoadingProvider } from '@/components/Providers/LoadingProvider';
import { store } from '@/store';
import { NextUIProvider } from '@nextui-org/react';
import { Provider } from 'react-redux';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <LoadingProvider>
        <Loading />
        <Provider store={store}>{children}</Provider>
      </LoadingProvider>
    </NextUIProvider>
  );
}
