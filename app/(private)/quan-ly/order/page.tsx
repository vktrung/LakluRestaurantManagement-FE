"use client";
import { useGetReservationsQuery } from "@/features/reservation/reservationApiSlice";
import OrderPage from "./components/OrderPage";



const Order = () => {
    const { data, error, isLoading } = useGetReservationsQuery({ page: 0, size: 100 });
    
      if (isLoading) {
        return <div>Đang tải dữ liệu...</div>;
      }
    
      if (error) {
        return <div>Có lỗi xảy ra khi tải dữ liệu</div>;
      }
    
      // API trả về dạng GetReservationResponse, danh sách nằm trong thuộc tính data
      const reservations = data?.data || [];
    console.log(reservations);
    return (<div>
        <OrderPage />
    </div> );
}
 
export default Order;


