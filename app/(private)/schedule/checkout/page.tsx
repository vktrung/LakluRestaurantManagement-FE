'use client';

import type React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useCheckOut } from '@/app/(private)/schedule/components/useCheckOut';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import { toast } from 'sonner';

function CheckOutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleIdParam = searchParams.get('scheduleId');
  const expiryParam = searchParams.get('expiry');
  const signatureParam = searchParams.get('signature');

  console.log('URL Params:', { scheduleIdParam, expiryParam, signatureParam });

  const { handleCheckOutFromQR } = useCheckOut();
  const [checkOutStatus, setCheckOutStatus] = useState<
    'idle' | 'loading' | 'success' | 'error' | 'not_logged_in'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [showPin, setShowPin] = useState<boolean>(false);

  // Fetch user data
  const {
    data: userData,
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
  } = useGetUserMeQuery();

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Set username from user data when it loads
  useEffect(() => {
    if (userData && userData.data && userData.data.username) {
      setUsername(userData.data.username);
    } else if (!isLoadingUser && (isUserError || !userData)) {
      setCheckOutStatus('not_logged_in');
      setErrorMessage('Hãy đăng nhập trước khi quét mã QR để check out');
    }
  }, [userData, isLoadingUser, isUserError]);

  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = password.split('');
      newPin[index] = value;
      setPassword(newPin.join(''));

      if (value && index < 3) {
        pinRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace') {
      if (!password[index] && index > 0) {
        pinRefs[index - 1].current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      pinRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  useEffect(() => {
    const pins = password.split('');
    pins.forEach((pin, index) => {
      if (pinRefs[index].current) {
        pinRefs[index].current!.value = pin;
      }
    });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasCheckedOut || checkOutStatus === 'not_logged_in') return;

    setCheckOutStatus('loading');

    try {
      if (!scheduleIdParam || !expiryParam || !signatureParam) {
        throw new Error('Thông tin không hợp lệ!');
      }

      const scheduleIdNum = Number.parseInt(scheduleIdParam, 10);
      const expiryNum = Number.parseInt(expiryParam, 10);

      if (!username || password.length !== 4) {
        throw new Error('Vui lòng nhập mã PIN 4 số!');
      }

      console.log('Sending check-out request:', {
        scheduleId: scheduleIdNum,
        expiry: expiryNum,
        signature: signatureParam,
        username,
        password,
      });

      const result = await handleCheckOutFromQR(
        scheduleIdNum,
        expiryNum,
        signatureParam,
        username,
        password,
      );

      if (result.error) {
        setCheckOutStatus('error');
        const errorMsg = result.error.message || 'Đã xảy ra lỗi khi check-out';
        setErrorMessage(errorMsg);

        // Hiển thị toast thông báo lỗi
        if (errorMsg.toLowerCase().includes('cấm truy cập')) {
          toast.error(
            'Cấm truy cập: Bạn không có trong danh sách ca làm việc này',
            {
              position: 'top-right',
              duration: 5000,
            },
          );
        } else {
          toast.error(errorMsg, {
            position: 'top-right',
            duration: 3000,
          });
        }
        return;
      }

      // If successful
      setCheckOutStatus('success');
      setErrorMessage(result.data?.message || 'Check-out thành công!');
      toast.success('Check-out thành công!', {
        position: 'top-right',
        duration: 3000,
      });
      setHasCheckedOut(true);

      setTimeout(() => {
        router.push('/schedule');
      }, 1500);
    } catch (error: any) {
      setCheckOutStatus('error');
      console.error('Chi tiết lỗi trong component:', error);

      // Truy cập đúng thông báo lỗi từ API
      let errorMsg = 'Đã xảy ra lỗi khi check-out';

      if (error.data && error.data.error) {
        errorMsg = error.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);

      // Hiển thị toast thông báo lỗi
      if (errorMsg.toLowerCase().includes('cấm truy cập')) {
        toast.error(
          'Cấm truy cập: Bạn không có trong danh sách ca làm việc này',
          {
            position: 'top-right',
            duration: 5000,
          },
        );
      } else {
        toast.error(errorMsg, {
          position: 'top-right',
          duration: 3000,
        });
      }
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
            <div className="flex flex-col items-center justify-center py-12 px-6 space-y-4">
              <Loader2 className="h-12 w-12 text-gray-600 animate-spin" />
              <CardTitle className="text-lg font-medium text-gray-800">
                Đang tải thông tin người dùng...
              </CardTitle>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
          {checkOutStatus === 'not_logged_in' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 px-6 space-y-4"
            >
              <div className="relative">
                <AlertCircle className="h-12 w-12 text-amber-500" />
              </div>
              <div className="text-center space-y-2">
                <CardTitle className="text-lg font-medium text-gray-800">
                  Bạn chưa đăng nhập
                </CardTitle>
                <p className="text-sm text-gray-500">{errorMessage}</p>
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="mt-4 bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Đăng nhập
                </Button>
              </div>
            </motion.div>
          )}

          {(checkOutStatus === 'idle' ||
            (checkOutStatus === 'error' && !hasCheckedOut)) && (
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-2 pt-6 pb-4 px-6">
                <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                  Check-out
                </CardTitle>
                <CardDescription className="text-center text-gray-500">
                  Nhập mã PIN của bạn để check-out
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 px-6 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700"
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      disabled={true}
                      className="h-12 rounded-lg border-gray-300 bg-gray-100 focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition-all pl-10 text-base"
                      required
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="pin"
                      className="text-sm font-medium text-gray-700"
                    >
                      Mã PIN (4 số)
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-gray-500"
                      onClick={() => setShowPin(!showPin)}
                    >
                      {showPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {[0, 1, 2, 3].map(index => (
                      <Input
                        key={index}
                        ref={pinRefs[index]}
                        type={showPin ? 'text' : 'password'}
                        inputMode="numeric"
                        maxLength={1}
                        onChange={e => handlePinChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg font-medium rounded-lg border-gray-300 focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition-all"
                        required
                      />
                    ))}
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    Nhập mã PIN 4 số của bạn
                  </p>
                </div>

                {checkOutStatus === 'error' && errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-red-600 text-sm font-medium"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </CardContent>

              <CardFooter className="px-6 pb-6">
                <Button
                  type="submit"
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-base"
                >
                  Check-out
                </Button>
              </CardFooter>
            </form>
          )}

          {checkOutStatus === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 px-6 space-y-4"
            >
              <Loader2 className="h-12 w-12 text-gray-600 animate-spin" />
              <div className="text-center space-y-2">
                <CardTitle className="text-lg font-medium text-gray-800">
                  Đang xử lý check-out...
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Vui lòng đợi trong giây lát.
                </p>
              </div>
            </motion.div>
          )}

          {checkOutStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex flex-col items-center justify-center py-12 px-6 space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
                className="relative"
              >
                <div className="relative h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </motion.div>
              <div className="text-center space-y-2">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Check-out thành công!
                </CardTitle>
                {errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-gray-500"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

function CheckOutLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className="border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
          <div className="flex flex-col items-center justify-center py-12 px-6 space-y-4">
            <Loader2 className="h-12 w-12 text-gray-600 animate-spin" />
            <div className="text-center">
              <CardTitle className="text-lg font-medium text-gray-800">
                Đang tải...
              </CardTitle>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CheckOutPage() {
  return (
    <Suspense fallback={<CheckOutLoading />}>
      <CheckOutForm />
    </Suspense>
  );
}
