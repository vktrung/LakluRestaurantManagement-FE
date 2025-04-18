import { getTokenFromCookie } from './token';

/**
 * Hàm này sẽ log thông tin cookie để debug
 */
export const testAuthCookie = () => {
  // Kiểm tra ở client-side
  if (typeof window !== 'undefined') {
    console.log('All Cookies:', document.cookie);
    
    // Kiểm tra token bằng cách sử dụng hàm getTokenFromCookie
    const token = getTokenFromCookie();
    console.log('Auth Token:', token);
    
    // Phân tích document.cookie trực tiếp
    const cookies = document.cookie.split('; ');
    const authTokenCookie = cookies.find(row => row.startsWith('auth_token='));
    console.log('Found auth_token in cookies:', !!authTokenCookie);
    
    if (authTokenCookie) {
      const tokenValue = authTokenCookie.split('=')[1];
      console.log('Token value length:', tokenValue.length);
      console.log('Token value starts with:', tokenValue.substring(0, 10) + '...');
    }
    
    return token ? true : false;
  }
  
  return false;
};

/**
 * Kiểm tra xem cookie có hợp lệ không
 */
export const isCookieValid = () => {
  const token = getTokenFromCookie();
  
  if (!token) {
    console.log('Cookie không hợp lệ: Token không tồn tại');
    return false;
  }
  
  // Kiểm tra xem cookie có hết hạn không 
  // Logic kiểm tra có thể thêm vào đây
  
  return true;
};

/**
 * Xóa và đặt lại token để thử nghiệm
 */
export const resetAuthCookie = () => {
  if (typeof document !== 'undefined') {
    // Xóa cookie hiện tại
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('Đã xóa auth_token cookie');
    
    // Để test, bạn có thể đặt cookie mới ở đây
    // document.cookie = `auth_token=test_token; path=/; max-age=${60 * 60 * 24}`;
    // console.log('Đã đặt auth_token cookie mới');
  }
}; 