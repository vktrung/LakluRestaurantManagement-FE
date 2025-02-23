'use client'
import { useGetStaffQuery } from "@/features/staff/staffApiSlice";

const Staff = () => {
 const { data } = useGetStaffQuery()
    console.log('data', data)
    return (<div>
        Staff List: {data?.data?.map((staff) => (
            <div key={staff.id}>
                {staff.username}
            </div>
        ))}
        </div>
    );
}
 
export default Staff;