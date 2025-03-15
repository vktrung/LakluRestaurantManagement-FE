"use client";

import { useGetReservationsQuery } from "@/features/reservation/reservationApiSlice"; // Điều chỉnh path cho phù hợp
import ReservationList from "./components/ReservationList";

const ReservationPage = () => {
  // Sử dụng hook để fetch data từ API
  const { data, error, isLoading } = useGetReservationsQuery();

  if (isLoading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div>Có lỗi xảy ra khi tải dữ liệu</div>;
  }

  // API trả về dạng GetReservationResponse, danh sách nằm trong thuộc tính data
  const reservations = data?.data || [];

  return (
    <div>
      <ReservationList reservations={reservations} />
      {/* <div> */}
        {/* <h1>Hellp</h1> */}
      {/* </div> */}
    </div>
  );
};

export default ReservationPage;