// src/app/(private)/schedule/components/useCheckOut.ts
import { useCreateShiftCheckoutMutation } from "@/features/schedule/scheduleApiSlice"; // Giả định mutation cho check-out
import { CheckInSuccessRequest, CheckinSuccessResponse } from "@/features/schedule/types";

export const useCheckOut = () => {
  const [createShiftCheckout] = useCreateShiftCheckoutMutation(); // Sử dụng mutation cho check-out

  const handleCheckOutFromQR = async (
    scheduleId: number,
    expiry: number,
    signature: string,
    username: string,
    password: string
  ): Promise<CheckinSuccessResponse> => {
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
      return response;
    } catch (error: any) {
      console.error("Lỗi khi check-out:", error);
      throw error;
    }
  };

  return { handleCheckOutFromQR };
};