'use client';

import type React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useCheckIn } from '@/app/(private)/schedule/components/useCheckIn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

// Client component để sử dụng useSearchParams
function CheckInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleIdParam = searchParams.get('scheduleId');
  const expiryParam = searchParams.get('expiry');
  const signatureParam = searchParams.get('signature');

  console.log('URL Params:', { scheduleIdParam, expiryParam, signatureParam });

  const { handleCheckInFromQR } = useCheckIn();
  const [checkInStatus, setCheckInStatus] = useState<
    'idle' | 'loading' | 'success' | 'error' | 'not_logged_in'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [showPin, setShowPin] = useState<boolean>(false);

  // Fetch user data
  const {
    data: userData,
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
  } = useGetUserMeQuery();

  // References for PIN input fields
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
      setCheckInStatus('not_logged_in');
      setErrorMessage('Hãy đăng nhập trước khi quét mã QR để check in');
    }
  }, [userData, isLoadingUser, isUserError]);

  // Handle PIN input
  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = password.split('');
      newPin[index] = value;
      setPassword(newPin.join(''));

      // Move to next input if value is entered
      if (value && index < 3) {
        pinRefs[index + 1].current?.focus();
      }
    }
  };

  // Handle backspace in PIN input
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

  // Update PIN input fields when password changes
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

    if (hasCheckedIn || checkInStatus === 'not_logged_in') return;

    setCheckInStatus('loading');

    try {
      if (!scheduleIdParam || !expiryParam || !signatureParam) {
        throw new Error('Thông tin không hợp lệ!');
      }

      const scheduleIdNum = Number.parseInt(scheduleIdParam, 10);
      const expiryNum = Number.parseInt(expiryParam, 10);

      if (!username || password.length !== 4) {
        throw new Error('Vui lòng nhập mã PIN 4 số!');
      }

      console.log('Sending check-in request:', {
        scheduleId: scheduleIdNum,
        expiry: expiryNum,
        signature: signatureParam,
        username,
        password,
      });

      const result = await handleCheckInFromQR(
        scheduleIdNum,
        expiryNum,
        signatureParam,
        username,
        password,
      );
      
      if (result.error) {
        setCheckInStatus('error');
        const errorMsg = result.error.message || 'Đã xảy ra lỗi khi check-in';
        setErrorMessage(errorMsg);
        
        // Hiển thị toast thông báo lỗi
        if (errorMsg.toLowerCase().includes('cấm truy cập')) {
          toast.error('Cấm truy cập: Bạn không có trong danh sách ca làm việc này', {
            position: 'top-right',
            duration: 5000,
          });
        } else {
          toast.error(errorMsg, {
            position: 'top-right',
            duration: 3000,
          });
        }
        return;
      }
      
      // If successful
      setCheckInStatus('success');
      setErrorMessage(result.data?.message || 'Check-in thành công!');
      toast.success('Check-in thành công!', {
        position: 'top-right',
        duration: 3000,
      });
      setHasCheckedIn(true);

      // Delay redirect for animation
      setTimeout(() => {
        router.push('/schedule');
      }, 1500);
    } catch (err: any) {
      setCheckInStatus('error');
      console.error('Chi tiết lỗi trong component:', err);
      
      // Truy cập đúng thông báo lỗi từ API
      let errorMsg = 'Đã xảy ra lỗi khi check-in';
      
      if (err.data && err.data.error) {
        errorMsg = err.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setErrorMessage(errorMsg);
      
      // Hiển thị toast thông báo lỗi
      if (errorMsg.toLowerCase().includes('cấm truy cập')) {
        toast.error('Cấm truy cập: Bạn không có trong danh sách ca làm việc này', {
          position: 'top-right',
          duration: 5000,
        });
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md sm:max-w-lg"
        >
          <Card className="border border-gray-200 shadow-lg overflow-hidden">
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 space-y-6">
              <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 animate-spin" />
              <CardTitle className="text-lg sm:text-xl font-medium text-gray-800">
                Đang tải thông tin người dùng...
              </CardTitle>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md sm:max-w-lg"
      >
        <Card className="border border-gray-200 shadow-lg overflow-hidden">
          {checkInStatus === 'not_logged_in' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 space-y-6"
            >
              <div className="relative">
                <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-amber-500" />
              </div>
              <div className="text-center space-y-3">
                <CardTitle className="text-lg sm:text-xl font-medium text-gray-800">
                  Bạn chưa đăng nhập
                </CardTitle>
                <p className="text-gray-600 text-sm sm:text-base">
                  {errorMessage}
                </p>
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="mt-4 bg-gray-800 hover:bg-gray-900 text-white"
                >
                  Đăng nhập
                </Button>
              </div>
            </motion.div>
          )}

          {(checkInStatus === 'idle' ||
            (checkInStatus === 'error' && !hasCheckedIn)) && (
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-1 pb-6 pt-8">
                <CardTitle className="text-2xl font-bold text-center text-gray-800">
                  Check-in
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Nhập mã PIN của bạn để check-in
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 px-4 sm:px-6">
                <div className="space-y-3">
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
                      className="pl-10 h-11 rounded-md border-gray-300 bg-gray-100 focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition-all"
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

                <div className="space-y-3">
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
                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-lg border-gray-300 focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition-all"
                        required
                      />
                    ))}
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    Nhập mã PIN 4 số của bạn
                  </p>
                </div>

                {checkInStatus === 'error' && errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-red-600 font-medium text-sm"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </CardContent>

              <CardFooter className="px-4 sm:px-6 pb-6">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Check-in
                </Button>
              </CardFooter>
            </form>
          )}

          {checkInStatus === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gray-100 animate-ping opacity-75"></div>
                <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 animate-spin relative z-10" />
              </div>
              <div className="text-center space-y-2">
                <CardTitle className="text-lg sm:text-xl font-medium text-gray-800">
                  Đang xử lý check-in...
                </CardTitle>
                <p className="text-gray-600 text-sm sm:text-base">
                  Vui lòng đợi trong giây lát.
                </p>
              </div>
            </motion.div>
          )}

          {checkInStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 space-y-6"
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
                <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse"></div>
                <div className="relative z-10 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="h-10 w-10 sm:h-14 sm:w-14 text-green-500" />
                </div>
              </motion.div>
              <div className="text-center space-y-2">
                <CardTitle className="text-xl sm:text-2xl font-bold text-green-600">
                  Check-in thành công!
                </CardTitle>
                {errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-gray-600 text-sm sm:text-base"
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

// Fallback component khi đang loading
function CheckInLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md sm:max-w-lg">
        <Card className="border border-gray-200 shadow-lg overflow-hidden">
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 space-y-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 animate-spin" />
            </div>
            <div className="text-center">
              <CardTitle className="text-lg sm:text-xl font-medium text-gray-800">
                Đang tải...
              </CardTitle>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Page component
export default function CheckInPage() {
  return (
    <Suspense fallback={<CheckInLoading />}>
      <CheckInForm />
    </Suspense>
  );
}
