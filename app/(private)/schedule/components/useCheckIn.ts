// src/app/(private)/schedule/components/useCheckIn.ts
import { useCreateShiftAttendMutation } from "@/features/schedule/scheduleApiSlice";
import { CheckInSuccessRequest, CheckinSuccessResponse } from "@/features/schedule/types";
import { useState } from "react";

export const useCheckIn = () => {
  const [createShiftAttend] = useCreateShiftAttendMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleCheckInFromQR = async (
    scheduleId: number,
    expiry: number,
    signature: string,
    username: string,
    password: string
  ): Promise<{ data?: CheckinSuccessResponse; error?: any }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Sending check-in request:", { scheduleId, expiry, signature, username, password });
      const checkInRequest: CheckInSuccessRequest = {
        scheduleId,
        expiry,
        signature,
        username,
        password,
      };

      const response = await createShiftAttend(checkInRequest).unwrap();
      console.log("Check-in response:", response);
      setIsLoading(false);
      return { data: response };
    } catch (error: any) {
      console.error("Lỗi khi check-in:", error);
      setError(error);
      setIsLoading(false);
      
      // Extract error message - priority order
      let errorMessage = "Đã xảy ra lỗi khi check-in";
      
      // 1. Check direct data.error (most common in your API)
      if (error.data && error.data.error) {
        errorMessage = error.data.error;
      } 
      // 2. Check direct message
      else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        error: { 
          message: errorMessage,
          originalError: error 
        } 
      };
    }
  };

  return { handleCheckInFromQR, isLoading, error };
};