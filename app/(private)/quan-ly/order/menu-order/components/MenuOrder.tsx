'use client'
import { useGetAllMenuItemsQuery } from "@/features/menu-item/menuItemApiSlice";
import { useGetMenusQuery } from "@/features/menu/menuApiSlice";

 

export default function MenuOrderPage() {
    const { data } = useGetMenusQuery();
    console.log(data);
    return (  <div>
      <h1>Menu List</h1>
      {data && data.data.length > 0 ? (
        <ul>
          {data.data.map((menu) => (
            <li key={menu.id}>
              <h3>{menu.name}</h3>
              <p>Status: {menu.status}</p>
              <p>Start At: {new Date(menu.startAt).toLocaleDateString()}</p>
              <p>End At: {new Date(menu.endAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No menus available.</p>
      )}
    </div>)
        ;
}

