'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Form from '@/components/Form/Form';
import { passwordRegex } from '@/utils/regex';
import { Button, Input } from '@nextui-org/react';
import { useConfirmResetPasswordMutation } from '@/features/auth/authApiSlice';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoading } from '@/components/Providers/LoadingProvider';

export const FormResetPassword = () => {
  const formMethods = useForm({
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const {
    control,
    watch,
    setError,
    formState: { errors },
  } = formMethods;

  const newPassword = watch('newPassword');
  const { showLoading, hideLoading } = useLoading();
  const [confirmResetPassword, { isLoading }] =
    useConfirmResetPasswordMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleResetPassword = async (data: {
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    if (data.newPassword !== data.confirmNewPassword) {
      setError('confirmNewPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      return;
    }

    try {
      await confirmResetPassword({
        resetToken: searchParams.get('reset_token') || '',
        newPassword: data.newPassword,
      }).unwrap();

      router.push('/');
    } catch (err: any) {
      toast.error(err.data.message);
    }
  };

  useEffect(() => {
    if (!searchParams.get('reset_token')) {
      return router.push('/');
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }

    return () => {
      hideLoading();
    };
  }, [isLoading]);

  return (
    <Form onSubmit={handleResetPassword} formMethods={formMethods}>
      <Controller
        name="newPassword"
        control={control}
        rules={{
          required: 'New Password is required',
          pattern: {
            value: passwordRegex,
            message:
              'Password must contain at least 8 characters, including uppercase, lowercase letters and numbers',
          },
        }}
        render={({ field }) => (
          <div className="relative">
            <Input
              {...field}
              type={'password'}
              label="New Password"
              placeholder="Enter the password"
              variant="underlined"
              radius="lg"
              isInvalid={Boolean(errors.newPassword?.message)}
              errorMessage={errors.newPassword?.message}
            />
          </div>
        )}
      />
      <Controller
        name="confirmNewPassword"
        control={control}
        rules={{
          required: 'Confirm Password is required',
          validate: value => value === newPassword || 'Passwords do not match',
        }}
        render={({ field }) => (
          <div className="relative">
            <Input
              {...field}
              type={'password'}
              label="Confirm New Password"
              placeholder="Confirm the password"
              variant="underlined"
              radius="lg"
              isInvalid={Boolean(errors.confirmNewPassword?.message)}
              errorMessage={errors.confirmNewPassword?.message}
            />
          </div>
        )}
      />
      <Button
        type="submit"
        color="primary"
        radius="full"
        className="w-full mt-7 min-h-12"
      >
        Change Password
      </Button>
    </Form>
  );
};
