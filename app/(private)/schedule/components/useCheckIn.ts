// src/app/(private)/schedule/components/useCheckIn.ts
import { useCreateShiftAttendMutation } from "@/features/schedule/scheduleApiSlice";
import { CheckInSuccessRequest, CheckinSuccessResponse } from "@/features/schedule/types";

export const useCheckIn = () => {
  const [createShiftAttend] = useCreateShiftAttendMutation();

  const handleCheckInFromQR = async (
    scheduleId: number,
    expiry: number,
    signature: string,
    username: string,
    password : string
  ): Promise<CheckinSuccessResponse> => {
    try {
      console.log("Sending check-in request:", { scheduleId, expiry, signature, username,password });
      const checkInRequest: CheckInSuccessRequest = {
        scheduleId,
        expiry,
        signature,
        username,
        password ,
      };

      const response = await createShiftAttend(checkInRequest).unwrap();
      console.log("Check-in response:", response);
      return response;
    } catch (error: any) {
      console.error("Lỗi khi check-in:", error);
      throw error;
    }
  };

  return { handleCheckInFromQR };
};