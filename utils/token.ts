export const getTokenFromCookie = (type = 'auth_token') => {
  // Kiểm tra xem đang ở môi trường client hay server
  if (typeof document === 'undefined') return ''; 
  
  try {
    const cookies = document.cookie.split('; ');
    let tokenCookie = null;
    
    if (type === 'auth_token') {
      tokenCookie = cookies.find(row => row.startsWith('auth_token='));
    } else {
      tokenCookie = cookies.find(row => row.startsWith('auth-refresh-token='));
    }

    // Xử lý trường hợp không tìm thấy cookie
    if (!tokenCookie) {
      console.warn(`Cookie ${type} không tìm thấy`);
      return '';
    }

    const token = tokenCookie.split('=')[1];
    
    // Kiểm tra token có giá trị hợp lệ không
    if (!token || token === 'undefined' || token === 'null') {
      console.warn(`Cookie ${type} có giá trị không hợp lệ`);
      return '';
    }
    
    return token;
  } catch (error) {
    console.error('Lỗi khi đọc cookie:', error);
    return '';
  }
};

export const clearCookies = (tokens: string[]) => {
  tokens.forEach(token => {
    document.cookie = `${token}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  });
};
