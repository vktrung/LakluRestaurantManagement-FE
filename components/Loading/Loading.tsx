import { useLoading } from '@/components/Providers/LoadingProvider';
import { Spinner } from '@nextui-org/react';
import React from 'react';

const Loading = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{
        zIndex: 1000000,
      }}
    >
      <Spinner size="md" />
    </div>
  );
};

export default Loading;
