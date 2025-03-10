'use client'

import { useGetTablesQuery } from "@/features/table/tableApiSlice";

const TableList = () => {
    
    const { data } = useGetTablesQuery();
    console.log(data);
    return (<div>
        Hello
    </div> );
}
 
export default TableList;