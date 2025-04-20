// src/app/(private)/schedule/components/useCheckOut.ts
import { useCreateShiftCheckoutMutation } from "@/features/schedule/scheduleApiSlice"; // Giả định mutation cho check-out
import { CheckInSuccessRequest, CheckinSuccessResponse } from "@/features/schedule/types";
import { useState } from "react";

export const useCheckOut = () => {
  const [createShiftCheckout] = useCreateShiftCheckoutMutation(); // Sử dụng mutation cho check-out
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleCheckOutFromQR = async (
    scheduleId: number,
    expiry: number,
    signature: string,
    username: string,
    password: string
  ): Promise<{ data?: CheckinSuccessResponse; error?: any }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Sending check-out request:", { scheduleId, expiry, signature, username, password });
      const checkOutRequest: CheckInSuccessRequest = {
        scheduleId,
        expiry,
        signature,
        username,
        password,
      };

      const response = await createShiftCheckout(checkOutRequest).unwrap();
      console.log("Check-out response:", response);
      setIsLoading(false);
      return { data: response };
    } catch (error: any) {
      console.error("Lỗi khi check-out:", error);
      setError(error);
      setIsLoading(false);
      
      // Extract error message - priority order
      let errorMessage = "Đã xảy ra lỗi khi check-out";
      
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

  return { handleCheckOutFromQR, isLoading, error };
};