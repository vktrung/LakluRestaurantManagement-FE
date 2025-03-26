'use client'
import { useGetMenuByIdQuery } from '@/features/menu/menuApiSlice';
import { useParams } from 'next/navigation';

const MenuItemPage = () => {
  const { id } = useParams(); // Extract 'id' from the URL parameters
  const { data, isLoading, isError, error } = useGetMenuByIdQuery(Number(id), {
    skip: !id, // Skip the query if id is not available
  });

  // Handle loading state
  if (isLoading) return <div>Loading...</div>;

  // Handle error state
 

  // If data is available, loop through the menuItems array and display each item
  if (data && data.data) {
    const menu = data.data; // This is the Menu object

    return (
      <div>
        <h1>{menu.name}</h1>
        <h2>Start: {menu.startAt} | End: {menu.endAt}</h2>
        <p>Status: {menu.status}</p>

        <h3>Menu Items:</h3>
        {menu.menuItems.length > 0 ? (
          <ul>
            {menu.menuItems.map((menuItem) => (
              <li key={menuItem.id} style={{ marginBottom: '20px' }}>
                <h4>{menuItem.dish.name}</h4>
                <p><strong>Description:</strong> {menuItem.dish.description}</p>
                <p><strong>Price:</strong> ${menuItem.price}</p>
                <p><strong>Status:</strong> {menuItem.status}</p>
                <p><strong>Created At:</strong> {menuItem.dish.createdAt}</p>
                <p><strong>Updated At:</strong> {menuItem.dish.updatedAt}</p>
                
                <div>
                  <h5>Images:</h5>
                  {menuItem.dish.images && menuItem.dish.images.length > 0 ? (
                    menuItem.dish.images.map((image) => (
                      <div key={image.id}>
                        <img src={image.link} alt={image.name} width={100} height={100} />
                        <p>{image.name}</p>
                      </div>
                    ))
                  ) : (
                    <p>No images available.</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No menu items available.</p>
        )}
      </div>
    );
  }

  return <div>No data available for this menu.</div>;
};

export default MenuItemPage;
