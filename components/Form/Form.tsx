'use client';

import Text from '@/components/Text';
import clsx from 'clsx';
import React, { forwardRef } from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';

export interface FormInterface {
  children: React.ReactNode;
  onSubmit: (data: Record<string, any>) => void;
  formMethods: UseFormReturn; // Updated to directly accept formMethods
  [key: string]: any;
}

const Form = (
  { children, onSubmit, formMethods, ...props }: FormInterface,
  ref: React.Ref<HTMLFormElement>,
) => {
  return (
    <div className={clsx('w-full', props.className)}>
      {props?.title && (
        <Text as={'h2'} className={clsx(props.description ? 'mb-2' : 'mb-10')}>
          {props.title}
        </Text>
      )}
      {props?.description && (
        <Text
          as={'p'}
          className="mb-10 font-normal text-[#00000066] text-center text-sm"
        >
          {props.description}
        </Text>
      )}
      <FormProvider {...formMethods}>
        <form
          noValidate
          onSubmit={e => {
            formMethods.handleSubmit(onSubmit)(e);
          }}
          className={clsx('w-full', props.classNameForm)}
          ref={ref}
        >
          {children}
        </form>
      </FormProvider>
    </div>
  );
};

export default forwardRef<HTMLFormElement, FormInterface>(Form);
