import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container = ({ children, className }: ContainerProps) => {
  return (
    <div
      className={cn('mx-auto w-full max-w-screen-xl px-4 md:px-6', className)}
    >
      {children}
    </div>
  );
};
